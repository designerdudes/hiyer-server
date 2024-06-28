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
  deleteIntroVideo,
  applyBulkJobApplications,
  getUserAppliedJobPostings,
  getCurrentUserAppliedJobPostings,
  getCurrentUserPendingJobs,
  getCurrentUserShortlistedJobs,
  getCurrentUserSelectedJobs,
  getCurrentUserRejectedJobs,
  getUserPendingJobs,
  getUserShortlistedJobs,
  getUserSelectedJobs,
  getUserRejectedJobs,
  getCurrentUserSavedJobPostings,
  getUserSavedJobPostings
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
router.post('/introVideo/add', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), addIntroVideo);
router.put('/introVideo/update', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'image', maxCount: 1 }]), updateIntroVideo);
router.delete('/introVideo/delete', deleteIntroVideo);


// Job Application Routes
router.post('/jobs/:id/apply', applyJobApplication);
router.post('/jobs/bulkApply', applyBulkJobApplications);


// router.post('/jobs/:jobId/remove', withdrawJobApplicant);
router.delete('/jobs/:jobId/withdraw', withdrawJobApplicant);
router.post('/jobs/:id/toggle-save', toggleSaveJobApplication);

// Industry and Companies Routes
router.post('/industry', addOrUpdateIndustry);
router.post('/interested-companies', addOrUpdateInterestedCompanies);

// User Details Routes
router.get('/details/token', getUserDetailsFromToken);
router.get('/users/:userId', getUserDetailsById);
router.get('/users/:userId/similar', getUserDetailsByIdandSimilarUser);
router.post('/users/similar', getSimilarUsers);


router.get('/jobs/applied-job-postings', getCurrentUserAppliedJobPostings);
router.get('/jobs/saved-job-postings', getCurrentUserSavedJobPostings);
router.get('/jobs/:userId/applied-job-postings', getUserAppliedJobPostings);
router.get('/jobs/:userId/saved-job-postings', getUserSavedJobPostings);



// Routes for current user
router.get('/jobs/current/pending', getCurrentUserPendingJobs);
router.get('/jobs/current/shortlisted', getCurrentUserShortlistedJobs);
router.get('/jobs/current/selected', getCurrentUserSelectedJobs);
router.get('/jobs/current/rejected', getCurrentUserRejectedJobs);

// Routes for specified user
router.get('/jobs/:userId/pending', getUserPendingJobs);
router.get('/jobs/:userId/shortlisted', getUserShortlistedJobs);
router.get('/jobs/:userId/selected', getUserSelectedJobs);
router.get('/jobs/:userId/rejected', getUserRejectedJobs);
export default router;
