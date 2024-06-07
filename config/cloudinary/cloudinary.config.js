import fs from 'fs';
// import { v2 as cloudinary } from 'cloudinary';
import ffmpeg from 'fluent-ffmpeg';
import Video from '../../models/video.model.js'; // Import your Video model
import Ffmpeg from 'fluent-ffmpeg';
import getVideoDurationInSeconds from 'get-video-duration';
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


const uploadVideo = (filePath, uploadOptions) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      filePath,
      {
        resource_type: 'video', 
        eager: [
          { streaming_profile: "full_hd", format: "m3u8" },
          { streaming_profile: "sd", format: "m3u8" },
          { streaming_profile: "hd", format: "mpd" }],
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

export const uploadFile = async (filePath) => {
  try {
    const uploadOptions = {
      resource_type: 'video',
      eager: [
        { streaming_profile: "full_hd", format: "m3u8" },
        { streaming_profile: "sd", format: "m3u8" },
        { streaming_profile: "hd", format: "mpd" }],
      eager_async: true,
    };

    const uploadResult = await uploadVideo(filePath, uploadOptions);
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

export const uploadImage = async (filePath) => {
  try {
    const uploadOptions = {
      resource_type: 'image',
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



// Function to delete an image from Cloudinary
export const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extract the public ID from the image URL
    const publicId = imageUrl.split('/').pop().split('.')[0];

    // Delete the image from Cloudinary
    const deletionResult = await cloudinary.v2.uploader.destroy(publicId);

    // Check if the deletion was successful
    if (deletionResult.result === 'ok') {
      console.log('Image deleted from Cloudinary');
    } else {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    throw error;
  }
};

// Function to delete a video from Cloudinary
export const deleteVideoFromCloudinary = async (videoUrl) => {
  try {
    // Extract the public ID from the video URL
    const publicId = videoUrl.split('/').pop().split('.')[0];

    // Delete the video from Cloudinary
    const deletionResult = await cloudinary.v2.uploader.destroy(publicId, { resource_type: 'video' });

    // Check if the deletion was successful
    if (deletionResult.result === 'ok') {
      console.log('Video deleted from Cloudinary');
    } else {
      throw new Error('Failed to delete video from Cloudinary');
    }
  } catch (error) {
    throw error;
  }
};