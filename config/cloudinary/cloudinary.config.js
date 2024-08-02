import fs from 'fs';
// import { v2 as cloudinary } from 'cloudinary';
 
import Video from '../../models/video.model.js'; // Import your Video model
  
import cloudinary from './config.js';





const calculateBitrate = (fileSizeBytes, durationSeconds) => {
  return (fileSizeBytes * 8) / (durationSeconds * 1024);
};

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const retryUpload = async (uploadFunc, filePath, uploadOptions, retries = 0, delay = INITIAL_RETRY_DELAY) => {
  try {
    return await uploadFunc(filePath, uploadOptions);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(`Retrying upload... Attempt ${retries + 1}`);
      await new Promise(res => setTimeout(res, delay));
      return retryUpload(uploadFunc, filePath, uploadOptions, retries + 1, delay * 2);
    }
    throw error;
  }
};

const uploadVideo = (filePath, id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: 'video',
        folder: `${id}/videos`, // Specify the folder name here
        eager: [
          { streaming_profile: "full_hd", format: "m3u8" },
          { streaming_profile: "sd", format: "m3u8" },
          { streaming_profile: "hd", format: "mpd" }
        ],
        eager_async: true,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};

export const uploadFile = async (filePath,id) => {
  try {
     

    const uploadResult = await uploadVideo(filePath,id);
    // Perform the upload with retry logic
    // const uploadResult = await retryUpload(cloudinary.uploader.upload_large  , filePath, uploadOptions);

    // Log the result for debugging
    console.log('Cloudinary upload result:', uploadResult);

    const { public_id } = uploadResult;

    const stats = fs.statSync(filePath);
    const fileSizeBytes = stats.size;

    // Placeholder duration. Replace with actual duration retrieval logic if needed.
    const durationSeconds = 60;

    const bitrate = calculateBitrate(fileSizeBytes, durationSeconds);

    const representations = [
      { resolution: '240p', bitrate: Math.min(bitrate, 400) },
      { resolution: '360p', bitrate: Math.min(bitrate, 800) },
      { resolution: '480p', bitrate: Math.min(bitrate, 1200) },
      { resolution: '720p', bitrate: Math.min(bitrate, 2500) },
      { resolution: '1080p', bitrate: Math.min(bitrate, 5000) },
    ];

    const hlsUrl = cloudinary.url(public_id, { resource_type: 'video', format: 'm3u8' });
    const dashUrl = cloudinary.url(public_id, { resource_type: 'video', format: 'mpd' });

    return {
      public_id,
      hlsUrl,
      dashUrl,
      uploadResult,
      representations
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(`Error uploading file: ${error.message}`);
  }
};

export const uploadImage = async (filePath,id) => {
  try {
    const uploadOptions = {
      resource_type: 'image',
      folder: `${id}/images`, // Specify the folder name here
      transformation: [{ crop: 'limit' }, { quality: 'auto' }],
      eager_async: true,
      timeout: 600000 // 10 minutes timeout for large files
    };

    // Perform the upload with retry logic
    const uploadResult = await retryUpload(cloudinary.uploader.upload, filePath, uploadOptions);

    // Log the result for debugging
    console.log('Cloudinary upload result:', uploadResult);

    const { public_id, secure_url: imageUrl } = uploadResult;

    const stats = fs.statSync(filePath);
    const fileSizeBytes = stats.size;

    return {
      public_id,
      imageUrl,
      uploadResult,
      fileSizeBytes
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extract the relevant part of the URL after 'upload/'
    const urlPart = imageUrl.split('upload/')[1];

    // Split by '/' and remove the first element which is the version part
    const parts = urlPart.split('/');
    parts.shift(); // Remove the version part

    // Join the remaining parts and remove the file extension
    const publicId = parts.join('/').split('.').slice(0, -1).join('.');

    console.log('publicId:', publicId);

    // Delete the image from Cloudinary
    const deletionResult = await cloudinary.uploader.destroy(publicId);
    console.log('deletionResult:', deletionResult);

    // Check if the deletion was successful
    if (deletionResult.result === 'ok') {
      console.log('Image deleted from Cloudinary');
    } else {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // throw new Error(Error deleting image from Cloudinary: ${error.message});
  }
};


export const deleteVideoFromCloudinary = async (videoUrl) => {
  const maxRetries = 3; // Maximum number of retry attempts
  const retryDelay = 2000; // Delay between retries in milliseconds

  const extractPublicId = (url) => {
    const urlPart = url.split('upload/')[1];
    const parts = urlPart.split('/');
    parts.shift(); // Remove the version part
    return parts.join('/').split('.').slice(0, -1).join('.');
  };

  const tryDelete = async (publicId, attempt = 1) => {
    try {
      const deletionResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });

      if (deletionResult.result === 'ok') {
        console.log('Video deleted from Cloudinary');
        return;
      } else {
        throw new Error('Failed to delete video from Cloudinary:', deletionResult.result);
      }
    } catch (error) {
      if (attempt < maxRetries && error.message.includes('Timeout waiting for parallel processing')) {
        console.log(`Retry attempt ${attempt} for deleting video from Cloudinary`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return tryDelete(publicId, attempt + 1);
      } else {
        console.error('Error deleting video from Cloudinary:', error);
        throw new Error(`Error deleting video from Cloudinary: ${error.message}`);
      }
    }
  };

  try {
    const publicId = extractPublicId(videoUrl);
    console.log('publicId:', publicId);

    await tryDelete(publicId);
  } catch (error) {
    console.error('Error deleting video from Cloudinary:', error);
    throw new Error(`Error deleting video from Cloudinary: ${error.message}`);
  }
};