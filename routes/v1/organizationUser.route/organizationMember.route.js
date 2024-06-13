import express from 'express';
import {
  addOrUpdateOrganizationMember,
  updateAddress,
  updateRole,
  updateDepartment,
  updateDateOfJoining,
  updateProfilePicture,
  updateSocialLinks,
  updateLanguages,
} from '../../../controllers/organizationUser.controller/organizationMember';

const router = express.Router();

// Route for adding or updating organization member data
router.post('/organization-member', addOrUpdateOrganizationMember);

// Route for updating address
router.put('/organization-member/address', updateAddress);

// Route for updating role
router.put('/organization-member/role', updateRole);

// Route for updating department
router.put('/organization-member/department', updateDepartment);

// Route for updating date of joining
router.put('/organization-member/date-of-joining', updateDateOfJoining);

// Route for updating profile picture
router.put('/organization-member/profile-picture', updateProfilePicture);

// Route for updating social links
router.put('/organization-member/social-links', updateSocialLinks);

// Route for updating languages
router.put('/organization-member/languages', updateLanguages);

export default router;
