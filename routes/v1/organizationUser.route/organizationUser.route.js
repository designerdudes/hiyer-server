import express from 'express';
import {
  addOrUpdateUserData,
  addOrUpdateAddress,
  addOrUpdateTeamMembers,
  addOrUpdateProjects,
  addOrUpdateContactInfo,
  addOrUpdateWebsite,
  addOrUpdateSocialLinks,
  updateLogo,
  updateBio,
  addProject,
  updateProject,
  deleteProject,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  addSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from '../../../controllers/organizationUser.controller/organizationUser.js';

const router = express.Router();

// Route for adding or updating user data
router.post('/user/data', addOrUpdateUserData);

// Route for adding or updating address
router.post('/user/address', addOrUpdateAddress);

// Route for adding or updating team members
router.post('/user/team-members', addOrUpdateTeamMembers);

// Route for adding or updating projects
router.post('/user/projects', addOrUpdateProjects);

// Route for adding or updating contact information
router.post('/user/contact-info', addOrUpdateContactInfo);

// Route for adding or updating website
router.post('/user/website', addOrUpdateWebsite);

// Route for adding or updating social links
router.post('/user/social-links', addOrUpdateSocialLinks);

// Route for updating logo
router.put('/user/logo', updateLogo);

// Route for updating bio
router.put('/user/bio', updateBio);

// Route for adding a project
router.post('/user/project', addProject);

// Route for updating a project
router.put('/user/project/:projectId', updateProject);

// Route for deleting a project
router.delete('/user/project/:projectId', deleteProject);

// Route for adding a team member
router.post('/user/team-member', addTeamMember);

// Route for updating a team member
router.put('/user/team-member/:teamMemberId', updateTeamMember);

// Route for deleting a team member
router.delete('/user/team-member/:teamMemberId', deleteTeamMember);

// Route for adding a social link
router.post('/user/social-link', addSocialLink);

// Route for updating a social link
router.put('/user/social-link/:socialLinkId', updateSocialLink);

// Route for deleting a social link
router.delete('/user/social-link/:socialLinkId', deleteSocialLink);

export default router;
