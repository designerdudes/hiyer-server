import express from 'express';
import {
  addOrUpdateUserData,
  addOrUpdateAddress, 
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
  deleteSocialLink,
  updateUrlInProject,
  addUrlToProject,
  removeProjectURL,
  updateSocialLinks,
  toggleSaveCandidate,
  getSavedCandidates,
  getIndividualUsersWithIntroVideo, 
} from '../../../controllers/organizationUser.controller/organizationUser.js';
import { getCurrentUserSelectedApplicants, getOrganizationalCurrentUserPostedApplications, getOrganizationalUserPostedApplications, getCurrentUserPendingApplicants, getCurrentUserRejectedApplicants, getCurrentUserShortlistedApplicants, getPendingApplicants, getShortlistedApplicants, getSelectedApplicants, getRejectedApplicants } from '../../../controllers/organization.controller/jobApplication.controller.js';

const router = express.Router();

// Route for adding or updating user data
router.post('/user/data', addOrUpdateUserData);

// Route for adding or updating address
router.post('/user/address', addOrUpdateAddress);


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

// POST /api/user/project
router.post('/user/project', addProject);

// PUT /api/user/project/:id
router.put('/user/project/:id', updateProject);

// DELETE /api/user/project/:id
router.delete('/user/project/:id', deleteProject);

// POST /api/user/project/:id/url
router.post('/user/project/:id/url', addUrlToProject);

// PUT /api/user/project/:id/url/:urlId
router.put('/user/project/:id/url/:urlId', updateUrlInProject);

// DELETE /api/user/project/:id/url/:urlId
router.delete('/user/project/:id/url/:urlId', removeProjectURL);

// Route for adding a team member
router.post('/user/team-member', addTeamMember);

// Route for updating a team member
router.put('/user/team-member/:teamMemberId', updateTeamMember);

// Route for deleting a team member
router.delete('/user/team-member/:teamMemberId', deleteTeamMember);

// Route for adding a social link
router.post('/user/social-link', addSocialLink);

// Route for updating a social link
router.put('/user/social-links', updateSocialLinks);

// Route for deleting a social link
router.delete('/user/social-links/:socialLinkKey', deleteSocialLink);


router.post('/:userId/posted-applications', getOrganizationalUserPostedApplications);
router.get('/currentUser/posted-applications', getOrganizationalCurrentUserPostedApplications);


// Route to get pending applicants
router.get('/applications/pending', getCurrentUserPendingApplicants);

// Route to get reviewed applicants
router.get('/applications/shortlisted', getCurrentUserShortlistedApplicants);

// Route to get accepted applicants
router.get('/applications/selected', getCurrentUserSelectedApplicants);

// Route to get rejected applicants
router.get('/applications/rejected', getCurrentUserRejectedApplicants);



// Route to get pending applicants
router.get('/applications/:organizatioId/pending', getPendingApplicants);

// Route to get shortlisted applicants
router.get('/applications/:organizatioId/shortlisted', getShortlistedApplicants);

// Route to get selected applicants
router.get('/applications/:organizatioId/selected', getSelectedApplicants);

// Route to get rejected applicants
router.get('/applications/:organizatioId/rejected', getRejectedApplicants);

router.post('/saveCandidate/:candidateId', toggleSaveCandidate);

router.get('/savedCandidates', getSavedCandidates);

router.get('/candidates', getIndividualUsersWithIntroVideo);
export default router;
