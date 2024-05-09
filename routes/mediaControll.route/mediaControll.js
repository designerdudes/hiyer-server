import express from 'express';
import { uploadMedia } from '../../controllers/mediaControl.controller/mediaUpload.js';
 
const router = express.Router();

// Route for adding or updating user data
router.post('/upload', uploadMedia);
 

export default router;
