import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";


// Helper function to extract user ID from token
const getUserIdFromToken = (req) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  return decodedToken.id;
};

// Helper function to handle common error response
const sendErrorResponse = (res, error) => {
  res.status(400).json({ message: error.message });
};



export const addOrUpdateUserData = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      individualUser = new IndividualUser({ _id: userId });
    }

    const userData = req.body;

    // Update user data dynamically
    for (const key in userData) {
      individualUser[key] = userData[key];
    }

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "User data updated successfully",
      user: individualUser,
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(400).json({ message: error.message });
  }
};

export const addOrUpdateAddress = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update address
    individualUser.address = req.body;

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Address updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addOrUpdateSocialLinks = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update social links selectively
    const updateData = {};
    for (const key in req.body) {
      if (individualUser.socialLinks.hasOwnProperty(key)) {
        updateData[`socialLinks.${key}`] = req.body[key];
      }
    }

    // Update the user document with selective changes
    await IndividualUser.findByIdAndUpdate(userId, updateData, { new: true }); // Return updated document

    individualUser = await IndividualUser.findById(userId); // Fetch updated user (optional)

    res.status(200).json({
      message: "Social links updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateBio = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update bio
    individualUser.bio = req.body.bio;

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Bio updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
//upload
export const updateResume = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update resume
    individualUser.resume = req.body.resume;

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Resume updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePortfolio = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update portfolio
    individualUser.portfolio = req.body.portfolio;

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Portfolio updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const addEducation = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    individualUser.education.push(req.body);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Education data added successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateEducation = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const educationId = req.params.educationId;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let educationIndex = individualUser.education.findIndex(
      (edu) => edu._id == educationId
    );

    if (educationIndex === -1) {
      return res.status(404).json({ message: "Education entry not found" });
    }

    // Merge the new education data into the existing one
    individualUser.education[educationIndex] = {
      ...individualUser.education[educationIndex],
      ...req.body,
    };

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Education data updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteEducation = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { educationId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the education to delete
    const educationIndex = individualUser.education.findIndex(
      (edu) => edu._id.toString() === educationId
    );

    if (educationIndex === -1) {
      return res.status(404).json({ message: "Education not found" });
    }

    // Remove the education entry from the array
    individualUser.education.splice(educationIndex, 1);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Education deleted successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const addExperience = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add new experience
    individualUser.experiences.push(req.body);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({ message: "Experience added successfully", user: individualUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateExperience = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { experienceId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the experience to update
    let experienceIndex = individualUser.experiences.findIndex(
      (exp) => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // Merge the new experience data into the existing one
    individualUser.experiences[experienceIndex] = {
      ...individualUser.experiences[experienceIndex],
      ...req.body,
    };

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Experience updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteExperience = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { experienceId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the experience to delete
    const experienceIndex = individualUser.experiences.findIndex(
      (exp) => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // Remove the experience entry from the array
    individualUser.experiences.splice(experienceIndex, 1);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Experience deleted successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const addSkill = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    const { name, proficiency } = req.body;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the new skill to the user's skills array
    individualUser.skills.push({ name, proficiency });

    // Save the updated user data
    await individualUser.save();

    res
      .status(200)
      .json({ message: "Skill added successfully", user: individualUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateSkill = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const skillId = req.params.skillId;
    const { name, proficiency } = req.body;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the skill exists
    let skillIndex = individualUser.skills.findIndex(
      (skill) => skill._id.toString() === skillId
    );

    if (skillIndex === -1) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Update the skill data
    individualUser.skills[skillIndex] = {
      ...individualUser.skills[skillIndex],
      name,
      proficiency,
    };

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Skill updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteSkill = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { skillId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the skill to delete
    const skillIndex = individualUser.skills.findIndex(
      (skill) => skill._id.toString() === skillId
    );

    if (skillIndex === -1) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Remove the skill entry from the array
    individualUser.skills.splice(skillIndex, 1);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Skill deleted successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const addCertification = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the new certification to the user's certifications array
    individualUser.certifications.push(req.body);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Certification added successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateCertification = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const certificationId = req.params.certificationId;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the certification to update
    const certificationIndex = individualUser.certifications.findIndex(
      (certification) => certification._id.toString() === certificationId
    );

    if (certificationIndex === -1) {
      return res.status(404).json({ message: "Certification not found" });
    }

    // Merge the existing certification data with the new certification data from the request body
    individualUser.certifications[certificationIndex] = {
      ...individualUser.certifications[certificationIndex],
      ...req.body,
    };

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Certification updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteCertification = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { certificationId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the certification to delete
    const certificationIndex = individualUser.certifications.findIndex(
      (certification) => certification._id.toString() === certificationId
    );

    if (certificationIndex === -1) {
      return res.status(404).json({ message: "Certification not found" });
    }

    // Remove the certification entry from the array
    individualUser.certifications.splice(certificationIndex, 1);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Certification deleted successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const addProject = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add new project
    individualUser.projects.push(req.body);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({ message: "Project added successfully", user: individualUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { projectId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the project to update
    let projectIndex = individualUser.projects.findIndex(
      (proj) => proj._id.toString() === projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Merge the new project data into the existing one
    individualUser.projects[projectIndex] = {
      ...individualUser.projects[projectIndex],
      ...req.body,
    };

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Project updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { projectId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the project to delete
    const projectIndex = individualUser.projects.findIndex(
      (proj) => proj._id.toString() === projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove the project entry from the array
    individualUser.projects.splice(projectIndex, 1);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Project deleted successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addUrlToProject = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { projectId } = req.params;
    const { url } = req.body;

    if (!url || !validator.isURL(url)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project to update
    let project = individualUser.projects.id(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add the new URL
    project.urls.push(url);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "URL added successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUrlInProject = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { projectId, urlIndex } = req.params;
    const { url } = req.body;

    if (!url || !validator.isURL(url)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project to update
    let project = individualUser.projects.id(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (urlIndex < 0 || urlIndex >= project.urls.length) {
      return res.status(400).json({ message: "Invalid URL index" });
    }

    // Update the URL
    project.urls[urlIndex] = url;

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "URL updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const removeProjectURL = async (req, res) => {

  try {
    const userId = getUserIdFromToken(req);
    const { projectId, urlIndex } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = individualUser.projects.id(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (urlIndex >= project.urls.length) {
      return res.status(404).json({ message: "URL index out of range" });
    }

    project.urls.splice(urlIndex, 1);

    await individualUser.save();

    res.status(200).json({
      message: "URL removed from project successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Add or Update Video Title and Description
export const addOrUpdateVideoDetails = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { videoTitle, videoDescription } = req.body;
    const { videoRef } = req.params;

    // Find the individual user by their ID
    const individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the video by its reference ID
    const video = individualUser.postedVideo.find(
      (video) => video.videoRef.toString() === videoRef
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Update the video title and description
    video.videoTitle = videoTitle || video.videoTitle;
    video.videoDescription = videoDescription || video.videoDescription;

    // Save the updated individual user document
    await individualUser.save();

    res.status(200).json({
      message: "Video details updated successfully",
      video,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Controller to withdraw job applicant
export const withdrawJobApplicant = async (req, res) => {
  try {
    const { jobId, userId } = req.params;

    // Find the job application by ID
    const jobApplication = await JobApplication.findById(jobId);
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Find the index of the applicant within the job application's applicants array
    const applicantIndex = jobApplication.applicants.findIndex(app => app.user.toString() === userId);
    if (applicantIndex === -1) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Remove the applicant from the applicants array
    jobApplication.applicants.splice(applicantIndex, 1);
    await jobApplication.save();

    // Update IndividualUser model to remove the applied job
    await IndividualUser.findByIdAndUpdate(userId, {
      $pull: { "jobposting.applied": jobApplication._id },
    });

    res.status(200).json({ message: 'Applicant removed successfully' });
  } catch (error) {
    console.error('Error removing applicant:', error);
    res.status(500).json({ error: 'An error occurred while removing the applicant' });
  }
};


export const applyJobApplication = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;
    const { coverLetter, mediaType, mediaRef } = req.body;

    const media = {
      mediaType,
      mediaRef,
    };

    const newApplicant = {
      user: userId,
      resumeVideo: media,
      coverLetter,
    };

    const jobApplication = await JobApplication.findById(id);
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    jobApplication.applicants.push(newApplicant);
    await jobApplication.save();

    await IndividualUser.findByIdAndUpdate(userId, {
      $push: { "jobposting.applied": jobApplication._id },
    });

    res.status(201).json(jobApplication);
  } catch (error) {
    console.error('Error adding applicant:', error);
    res.status(500).json({ error: 'An error occurred while adding the applicant' });
  }
};



export const toggleSaveJobApplication = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;

    const individualUser = await IndividualUser.findById(userId);
    if (!individualUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const jobIndex = individualUser.jobposting.saved.indexOf(id);
    if (jobIndex === -1) {
      // Add job to saved list
      individualUser.jobposting.saved.push(id);
    } else {
      // Remove job from saved list
      individualUser.jobposting.saved.splice(jobIndex, 1);
    }

    await individualUser.save();

    res.status(200).json({
      message: jobIndex === -1 ? 'Job application saved successfully' : 'Job application removed from saved list',
      user: individualUser,
    });
  } catch (error) {
    console.error('Error toggling saved job application:', error);
    res.status(500).json({ error: 'An error occurred while toggling the saved job application' });
  }
};


// Add or Update Industry
export const addOrUpdateIndustry = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { industry } = req.body;

    const individualUser = await IndividualUser.findById(userId);
    if (!individualUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    individualUser.industry = industry.length > 0 ? industry : null;
    await individualUser.save();

    res.status(200).json({
      message: 'Industry updated successfully',
      user: individualUser,
    });
  } catch (error) {
    console.error('Error updating industry:', error);
    res.status(500).json({ error: 'An error occurred while updating the industry' });
  }
};

// Add or Update Interested Companies
export const addOrUpdateInterestedCompanies = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { interestedCompanies } = req.body;

    const individualUser = await IndividualUser.findById(userId);
    if (!individualUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    individualUser.interestedCompanies = interestedCompanies.length > 0 ? interestedCompanies : null;
    await individualUser.save();

    res.status(200).json({
      message: 'Interested companies updated successfully',
      user: individualUser,
    });
  } catch (error) {
    console.error('Error updating interested companies:', error);
    res.status(500).json({ error: 'An error occurred while updating the interested companies' });
  }
};
