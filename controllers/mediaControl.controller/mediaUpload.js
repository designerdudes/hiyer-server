import mongoose from "mongoose";
import { deleteImageFromCloudinary, deleteVideoFromCloudinary, uploadFile, uploadImage } from "../../config/cloudinary/cloudinary.config.js";
import Video from "../../models/video.model.js";
import Image from "../../models/image.model.js";
import path from "path";
import jwt from 'jsonwebtoken';
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import User from "../../models/user.model.js";




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
    const uploadResult = await uploadFile(videoPath, userId);

    let newImage;
    if (image && image.length > 0) {
      const imagePath = path.resolve(image[0].path);
      console.log('Uploading image file:', imagePath);
      const uploadResult1 = await uploadImage(imagePath, userId);

      newImage = new Image({
        imageUrl: uploadResult1.imageUrl,
        transformations: [{ quality: 'auto' }],
        postedBy: userId,
      });

      await newImage.save();
    }

    console.log('newImage', newImage);

    // Create a new Video document
    const newVideo = new Video({
      videoUrl: uploadResult.uploadResult.secure_url,
      thumbnailUrl: newImage ? newImage._id : null, // Set thumbnail if image uploaded
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
    const updatedUser = await IndividualUser.findByIdAndUpdate(
      userId,
      {
        $push: {
          videoResume: {
            videoRef: newVideo._id,
            videoTitle: videoTitle || '',
            videoDescription: videoDescription || '',
          },
        },
      },
      { new: true } // Return the updated document
    );
    console.log('updatedUser', updatedUser);

    res.status(200).send({ ok: true, video_id: newVideo._id, user: updatedUser });
  } catch (error) {
    console.error('Error uploading file uploadMedia:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: `Error uploading file: ${error.message}` });
    }
  }
};



export const deleteMediaForIndividualUsers = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Get user ID from token
    const { videoId } = req.params; // Assuming videoId is passed in the request param

    // Find the individual user profile
    const user = await IndividualUser.findById(userId).populate('videoResume.videoRef');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const videoResumeIndex = user.videoResume.findIndex(v => v.videoRef._id.toString() === videoId);
    if (videoResumeIndex === -1) {
      return res.status(404).json({ error: 'Video resume not found' });
    }

    const videoResume = user.videoResume[videoResumeIndex];

    // Delete associated video media
    if (videoResume.videoRef) {
      await deleteMedia(videoResume.videoRef._id); // Assuming deleteMedia function deletes the file from storage
      await Video.findByIdAndDelete(videoResume.videoRef._id);


    }

    // Update user document to remove the specific video resume entry
    user.videoResume.splice(videoResumeIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Video resume deleted successfully', user });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'An error occurred while deleting media' });
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
console.log(req.files.image[0].path)
  const userId = decodedToken.id;

  try {
    // Check if an image is provided
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const uploadResult = await uploadImage(req.files.image[0].path, userId);

    const newImage = new Image({
      imageUrl: uploadResult.imageUrl,
      transformations: [
        { width: 800, height: 800, quality: 'auto' }
      ],
      postedBy: userId
    });

    await newImage.save();

     // Update the user's profilePicture field with the new image ID
     await User.findByIdAndUpdate(userId, { profilePicture: newImage._id });
console.log(newImage._id)
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
    const uploadResult = await uploadFile(videoPath, userId);
    console.log('Uploading .secure_url  :', uploadResult.uploadResult.secure_url, uploadResult);

    let newImage;
    if (image && image.length > 0) {
      const imagePath = path.resolve(image[0].path);
      console.log('Uploading image file:', imagePath);
      const uploadResult1 = await uploadImage(imagePath, userId);

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
      videoUrl: uploadResult.secure_url || uploadResult.uploadResult.secure_url,
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


    // Return the media result
    return { video_id: newVideo._id, image_id: newImage ? newImage._id : null };
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





// Function to update all video URLs
export const updateAllVideoUrls = async (req, res) => {
  try {
    const updatedVideos = await Video.updateMany({}, {
      $set: {
        videoUrl: 'https://res.cloudinary.com/dgcbwb05z/video/upload/v1717288451/yaizoigumu5eu5ld7owr.mp4'
      }
    });
    res.status(200).json({
      message: 'All video URLs have been updated successfully',
      updatedCount: updatedVideos.nModified
    });
  } catch (error) {
    console.error('Error updating video URLs:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
};

// Function to update all image URLs
export const updateAllImageUrls = async (req, res) => {
  try {
    const updatedImages = await Image.updateMany({}, {
      $set: {
        'imageUrl': 'https://res.cloudinary.com/dgcbwb05z/image/upload/v1714989757/samples/coffee.jpg'
      }
    });
    res.status(200).json({
      message: 'All image URLs have been updated successfully',
      updatedCount: updatedImages.nModified
    });
  } catch (error) {
    console.error('Error updating image URLs:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message
    });
  }
};


export const uploadProfilePicture = async (req, res) => {
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
    if (!req.files || !req.files.image || req.files.image.length === 0) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imageFile = req.files.image[0];
    const uploadResult = await uploadImage(imageFile, userId);

    const newImage = new Image({
      imageUrl: uploadResult.imageUrl,
      transformations: [
        { width: 800, height: 800, quality: 'auto' }
      ],
      postedBy: userId
    });

    await newImage.save();

    // Update user's profilePicture with the new image ID
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: newImage._id },
      { new: true }
    );

    // Respond with the download URL and image ID
    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      downloadUrl: uploadResult.imageUrl,
      image_id: newImage._id,
      user
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'An error occurred while uploading the image' });
  }
};

