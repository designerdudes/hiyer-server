import express from 'express';
import {     addJobApplication,
    editJobApplicationDetails,
    // editJobApplicationVideo,
    // editJobApplicationImage,
    deleteJobApplication } from '../../../controllers/organization.controller/jobApplication.controller.js';
// import { upload } from '../../../config/multer.js';
 
import multer from 'multer';

const upload = multer({ dest: 'uploads/' }); // Set up multer with appropriate storage settings

const router = express.Router();

router.post('/add', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), addJobApplication);

// Route to edit job application details
router.put('/edit/:id', editJobApplicationDetails);

// // Route to edit job application video
// router.put('/edit-video/:id',upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), editJobApplicationVideo);

// // Route to edit job application image
// router.put('/edit-image/:id',upload.fields([ { name: 'image', maxCount: 1 }]), editJobApplicationImage);

// Route to delete a job application
router.delete('/delete/:id', deleteJobApplication);

export default router;
