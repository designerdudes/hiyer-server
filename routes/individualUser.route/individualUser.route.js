import express from 'express';
import {
  addOrUpdateUserData,
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
} from '../../controllers/individualUser.controller/individualUser.js';

const router = express.Router();

// Route for adding or updating user data
router.post('/data', addOrUpdateUserData);

// Routes for education
router.post('/education', addEducation);
router.put('/education/:educationId', updateEducation);
router.delete('/education/:educationId', deleteEducation);

// Routes for experience
router.post('/experience', addExperience);
router.put('/experience/:experienceId', updateExperience);
router.delete('/experience/:experienceId', deleteExperience);

// Routes for skills
router.post('/skill', addSkill);
router.put('/skill/:skillId', updateSkill);
router.delete('/skill/:skillId', deleteSkill);

// Routes for certifications
router.post('/certification', addCertification);
router.put('/certification/:certificationId', updateCertification);
router.delete('/certification/:certificationId', deleteCertification);

export default router;
