import mongoose from "mongoose";
import { uploadFile } from "../../config/cloudinary/cloudinary.config.js";

export const uploadMedia = async (req, res) => {
  try {
    if (!req.body.image && !req.body.video) {
      return res.status(400).json({ error: "Either image or video is required" });
    }

    let downloadUrl;
    if (req.body.image) {
      const image = req.body.image;
      downloadUrl = await uploadFile(image);
    } else if (req.body.video) {
      const video = req.body.video;
      downloadUrl = await uploadFile(video);
    }

    res.status(200).json({ downloadUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error.message });
  }
};