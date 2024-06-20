import express from 'express';
import {
  handleJoiningFeePayment,
  handleSubscription,
  addOrUpdateUserData,
  addOrUpdateAddress,
  addOrUpdateSocialLinks,
  updateBio,
  updateResume,
  updatePortfolio,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addSkill,
  updateSkill,
  deleteSkill,
  addCertification,
  updateCertification,
  deleteCertification,
  addProject,
  updateProject,
  deleteProject,
  addUrlToProject,
  updateUrlInProject,
  removeProjectURL,
  addOrUpdateVideoDetails,
  withdrawJobApplicant,
  applyJobApplication,
  toggleSaveJobApplication,
  addOrUpdateIndustry,
  addOrUpdateInterestedCompanies,
  getUserDetailsFromToken,
  getUserDetailsById,
  getUserDetailsByIdandSimilarUser,
  getSimilarUsers,
  addPositionToExperience,
  updatePositionInExperience,
  deletePositionInExperience,
  addIntroVideo,
  updateIntroVideo,
  deleteIntroVideo
} from '../../../controllers/individualUser.controller/individualUser.js';
import { upload } from '../../../config/multer.js';

const router = express.Router();




// Payment Routes
router.post('/payment/joining-fee', handleJoiningFeePayment);
// router.post('/payment/subscription', handleSubscription); 

// User Data Routes
router.post('/data', addOrUpdateUserData);
router.post('/address', addOrUpdateAddress);
router.post('/social-links', addOrUpdateSocialLinks);
router.post('/bio', updateBio);
router.post('/resume', updateResume);
router.post('/portfolio', updatePortfolio);

// Education Routes
router.post('/education', addEducation);
router.put('/education/:id', updateEducation);
router.delete('/education/:id', deleteEducation);


// Experience routes
router.post('/experience', addExperience);
router.put('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);

// Position routes within experience
router.post('/experience/:id/position', addPositionToExperience);
router.put('/experience/:experienceId/position/:positionId', updatePositionInExperience);
router.delete('/experience/:experienceId/position/:positionId', deletePositionInExperience);

// Skill Routes
router.post('/skill', addSkill);
router.put('/skill/:id', updateSkill);
router.delete('/skill/:id', deleteSkill);

// Certification Routes
router.post('/certification', addCertification);
router.put('/certification/:id', updateCertification);
router.delete('/certification/:id', deleteCertification);

// Project Routes
router.post('/project', addProject);
router.put('/project/:id', updateProject);
router.delete('/project/:id', deleteProject);
router.post('/project/:id/url', addUrlToProject);
router.put('/project/:id/url/:urlId', updateUrlInProject);
router.delete('/project/:id/url/:urlId', removeProjectURL);

// Video Details Route
router.post('/video-details/:id', addOrUpdateVideoDetails);

//Intro Video 
router.post('/intro-video/add',upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), addIntroVideo);
router.put('/intro-video/update',upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]),  updateIntroVideo);
router.delete('/intro-video/delete', deleteIntroVideo);


// Job Application Routes
router.post('/jobs/:id/apply', applyJobApplication);
router.post('/jobs/:jobId/applicants/', withdrawJobApplicant);
router.post('/jobs/:id/toggle-save', toggleSaveJobApplication);

// Industry and Companies Routes
router.post('/industry', addOrUpdateIndustry);
router.post('/interested-companies', addOrUpdateInterestedCompanies);

// User Details Routes
router.get('/details/token', getUserDetailsFromToken); 
router.get('/users/:userId', getUserDetailsById);
router.get('/users/:userId/similar', getUserDetailsByIdandSimilarUser);
router.post('/users/similar', getSimilarUsers);

 

export default router;
