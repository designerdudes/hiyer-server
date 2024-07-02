import express from 'express';
import {     addJobAds,
    editJobAdsDetails,
    // editJobAdsVideo,
    // editJobAdsImage,
    deleteJobAds, 
    getAllJobAdss,
    getSimilarJobAdss,
    getSimilarJobAdssFromId,
    getJobAdsDetails,
    getJobAdsDetailsForPoster} from '../../../controllers/organization.controller/jobAds.controller.js';
// import { upload } from '../../../config/multer.js';
 
import multer from 'multer';

const upload = multer({ dest: 'uploads/' }); // Set up multer with appropriate storage settings

const router = express.Router();

router.post('/add', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), addJobAds);

// Route to edit job application details
router.put('/edit/:id', editJobAdsDetails);

// // Route to edit job application video
// router.put('/edit-video/:id',upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), editJobAdsVideo);

// // Route to edit job application image
// router.put('/edit-image/:id',upload.fields([ { name: 'image', maxCount: 1 }]), editJobAdsImage);

// Route to delete a job application
router.delete('/delete/:id', deleteJobAds);


// Route to get all job applications
router.get('/applications', getAllJobAdss);

// Route to get similar job applications based on query parameters with pagination
router.get('/applications/similar', getSimilarJobAdss);

// Route to get similar job applications based on job application ID with pagination
router.get('/applications/:id/similar', getSimilarJobAdssFromId);

// Route to get job application details by ID
router.get('/applications/:id', getJobAdsDetails);

router.get('/org/applications/:id', getJobAdsDetailsForPoster);


export default router;
