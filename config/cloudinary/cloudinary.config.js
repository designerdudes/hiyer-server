// uploadController.js

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dgcbwb05z',
  api_key: '435731717564535',
  api_secret: 'tFkIMXJi1SRVJW02U-npU6dXLRU'
});

export const uploadFile = async (filePath) => {
  try {
    let uploadResult;
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
      // For images
      uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'auto', transformation: { quality: 'auto:eco' } });
    } else if (filePath.endsWith('.mp4') || filePath.endsWith('.mov') || filePath.endsWith('.avi')) {
      // For videos
      uploadResult = await cloudinary.uploader.upload(filePath, { resource_type: 'video', eager: { format: 'mp4', eager_async: true } });
    } else {
      throw new Error('Unsupported file format');
    }
    
    let downloadUrl;
    if (uploadResult.eager && uploadResult.eager[0] && uploadResult.eager[0].url) {
      downloadUrl = uploadResult.eager[0].url;
    } else if (uploadResult.url) {
      downloadUrl = uploadResult.url;
    } else {
      throw new Error('Download URL not found in upload result');
    }

    if (downloadUrl.startsWith('http://')) {
      downloadUrl = downloadUrl.replace('http://', 'https://');
    }

    return downloadUrl;
  } catch (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }
};
