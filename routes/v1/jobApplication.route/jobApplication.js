import express from 'express';
import {     addJobApplication,
    editJobApplicationDetails,
    // editJobApplicationVideo,
    // editJobApplicationImage,
    deleteJobApplication, 
    getAllJobApplications,
    getSimilarJobApplications,
    getSimilarJobApplicationsFromId,
    getJobApplicationDetails,
    getJobApplicationDetailsForPoster} from '../../../controllers/organization.controller/jobApplication.controller.js';
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


// Route to get all job applications
router.get('/applications', getAllJobApplications);

// Route to get similar job applications based on query parameters with pagination
router.get('/applications/similar', getSimilarJobApplications);

// Route to get similar job applications based on job application ID with pagination
router.get('/applications/:id/similar', getSimilarJobApplicationsFromId);

// Route to get job application details by ID
router.get('/applications/:id', getJobApplicationDetails);

router.get('/org/applications/:id', getJobApplicationDetailsForPoster);


export default router;
