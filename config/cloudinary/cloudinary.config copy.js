import { v2 as cloudinary } from 'cloudinary';
import https from 'https';
import fs from 'fs';

cloudinary.config({
  cloud_name: 'dgcbwb05z',
  api_key: '435731717564535',
  api_secret: 'tFkIMXJi1SRVJW02U-npU6dXLRU'
});

const filePath = '/home/mujahed/Downloads/unwrapped-Mohd-Mujahed.mp4';
const outputPath = '/media/mujahed/Mujahed USB/hiyer-server/media/compressed2.mp4'; // Define the output file path

const uploadOptions = {
  resource_type: 'auto',
  transformation: { 
    quality: 'auto:eco',
  },
};

const isImage = filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png');
const isVideo = filePath.endsWith('.mp4') || filePath.endsWith('.mov') || filePath.endsWith('.avi');  

if (isImage) {
    // For images
    cloudinary.uploader.upload(filePath, uploadOptions)
      .then(uploadResult => {
        let downloadUrl = uploadResult.url;
        if (downloadUrl.startsWith('http://')) {
          downloadUrl = downloadUrl.replace('http://', 'https://');
        }
        console.log('Compressed image download URL:', downloadUrl);
  
        // Download the compressed image
        const fileStream = fs.createWriteStream(outputPath);
        https.get(downloadUrl, response => {
          response.pipe(fileStream);
          fileStream.on('finish', () => {
            console.log('Compressed image downloaded successfully!');
          });
        }).on('error', error => {
          console.error('Error downloading image:', error);
        });
      })
      .catch(error => {
        console.error('Error uploading image:', error);
      });
  } else if (isVideo) {
    // For videos
    cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      eager: { format: 'mp4', eager_async: true }, // Specify the desired format and eager_async=true
    })
    .then(uploadResult => {
      let downloadUrl = uploadResult.eager[0].url;
      if (downloadUrl.startsWith('http://')) {
        downloadUrl = downloadUrl.replace('http://', 'https://');
      }
      console.log('Compressed video download URL:', downloadUrl);
  
      // Download the compressed video
      const fileStream = fs.createWriteStream(outputPath);
      https.get(downloadUrl, response => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          console.log('Compressed video downloaded successfully!');
        });
      }).on('error', error => {
        console.error('Error downloading video:', error);
      });
    })
    .catch(error => {
      console.error('Error uploading video:', error);
    });
  } else {
    console.error('Unsupported file format');
  }
  