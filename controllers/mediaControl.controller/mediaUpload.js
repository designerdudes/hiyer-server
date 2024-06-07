import mongoose from "mongoose";
import { uploadFile, uploadImage } from "../../config/cloudinary/cloudinary.config.js";
import Video from "../../models/video.model.js";
import Image from "../../models/image.model.js";
import path from "path";
import jwt from 'jsonwebtoken';
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";




// Function to get user ID from token
const getUserIdFromToken = (req) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  return decodedToken.id;
};


export const uploadMediaForIndividualUsers = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Get user ID from token
    const { timestamps, continueWithoutTimestamps, videoTitle, videoDescription } = req.body;
    const { video, image } = req.files;

    if (!video || video.length === 0) {
      return res.status(400).json({ error: "Video is required" });
    }

    // Resolve the absolute path for the video file
    const videoPath = path.resolve(video[0].path);
    console.log('Uploading video file:', videoPath);
    const uploadResult = await uploadFile(videoPath);

    let newImage;
    if (image && image.length > 0) {
      const imagePath = path.resolve(image[0].path);
      console.log('Uploading image file:', imagePath);
      const uploadResult1 = await uploadImage(imagePath);

      newImage = new Image({
        imageUrl: uploadResult1.imageUrl,
        transformations: [{ width: 800, height: 800, quality: 'auto' }],
        postedBy: userId,
      });

      await newImage.save();
    }

    console.log('newImage', newImage);

    // Create a new Video document
    const newVideo = new Video({
      videoUrl: uploadResult.uploadResult.secure_url,
      thumbnailUrl: newImage ? newImage._id : null,
      streamingUrls: {
        hls: uploadResult.uploadResult.hlsUrl,
        dash: uploadResult.uploadResult.dashUrl,
      },
      representations: uploadResult.uploadResult.representations,
      postedBy: userId, 
    });

    if (!continueWithoutTimestamps && timestamps) {
      newVideo.chapters = JSON.parse(timestamps).map(timestamp => ({
        from: timestamp.from,
        to: timestamp.to,
        chapterTitle: timestamp.chapterTitle || '',
        description: timestamp.description || '',
      }));
    }

    await newVideo.save();
    console.log('newVideo', newVideo);

    // Update IndividualUser with the new video reference
    await IndividualUser.findByIdAndUpdate(
      userId,
      {
        $push: {
          postedVideos: {
            videoRef: newVideo._id,
            videoTitle: videoTitle || '',
            videoDescription: videoDescription || '',
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).send({ ok: true, video_id: newVideo._id });
  } catch (error) {
    console.error('Error uploading file uploadMedia:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: `Error uploading file: ${error.message}` });
    }
  }
};




export const uploadImageController = async (req, res) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = decodedToken.id;

  try {
    // Check if an image is provided
    if (!req.file || !req.file.image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const uploadResult = await uploadImage(req.file.image);

    const newImage = new Image({
      imageUrl: uploadResult.imageUrl,
      transformations: [
        { width: 800, height: 800, quality: 'auto' }
      ],
      postedBy: userId
    });

    await newImage.save();

    // Respond with the download URL and image ID
    res.status(200).json({
      downloadUrl: uploadResult.imageUrl,
      image_id: newImage._id
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'An error occurred while uploading the image' });
  }
};



export const uploadMedia = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Get user ID from token
    const { timestamps, continueWithoutTtimestamps } = req.body;
    const { video, image } = req.files;

    if (!video || video.length === 0) {
      return res.status(400).json({ error: "Video is required" });
    }

    // Resolve the absolute path for the video file
    const videoPath = path.resolve(video[0].path);
    console.log('Uploading video file:', videoPath);
    const uploadResult = await uploadFile(videoPath);

    let newImage;
    if (image && image.length > 0) {
      const imagePath = path.resolve(image[0].path);
      console.log('Uploading image file:', imagePath);
      const uploadResult1 = await uploadImage(imagePath);

      newImage = new Image({
        imageUrl: uploadResult1.imageUrl,
        transformations: [{ width: 800, height: 800, quality: 'auto' }],
        postedBy: userId,

      });

      await newImage.save();
    }

    console.log('newImage', newImage);

    // Create a new Video document
    const newVideo = new Video({
      videoUrl: uploadResult.secure_url,
      thumbnailUrl: newImage ? newImage._id : null,
      streamingUrls: {
        hls: uploadResult.hlsUrl,
        dash: uploadResult.dashUrl,
      },
      representations: uploadResult.representations,
      postedBy: userId,
    });

    if (!continueWithoutTtimestamps && timestamps) {
      newVideo.chapters = JSON.parse(timestamps).map(timestamp => ({
        from: timestamp.from,
        to: timestamp.to,
        chapterTitle: timestamp.chapterTitle,
        description: timestamp.description || '',
      }));
    }

    await newVideo.save();
    console.log('newVideo', newVideo);

    // Update IndividualUser with the new video reference


    res.status(200).send({ ok: true, video_id: newVideo._id });
  } catch (error) {
    console.error('Error uploading file uploadMedia:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: `Error uploading file: ${error.message}` });
    }
  }
};


export const editThumbnail = async (req, res) => {
  try {
    const { id } = req.params; // Get video ID from request parameters
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Check if req.file.image exists
    if (req.file && req.file.image) {
      let uploadResult1;
      // Upload the new thumbnail image to Cloudinary
      try {
        uploadResult1 = await uploadImageToCloudinary(req.file.image);
      } catch (uploadError) {
        console.error('Error uploading image to Cloudinary:', uploadError);
        return res.status(500).json({ error: "Failed to upload image" });
      }

      // Check if the video has an existing thumbnail
      if (video.thumbnailUrl) {
        // Get the existing image document
        const image = await Image.findById(video.thumbnailUrl);
        if (image) {
          // Delete the existing image from Cloudinary
          try {
            await deleteImageFromCloudinary(image.imageUrl);
          } catch (deleteError) {
            console.error('Error deleting image from Cloudinary:', deleteError);
            return res.status(500).json({ error: "Failed to delete existing image" });
          }
          // Remove the existing image document from the database
          try {
            await Image.findByIdAndDelete(video.thumbnailUrl);
          } catch (deleteError) {
            console.error('Error deleting image document:', deleteError);
            return res.status(500).json({ error: "Failed to delete existing image document" });
          }
        }
      }

      // Update the video document with the new thumbnail URL
      video.thumbnailUrl = uploadResult1.imageUrl;
    }

    // Save the updated video document
    await video.save();

    // Respond with the updated video document
    res.status(200).json(video);
  } catch (error) {
    console.error('Error editing media:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteMedia = async (videoId) => {
  try {
    const video = await Video.findById(videoId);

    if (!video) {
      return { status: 404, message: "Video not found" };
    }

    // Check if the video has a thumbnail
    if (video.thumbnailUrl) {
      // Get the thumbnail image document
      const image = await Image.findById(video.thumbnailUrl);
      if (image) {
        // Delete the thumbnail image from Cloudinary
        try {
          await deleteImageFromCloudinary(image.imageUrl);
        } catch (deleteError) {
          console.error('Error deleting thumbnail image from Cloudinary:', deleteError);
          return { status: 500, message: "Failed to delete thumbnail image from Cloudinary" };
        }
        // Remove the thumbnail image document from the database
        try {
          await Image.findByIdAndDelete(video.thumbnailUrl);
        } catch (deleteError) {
          console.error('Error deleting thumbnail image document:', deleteError);
          return { status: 500, message: "Failed to delete thumbnail image document" };
        }
      }
    }

    // Delete the video from Cloudinary
    try {
      await deleteVideoFromCloudinary(video.videoUrl);
    } catch (deleteError) {
      console.error('Error deleting video from Cloudinary:', deleteError);
      return { status: 500, message: "Failed to delete video from Cloudinary" };
    }

    // Remove the video document from the database
    await Video.findByIdAndDelete(videoId);

    return { status: 200, message: "Video deleted successfully" };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { status: 500, message: error.message };
  }
};