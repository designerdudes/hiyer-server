import express from 'express';
import {  addOrUpdateOrganizationMember,
  updateAddress, 
  updateDepartment,
  updateDateOfJoining,
  updateProfilePicture,
  updateSocialLinks,
  updateLanguages, } from '../../../controllers/organizationUser.controller/organizationMember.js';
 
 

const router = express.Router();


// Route to add or update organization member data
router.post('/addOrUpdate', addOrUpdateOrganizationMember);

// Route to update address
router.put('/updateAddress', updateAddress);

 

// Route to update department
router.put('/updateDepartment', updateDepartment);

// Route to update date of joining
router.put('/updateDateOfJoining', updateDateOfJoining);

// Route to update profile picture
router.put('/updateProfilePicture', updateProfilePicture);

// Route to update social links
router.put('/updateSocialLinks', updateSocialLinks);

// Route to update languages
router.put('/updateLanguages', updateLanguages);

export default router;
