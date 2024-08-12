import path from 'path';
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import User from "../../models/user.model.js";
import validator from 'validator';
import JobAds from "../../models/organization.model/jobAds.model.js";
import { deleteMedia, uploadMedia } from "../mediaControl.controller/mediaUpload.js";
import OrganizationalUser from "../../models/organizationUser.model/organizationUser.model.js";
import Recommendation from "../../models/individualUser.model/recommendation,model.js";
import { sendNewApplicationEmail, sendNewRecommendationFromUserEmail } from "../../config/zohoMail.js";


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
// Controller to handle joining fee payment
export const handleJoiningFeePayment = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming a function to get user ID from token
    const { amount, transactionId } = req.body;

    if (amount > 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const user = await IndividualUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.joiningFeePaid.status) {
      return res.status(400).json({ message: 'Joining fee already paid' });
    }

    user.joiningFeePaid = {
      status: true,
      transactionId,
    };

    // user.paymentHistory.push({
    //   amount,
    //   paymentDate: new Date(),
    //   paymentMethod,
    //   transactionId,
    //   description: 'Joining fee payment',
    // });

    await user.save();

    res.status(200).json({ message: 'Joining fee paid successfully' });
  } catch (error) {
    console.error('Error handling joining fee payment:', error);
    res.status(500).json({ message: 'An error occurred while processing payment' });
  }
};

// Controller to handle subscription
export const handleSubscription = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming a function to get user ID from token
    const { plan, amount, paymentMethod, transactionId } = req.body;

    if (amount <= 0 || !['basic', 'premium', 'enterprise'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription details' });
    }

    const user = await IndividualUser.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1); // Assuming a 1-year subscription

    user.subscription = {
      plan,
      startDate,
      endDate,
      status: 'active',
      transactionId,
    };

    // user.paymentHistory.push({
    //   amount,
    //   paymentDate: startDate,
    //   paymentMethod,
    //   transactionId,
    //   description: `Subscription payment for ${plan} plan`,
    // });

    await user.save();

    res.status(200).json({ message: 'Subscription activated successfully' });
  } catch (error) {
    console.error('Error handling subscription:', error);
    res.status(500).json({ message: 'An error occurred while processing subscription' });
  }
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

    // Ensure startDate is provided
    if (!req.body.startDate) {
      return res.status(400).json({ message: "Start date is required" });
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
    const educationId = req.params.id;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const educationIndex = individualUser.education.findIndex((edu) => edu._id.toString() === educationId);

    if (educationIndex === -1) {
      return res.status(404).json({ message: "Education entry not found" });
    }

    // Merge the new education data into the existing one
    const updatedEducation = {
      ...individualUser.education[educationIndex]._doc,  // Use _doc to avoid Mongoose metadata
      ...req.body,
    };

    // Validate required fields
    if (!updatedEducation.degree || !updatedEducation.institute || !updatedEducation.startDate) {
      return res.status(400).json({ message: "Degree, institute, and start date are required" });
    }

    individualUser.education[educationIndex] = updatedEducation;

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
    const educationId = req.params.id;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the education to delete
    const educationIndex = individualUser.education.findIndex((edu) => edu._id.toString() === educationId);

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

    res.status(200).json({ message: "Experience added successfully", experiences: individualUser.experiences });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const updateExperience = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const experienceId = req.params.id;
    const { company } = req.body; // Destructure company from the request body
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

    // Update only the company field of the specific experience
    individualUser.experiences[experienceIndex].company = company;

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Experience updated successfully",
      experiences: individualUser.experiences,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const deleteExperience = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const experienceId = req.params.id;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const experienceIndex = individualUser.experiences.findIndex(
      (exp) => exp._id.toString() === experienceId
    );

    if (experienceIndex === -1) {
      return res.status(404).json({ message: "Experience not found" });
    }

    individualUser.experiences.splice(experienceIndex, 1);

    await individualUser.save();

    res.status(200).json({
      message: "Experience deleted successfully",
      experiences: individualUser.experiences,
    });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(400).json({ message: error.message });
  }
};



export const addPositionToExperience = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const experienceId = req.params.id;


    // Find the individual user by ID
    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", individualUser);

    // Find the experience to add a position to
    let experience = individualUser.experiences.id(experienceId);

    if (!experience) {
      console.log("Experience not found for ID:", experienceId);
      return res.status(404).json({ message: "Experience not found" });
    }

    console.log("Experience found:", experience);

    // Add new position
    experience.positions.push(req.body);

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Position added successfully",
      experiences: individualUser.experiences,
    });
  } catch (error) {
    console.error('Error adding position:', error);
    res.status(400).json({ message: error.message });
  }
};



export const updatePositionInExperience = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const experienceId = req.params.experienceId;
    const positionId = req.params.positionId;
    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the experience to update a position in
    let experience = individualUser.experiences.id(experienceId);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // Find the index of the position to update
    let positionIndex = experience.positions.findIndex(
      (pos) => pos._id.toString() === positionId
    );

    if (positionIndex === -1) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Merge the new position data into the existing one
    experience.positions[positionIndex] = {
      ...experience.positions[positionIndex],
      ...req.body,
    };

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Position updated successfully",
      experiences: individualUser.experiences,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePositionInExperience = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const experienceId = req.params.experienceId;
    const positionId = req.params.positionId;
    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the experience to delete a position in
    let experience = individualUser.experiences.id(experienceId);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const positionIndex = experience.positions.findIndex(
      (pos) => pos._id.toString() === positionId
    );



    if (positionIndex === -1) {
      return res.status(404).json({ message: "Position not found" });
    }

    experience.positions.splice(positionIndex, 1);

    if (experience.positions.length === 0) {
      experience.deleteOne({ _id: experienceId })
    }

    await individualUser.save();

    res.status(200).json({
      message: "Position deleted successfully",
      experiences: individualUser.experiences,
    });
  } catch (error) {
    console.error('Error deleting position:', error);
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
    const skillId = req.params.id;
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
    const skillId = req.params.id;

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
    const certificationId = req.params.id;

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
    const certificationId = req.params.id;

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
    const projectId = req.params.id;

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
    const projectId = req.params.id;

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
    const projectId = req.params.id;
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
    const { id, urlId } = req.params;
    const { url } = req.body;

    if (!url || !validator.isURL(url)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project to update
    let project = individualUser.projects.id(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (urlId < 0 || urlId >= project.urls.length) {
      return res.status(400).json({ message: "Invalid URL index" });
    }

    // Update the URL
    project.urls[urlId] = url;

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
    const { id, urlId } = req.params;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = individualUser.projects.id(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (urlId >= project.urls.length) {
      return res.status(404).json({ message: "URL index out of range" });
    }

    project.urls.splice(urlId, 1);

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
    const videoRef = req.params.id;

    // Find the individual user by their ID
    const individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the video by its reference ID
    const video = individualUser.videoResume.find(
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
      videoResume: individualUser.videoResume
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const addIntroVideo = async (req, res) => {
//   try {
//     const userId = getUserIdFromToken(req); // Assuming you have a function to get userId
//     const { videoTitle, videoDescription } = req.body;
//     const { video, image } = req.files;

//     let mediaResult = {};
//     if (req.files && req.files.video) {
//       mediaResult = await uploadMedia(req); // Assuming uploadMedia returns video_id
//     } else {
//       return res.status(400).json({ error: "Video file is required" });
//     }

//     let newImage;
//     if (image && image.length > 0) {
//       const imagePath = path.resolve(image[0].path);
//       console.log('Uploading image file:', imagePath);
//       const uploadResult1 = await uploadImage(imagePath, userId);

//       newImage = new Image({
//         imageUrl: uploadResult1.imageUrl,
//         transformations: [{ quality: 'auto' }],
//         postedBy: userId,
//       });

//       await newImage.save();
//     }

//     const newIntroVideo = {
//       videoRef: mediaResult.video_id,
//       thumbnailUrl: newImage ? newImage._id : null, // Set thumbnail if image uploaded
//       videoTitle,
//       videoDescription,
//     };

//     const updatedUser = await IndividualUser.findByIdAndUpdate(
//       userId,
//       { $set: { introVideo: newIntroVideo } },
//       { new: true }
//     );

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error('Error adding intro video:', error);
//     res.status(500).json({ error: 'An error occurred while adding intro video' });
//   }
// };
export const addIntroVideo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming you have a function to get userId
    const { videoTitle, videoDescription } = req.body;
    const { video, image } = req.files;

    if (!video || video.length === 0) {
      return res.status(400).json({ error: "Video file is required" });
    }

    // Upload video
    const mediaResult = await uploadMedia(req); // Assuming uploadMedia returns video_id

    let newImage;
    if (image && image.length > 0) {
      const imagePath = path.resolve(image[0].path);
      console.log('Uploading image file:', imagePath);
      const uploadResult1 = await uploadImage(imagePath, userId);

      newImage = new Image({
        imageUrl: uploadResult1.imageUrl,
        transformations: [{ quality: 'auto' }],
        postedBy: userId,
      });

      await newImage.save();
    }

    const newIntroVideo = {
      videoRef: mediaResult.video_id,
      thumbnailUrl: newImage ? newImage._id : null, // Set thumbnail if image uploaded
      videoTitle,
      videoDescription,
    };

    const updatedUser = await IndividualUser.findByIdAndUpdate(
      userId,
      { $set: { introVideo: newIntroVideo } },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error adding intro video:', error);
    res.status(500).json({ error: 'An error occurred while adding intro video' });
  }
};


export const updateIntroVideo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming you have a function to get userId
    const { videoTitle, videoDescription } = req.body;

    // Retrieve user and current introVideo
    const user = await IndividualUser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete previous media if it exists
    if (user.introVideo && user.introVideo.videoRef) {
      await deleteMedia(user.introVideo.videoRef);
    }

    // Upload new media
    let mediaResult = {};
    if (req.files && req.files.video) {
      mediaResult = await uploadMedia(req);
    } else {
      return res.status(400).json({ error: "Video file is required" });
    }

    // Construct updated introVideo object
    const updatedIntroVideo = {
      videoRef: mediaResult.video_id,
      videoTitle,
      videoDescription,
    };

    // Update user document with updated introVideo
    const updatedUser = await IndividualUser.findByIdAndUpdate(
      userId,
      { $set: { introVideo: updatedIntroVideo } },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating intro video:', error);
    res.status(500).json({ error: 'An error occurred while updating intro video' });
  }
};

export const deleteIntroVideo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming you have a function to get userId
    const user = await IndividualUser.findById(userId);

    if (!user.introVideo) {
      return res.status(404).json({ error: 'Intro video not found' });
    }

    // Delete associated media if it exists
    if (user.introVideo.videoRef) {
      await deleteMedia(user.introVideo.videoRef); // Assuming deleteMedia function is correctly implemented
    }

    // Update user document to remove introVideo field
    const updatedUser = await IndividualUser.findByIdAndUpdate(
      userId,
      { $unset: { introVideo: "" } },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error deleting intro video:', error);
    res.status(500).json({ error: 'An error occurred while deleting intro video' });
  }
};


export const applyJobAds = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;
    const { coverLetter, mediaType, mediaRef } = req.body;

    // Convert id to ObjectId using 'new'
    const jobId = new mongoose.Types.ObjectId(id);

    const newApplicant = {
      user: userId,
      coverLetter,
      ...(mediaType && mediaRef && mediaRef.trim() !== '' && {
        resumeVideo: {
          mediaType,
          mediaRef: mediaRef
        },
      }),

    };

    const jobAds = await JobAds.findById(jobId).populate('postedBy');
    const user = await User.findById(userId).populate('profilePicture');

    if (!jobAds) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Check if the user already exists in the applicants array
    const applicantExists = jobAds.applicants.some(applicant => applicant.user.toString() === userId);
    if (applicantExists) {
      return res.status(400).json({ error: 'User has already applied for this job' });
    }

    jobAds.applicants.push(newApplicant);
    await jobAds.save();

    await IndividualUser.findByIdAndUpdate(userId, {
      $push: { "jobposting.applied": jobAds._id },
    });

    sendNewApplicationEmail(jobAds, user);

    res.status(201).json(jobAds);
  } catch (error) {
    console.error('Error adding applicant:', error);
    res.status(500).json({ error: 'An error occurred while adding the applicant' });
  }
};


export const withdrawJobApplicant = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { jobId } = req.params;

    // Convert jobId and userId to ObjectId with new
    const jobObjectId = new mongoose.Types.ObjectId(jobId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find the job application by ID
    const jobAds = await JobAds.findById(jobObjectId);
    if (!jobAds) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Find the index of the applicant within the job application's applicants array
    const applicantIndex = jobAds.applicants.findIndex(app => app.user.toString() === userObjectId.toString());
    if (applicantIndex === -1) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Remove the applicant from the applicants array
    jobAds.applicants.splice(applicantIndex, 1);
    await jobAds.save();

    // Update IndividualUser model to remove the applied job
    await IndividualUser.findByIdAndUpdate(userObjectId, {
      $pull: { "jobposting.applied": jobAds._id },
    });

    res.status(200).json({ message: 'Applicant removed successfully' });
  } catch (error) {
    console.error('Error removing applicant:', error);
    res.status(500).json({ error: 'An error occurred while removing the applicant' });
  }
};



export const toggleSaveJobAds = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;

    // Convert id to ObjectId
    const jobId = new mongoose.Types.ObjectId(id);

    const individualUser = await IndividualUser.findById(userId);
    if (!individualUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const jobIndex = individualUser.jobposting.saved.indexOf(jobId);
    if (jobIndex === -1) {
      // Add job to saved list
      individualUser.jobposting.saved.push(jobId);
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


export const applyBulkJobAdss = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { jobIds, coverLetter, mediaType, mediaRef } = req.body;
    console.log(jobIds, coverLetter, mediaType, mediaRef)
    // Validate that jobIds is an array
    if (!Array.isArray(jobIds)) {
      return res.status(400).json({ error: 'jobIds must be an array' });
    }

    // Ensure the mediaType matches one of the allowed enum values
    const allowedMediaTypes = ['video', 'image', 'document'];
    const normalizedMediaType = mediaType.toLowerCase();
    if (!allowedMediaTypes.includes(normalizedMediaType)) {
      return res.status(400).json({ error: `mediaType must be one of ${allowedMediaTypes.join(', ')}` });
    }

    const media = {
      mediaType: normalizedMediaType, // Convert to lowercase
      mediaRef,
    };

    const newApplicant = {
      user: userId,
      resumeVideo: media, // Ensure this matches the schema definition
      coverLetter,
    };

    const jobAdsPromises = jobIds.map(async (id) => {
      const jobId = new mongoose.Types.ObjectId(id);
      const jobAds = await JobAds.findById(jobId);
      if (!jobAds) {
        console.error(`Job application not found for ID: ${id}`);
        return { id, status: 'not_found' };
      }

      jobAds.applicants.push(newApplicant);
      await jobAds.save();
      return { id, status: 'applied' };
    });

    const jobAdsResults = await Promise.all(jobAdsPromises);

    // Updating the user's applied jobs once
    const appliedJobIds = jobAdsResults
      .filter(result => result.status === 'applied')
      .map(result => result.id);

    await IndividualUser.findByIdAndUpdate(userId, {
      $push: { "jobposting.applied": { $each: appliedJobIds } },
    });

    res.status(201).json({
      message: 'Bulk application completed',
      results: jobAdsResults,
    });
  } catch (error) {
    console.error('Error adding applicants in bulk:', error);
    res.status(500).json({ error: 'An error occurred while adding the applicants in bulk' });
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




// Controller to get user details from token
export const getUserDetailsFromToken = async (req, res) => {
  try {
    // Extract user ID from the token
    const userId = getUserIdFromToken(req);

    // Find the user by ID and select specific fields
    const user = await User.findById(userId).select('email phone name profilePicture profile lastLoggedIn').populate('profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the individual user profile using profileRef
    const individualUser = await IndividualUser.findById(user.profile.profileRef)

      .populate({
        path: 'jobposting.applied',
        select: '_id ',

      })
      .populate({
        path: 'jobposting.saved',
        select: '_id',
      })
      .populate({
        path: 'videoResume.videoRef',
        populate: {
          path: 'thumbnailUrl',
          model: 'Image', // Assuming Image is the model name for images
        }
      })
      .populate({
        path: 'introVideo.videoRef',
        populate: {
          path: 'thumbnailUrl',
          model: 'Image'
        }
      })
      .populate({
        path: 'recommendedJobs',
        populate: [
          // { path: 'job', model: 'JobAds',select:'_id' }, // Populate job details
          {
            path: 'recommendedTo', model: 'User', select: 'name email  profilePicture',
            populate: {
              path: 'profilePicture',
              model: 'Image'
            }
          }, // Populate user who recommended
        ]
      })
      .populate({
        path: 'receivedRecommendations',
        populate: [
          // { path: 'job', model: 'JobAds',select:'_id' }, // Populate job details
          {
            path: 'recommendedBy', model: 'User', select: 'name email profile  profilePicture',
            populate: {
              path: 'profilePicture',
              model: 'Image'
            }
          }, // Populate user who recommended
        ]
      })


    if (!individualUser) {
      return res.status(404).json({ message: 'Individual user profile not found' });
    }

    //save last logged in
    user.lastLoggedIn = new Date();
    await user.save();


    // Send response with user and individual user profile details
    res.status(200).json({
      user,
      individualUser,
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ message: 'An error occurred while fetching user details' });
  }
};



// Controller to get user details by ID from URL parameter
export const getUserDetailsById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by ID and select specific fields
    const user = await User.findById(userId).select('email phone name profile profilePicture').populate('profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the individual user profile using profileRef
    const individualUser = await IndividualUser.findById(user.profile.profileRef)
      .populate({
        path: 'videoResume.videoRef',
        populate: {
          path: 'thumbnailUrl',
          model: 'Image', // Assuming Image is the model name for images
        }
      })
      .populate({
        path: 'introVideo.videoRef',
        populate: {
          path: 'thumbnailUrl',
          model: 'Image'
        }
      });

    if (!individualUser) {
      return res.status(404).json({ message: 'Individual user profile not found' });
    }

    // Send response with user and individual user profile details
    res.status(200).json({
      user,
      individualUser,
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ message: 'An error occurred while fetching user details' });
  }
};





// Controller to get user details by ID from URL parameter and find similar users
export const getUserDetailsByIdandSimilarUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID
    const user = await User.findById(userId).select('email phone name profilePicture profile').populate('profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find individual user profile by profileRef
    const individualUser = await IndividualUser.findById(user.profile.profileRef).select('-jobposting');
    if (!individualUser) {
      return res.status(404).json({ message: 'Individual user profile not found' });
    }

    const { industry = [], interestedCompanies = [], address = {}, skills = [] } = individualUser;

    // Ensure industry and interestedCompanies are arrays
    const industryArray = Array.isArray(industry) ? industry : [];
    const interestedCompaniesArray = Array.isArray(interestedCompanies) ? interestedCompanies : [];
    const skillsArray = Array.isArray(skills) ? skills.map(skill => skill.name) : [];

    // Query to find similar users and exclude the current user
    const query = {
      _id: { $ne: user.profile.profileRef }, // Exclude current user
      $or: [
        { industry: { $in: industryArray } },
        { interestedCompanies: { $in: interestedCompaniesArray } },
        { 'address.city': address.city, 'address.state': address.state, 'address.country': address.country },
        { skills: { $elemMatch: { name: { $in: skillsArray } } } },
      ],
    };

    // Find similar users from IndividualUser collection, excluding the current user and limiting to 5
    const similarIndividualUsers = await IndividualUser.find(query).limit(5);

    // Fetch additional details (name, phone, email) from User collection for similar users
    const similarUsers = await Promise.all(
      similarIndividualUsers.map(async (indUser) => {
        const similarUser = await User.findOne({ 'profile.profileRef': indUser._id }).select('name phone email');
        return { individualUser: indUser, user: similarUser };
      })
    );

    res.status(200).json({
      user,
      individualUser,
      similarUsers,
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ message: 'An error occurred while fetching user details' });
  }
};



// Controller to get similar users
export const getSimilarUsers = async (req, res) => {
  try {
    const { industry = [], interestedCompanies = [], address = {}, skills = [] } = req.body;

    // Ensure industry and interestedCompanies are arrays
    const industryArray = Array.isArray(industry) ? industry : [];
    const interestedCompaniesArray = Array.isArray(interestedCompanies) ? interestedCompanies : [];
    const skillsArray = Array.isArray(skills) ? skills.map(skill => skill.name) : [];

    // Build the query based on provided criteria
    const query = {
      $or: [
        ...(industryArray.length > 0 ? [{ industry: { $in: industryArray } }] : []),
        ...(interestedCompaniesArray.length > 0 ? [{ interestedCompanies: { $in: interestedCompaniesArray } }] : []),
        ...(address.city && address.state && address.country ? [{ 'address.city': address.city, 'address.state': address.state, 'address.country': address.country }] : []),
        ...(skillsArray.length > 0 ? [{ skills: { $elemMatch: { name: { $in: skillsArray } } } }] : []),
      ],
    };

    // If no criteria provided, return an empty array
    if (query.$or.length === 0) {
      return res.status(200).json([]);
    }

    // Find similar users from IndividualUser collection
    let similarIndividualUsers = await IndividualUser.find(query);
    console.log(similarIndividualUsers)
    if (!similarIndividualUsers || similarIndividualUsers.length === 0) {
      return res.status(404).json({ message: "No similar users found" });
    }

    // Populate user details from the User collection
    const userIds = similarIndividualUsers.map(user => user._id);
    const users = await User.find({ 'profile.profileRef': { $in: userIds } }).select('email phone name profile.profileRef');

    // Filter and map similar users with their details
    const response = similarIndividualUsers.map(user => {
      const userDetails = users.find(u => u.profile.profileRef && u.profile.profileRef.toString() === user._id.toString());
      return userDetails ? {
        _id: user._id,
        industry: user.industry,
        interestedCompanies: user.interestedCompanies,
        address: user.address,
        skills: user.skills,
        userDetails: {
          email: userDetails.email,
          phone: userDetails.phone,
          name: userDetails.name,
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } : null;
    }).filter(user => user !== null); // Remove any null entries

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting similar users:', error);
    res.status(500).json({ message: 'An error occurred while fetching similar users' });
  }
};





export const getCurrentUserAppliedJobPostings = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Get user ID from token

    const user = await IndividualUser.findById(userId)
      .select('jobposting')
      .populate({
        path: 'jobposting.applied',
        select: 'title description jobType applicants experienceLevel remoteWork salary jobAdDeadline media location benefits jobAdLink skills jobAdSource postedBy industry tags',
        populate: [
          {
            path: 'postedBy',
            select: 'name email' // Adjust fields as necessary
          },
          {
            path: 'media.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          },
          {
            path: 'applicants.resumeVideo.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          }
        ]
      })


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process the applied job postings to filter and format applicants
    const appliedJobPostings = user.jobposting.applied.map(job => {
      const applicants = job.applicants.map(applicant => {
        if (String(applicant.user) === String(userId)) {
          return {
            companyReview: applicant.companyReview,
            user: applicant.user,
            coverLetter: applicant.coverLetter,
            applicantStatus: applicant.applicantStatus,
            _id: applicant._id,
            appliedDate: applicant.appliedDate,
            applicationHistory: applicant.applicationHistory,
            evaluationRounds: applicant.evaluationRounds,
            resumeVideo: applicant.resumeVideo,
            jobAdDeadline: applicant.jobAdDeadline
          };
        } else {
          return {
            user: applicant.user
          };
        }
      });
      return {
        ...job.toObject(),
        applicants: applicants
      };
    });

    // Send response with user details and processed job postings
    res.status(200).json({
      user: {
        jobposting: {
          applied: appliedJobPostings,
        },
        _id: user._id
      }
    });
  } catch (error) {
    console.error('Error fetching applied job postings:', error);
    res.status(500).json({ message: 'An error occurred while fetching applied job postings' });
  }
};


export const getCurrentUserSavedJobPostings = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Get user ID from token

    const user = await IndividualUser.findById(userId)
      .select('jobposting')
      .populate({
        path: 'jobposting.saved',
        select: 'title description jobType applicants experienceLevel remoteWork salary jobAdDeadline media location benefits jobAdLink skills jobAdSource postedBy industry tags',
        populate: [
          {
            path: 'postedBy',
            select: 'name email' // Adjust fields as necessary
          },
          {
            path: 'media.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          },
          {
            path: 'applicants.resumeVideo.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          }
        ]
      });;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process the saved job postings to filter and format applicants
    const savedJobPostings = user.jobposting.saved.map(job => {
      const applicants = job.applicants.map(applicant => {
        if (String(applicant.user) === String(userId)) {
          return {
            companyReview: applicant.companyReview,
            user: applicant.user,
            coverLetter: applicant.coverLetter,
            applicantStatus: applicant.applicantStatus,
            _id: applicant._id,
            appliedDate: applicant.appliedDate,
            applicationHistory: applicant.applicationHistory,
            evaluationRounds: applicant.evaluationRounds,
            resumeVideo: applicant.resumeVideo,
            jobAdDeadline: applicant.jobAdDeadline
          };
        } else {
          return {
            user: applicant.user
          };
        }
      });
      return {
        ...job.toObject(),
        applicants: applicants
      };
    });

    // Send response with user details and processed job postings
    res.status(200).json({
      user: {
        jobposting: {
          saved: savedJobPostings
        },
        _id: user._id
      }
    });
  } catch (error) {
    console.error('Error fetching saved job postings:', error);
    res.status(500).json({ message: 'An error occurred while fetching saved job postings' });
  }
};










export const getUserAppliedJobPostings = async (req, res) => {
  try {
    const { userId } = req.params;


    const user = await IndividualUser.findById(userId)
      .select('jobposting')
      .populate({
        path: 'jobposting.applied',
        select: 'title description jobType applicants experienceLevel remoteWork salary jobAdDeadline media location benefits jobAdLink skills jobAdSource postedBy industry tags',
        populate: [
          {
            path: 'postedBy',
            select: 'name email' // Adjust fields as necessary
          },
          {
            path: 'media.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          },
          {
            path: 'applicants.resumeVideo.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          }
        ]
      })


    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process the applied job postings to filter and format applicants
    const appliedJobPostings = user.jobposting.applied.map(job => {
      const applicants = job.applicants.map(applicant => {
        if (String(applicant.user) === String(userId)) {
          return {
            companyReview: applicant.companyReview,
            user: applicant.user,
            coverLetter: applicant.coverLetter,
            applicantStatus: applicant.applicantStatus,
            _id: applicant._id,
            appliedDate: applicant.appliedDate,
            applicationHistory: applicant.applicationHistory,
            evaluationRounds: applicant.evaluationRounds,
            resumeVideo: applicant.resumeVideo
          };
        } else {
          return {
            user: applicant.user
          };
        }
      });
      return {
        ...job.toObject(),
        applicants: applicants
      };
    });

    // Send response with user details and processed job postings
    res.status(200).json({
      user: {
        jobposting: {
          applied: appliedJobPostings,
        },
        _id: user._id
      }
    });
  } catch (error) {
    console.error('Error fetching applied job postings:', error);
    res.status(500).json({ message: 'An error occurred while fetching applied job postings' });
  }
};






export const getUserSavedJobPostings = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await IndividualUser.findById(userId)
      .select('jobposting')
      .populate({
        path: 'jobposting.saved',
        select: 'title description jobType applicants experienceLevel remoteWork salary jobAdDeadline media location benefits jobAdLink skills jobAdSource postedBy industry tags',
        populate: [
          {
            path: 'postedBy',
            select: 'name email' // Adjust fields as necessary
          },
          {
            path: 'media.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          },
          {
            path: 'applicants.resumeVideo.mediaRef',
            model: 'Video',
            populate: {
              path: 'thumbnailUrl',
              model: 'Image'
            }
          }
        ]
      });;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process the saved job postings to filter and format applicants
    const savedJobPostings = user.jobposting.saved.map(job => {
      const applicants = job.applicants.map(applicant => {
        if (String(applicant.user) === String(userId)) {
          return {
            companyReview: applicant.companyReview,
            user: applicant.user,
            coverLetter: applicant.coverLetter,
            applicantStatus: applicant.applicantStatus,
            _id: applicant._id,
            appliedDate: applicant.appliedDate,
            applicationHistory: applicant.applicationHistory,
            evaluationRounds: applicant.evaluationRounds,
            resumeVideo: applicant.resumeVideo
          };
        } else {
          return {
            user: applicant.user
          };
        }
      });
      return {
        ...job.toObject(),
        applicants: applicants
      };
    });

    // Send response with user details and processed job postings
    res.status(200).json({
      user: {
        jobposting: {
          saved: savedJobPostings
        },
        _id: user._id
      }
    });
  } catch (error) {
    console.error('Error fetching saved job postings:', error);
    res.status(500).json({ message: 'An error occurred while fetching saved job postings' });
  }
};






const getJobsCurrentUserByApplicantStatus = async (req, res, status) => {
  try {
    const userId = getUserIdFromToken(req);

    // Find the user by ID and get the applied job postings
    const user = await IndividualUser.findById(userId).select('jobposting');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch job postings with the specified applicant status for the user
    const jobPostingsWithStatus = await Promise.all(
      user.jobposting.applied.map(async (jobId) => {
        const job = await JobAds.findById(jobId)
          .select('title description jobType experienceLevel applicants remoteWork salary jobAdDeadline media location benefits jobAdLink skills jobAdSource postedBy industry tags')
          .populate({
            path: 'postedBy',
            select: 'name email', // Adjust fields as necessary
          })
          .lean();

        if (job) {
          // Check if there are applicants matching userId and applicantStatus
          const hasMatchingApplicant = job.applicants.some(applicant =>
            applicant.user.toString() === userId && applicant.applicantStatus === status
          );

          // Return the job only if there are matching applicants
          if (hasMatchingApplicant) {
            // Process applicants to include full details for the current user and only user field for others
            const processedApplicants = job.applicants.map(applicant => {
              if (applicant.user.toString() === userId && applicant.applicantStatus === status) {
                return applicant; // Include full details for the current user
              } else {
                return { user: applicant.user }; // Include only the user field for others
              }
            });

            // Modify job object to include processed applicants only
            return { ...job, applicants: processedApplicants };
          }
        }

        return null; // Return null if no matching applicants or job not found
      })
    );

    // Filter out null values (jobs without matching applicants)
    const filteredJobPostings = jobPostingsWithStatus.filter(job => job !== null);

    // Send response with filtered job postings
    res.status(200).json(filteredJobPostings);
  } catch (error) {
    console.error(`Error fetching ${status} job postings:`, error);
    res.status(500).json({ message: `An error occurred while fetching ${status} job postings` });
  }
};






// Controller for pending job postings
export const getCurrentUserPendingJobs = (req, res) => {
  getJobsCurrentUserByApplicantStatus(req, res, 'pending');
};

// Controller for reviewed job postings
export const getCurrentUserShortlistedJobs = (req, res) => {
  getJobsCurrentUserByApplicantStatus(req, res, 'shortlisted');
};

// Controller for accepted job postings
export const getCurrentUserSelectedJobs = (req, res) => {
  getJobsCurrentUserByApplicantStatus(req, res, 'selected');
};

// Controller for rejected job postings
export const getCurrentUserRejectedJobs = (req, res) => {
  getJobsCurrentUserByApplicantStatus(req, res, 'rejected');
};






const getJobsUserByApplicantStatus = async (req, res, status) => {
  try {
    const { userId } = req.params;

    // Find the user by ID and get the applied job postings
    const user = await IndividualUser.findById(userId).select('jobposting');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch job postings with the specified applicant status for the user
    const jobPostingsWithStatus = await Promise.all(
      user.jobposting.applied.map(async (jobId) => {
        const job = await JobAds.findById(jobId)
          .select('title description jobType experienceLevel applicants remoteWork salary jobAdDeadline media location benefits jobAdLink skills jobAdSource postedBy industry tags')
          .populate({
            path: 'postedBy',
            select: 'name email', // Adjust fields as necessary
          })
          .lean();

        if (job) {
          // Check if there are applicants matching userId and applicantStatus
          const hasMatchingApplicant = job.applicants.some(applicant =>
            applicant.user.toString() === userId && applicant.applicantStatus === status
          );

          // Return the job only if there are matching applicants
          if (hasMatchingApplicant) {
            // Process applicants to include full details for the current user and only user field for others
            const processedApplicants = job.applicants.map(applicant => {
              if (applicant.user.toString() === userId && applicant.applicantStatus === status) {
                return applicant; // Include full details for the current user
              } else {
                return { user: applicant.user }; // Include only the user field for others
              }
            });

            // Modify job object to include processed applicants only
            return { ...job, applicants: processedApplicants };
          }
        }

        return null; // Return null if no matching applicants or job not found
      })
    );

    // Filter out null values (jobs without matching applicants)
    const filteredJobPostings = jobPostingsWithStatus.filter(job => job !== null);

    // Send response with filtered job postings
    res.status(200).json(filteredJobPostings);
  } catch (error) {
    console.error(`Error fetching ${status} job postings:`, error);
    res.status(500).json({ message: `An error occurred while fetching ${status} job postings` });
  }
};


// Controller for pending job postings
export const getUserPendingJobs = (req, res) => {
  getJobsUserByApplicantStatus(req, res, 'pending');
};

// Controller for reviewed job postings
export const getUserShortlistedJobs = (req, res) => {
  getJobsUserByApplicantStatus(req, res, 'shortlisted');
};

// Controller for selected job postings
export const getUserSelectedJobs = (req, res) => {
  getJobsUserByApplicantStatus(req, res, 'selected');
};

// Controller for rejected job postings
export const getUserRejectedJobs = (req, res) => {
  getJobsUserByApplicantStatus(req, res, 'rejected');
};


// Controller to toggle following/unfollowing an organization
export const toggleFollowOrganization = async (req, res) => {
  const { organizationId } = req.params;
  const userId = getUserIdFromToken(req);

  try {
    // Find the individual user by userId
    const individualUser = await IndividualUser.findById(userId).select('followingOrganizations');
    if (!individualUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the organization by organizationId
    const organization = await OrganizationalUser.findById(organizationId).select('candidateFollowers');
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if the user is already following the organization
    const isFollowing = individualUser.followingOrganizations.includes(organizationId);

    if (isFollowing) {
      // If following, remove organizationId from user's followingOrganizations
      individualUser.followingOrganizations.pull(organizationId);

      // Remove userId from organization's candidateFollowers
      organization.candidateFollowers.pull(userId);
    } else {
      // If not following, add organizationId to user's followingOrganizations
      individualUser.followingOrganizations.push(organizationId);

      // Add userId to organization's candidateFollowers
      organization.candidateFollowers.push(userId);
    }

    // Save the updated documents
    await individualUser.save();
    await organization.save();

    res.status(200).json({
      message: isFollowing ? 'Unfollowed the organization successfully' : 'Followed the organization successfully',
      individualUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};






// Controller to get all following organizations for an individual user
export const getFollowingOrganizations = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    // Find the individual user by userId and populate followingOrganizations with selected fields
    const individualUser = await IndividualUser.findById(userId)
      .populate({
        path: 'followingOrganizations',
        select: 'name companyLogo bio industry address', // Select the fields you want to return
      })
      .select('followingOrganizations'); // Only select followingOrganizations field from the user

    if (!individualUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Following organizations retrieved successfully',
      followingOrganizations: individualUser.followingOrganizations,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



export const addRecommendation = async (req, res) => {
  try {
    const { jobId, toUserEmail, recommendedBy } = req.body;

    const fromUserId = recommendedBy || getUserIdFromToken(req)

    // Validate inputs
    if (!jobId || !toUserEmail || !fromUserId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if the job and users exist
    const job = await JobAds.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const recommendingUser = await IndividualUser.findById(fromUserId);
    if (!recommendingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recommendedToUser = await User.findOne({ 'email.id': toUserEmail });
    console.log(recommendedToUser)

    // const recommendedToUser = await IndividualUser.findById(toUserId);
    if (!recommendedToUser) {
      return res.status(404).json({ success: false, message: 'User to recommend to not found' });
    }

    //  Check if the recommending user has an active subscription

    // const subscription = recommendingUser.subscription;
    const today = new Date();
    // if (!subscription) {
    //   return res.status(403).json({ success: false, message: 'User does not have an active subscription' });
    // }




    // Check if a similar recommendation already exists
    const existingRecommendation = await Recommendation.findOne({
      job: jobId,
      recommendedTo: recommendedToUser._id,
      recommendedBy: fromUserId
    });

    if (existingRecommendation) {
      return res.status(409).json({ success: false, message: 'Recommendation already exists' });
    }
    // Create the recommendation
    const recommendation = new Recommendation({
      job: jobId,
      recommendedTo: recommendedToUser._id,
      recommendedBy: fromUserId,
    });

    await recommendation.save();

    // Update recommending user's recommendedJobs array
    recommendingUser.recommendedJobs.push(recommendation._id);
    await recommendingUser.save();

    // Update recommendedToUser's receivedRecommendations array
    recommendedToUser?.receivedRecommendations?.push(recommendation._id);

    const fromUser = await User.findById(fromUserId).populate('profilePicture');

    // const toUser = await User.findById(toUserId);

    await recommendedToUser.save();
    await sendNewRecommendationFromUserEmail(recommendedToUser, job, fromUser)
    res.status(200).json({ success: true, message: 'Job recommended successfully', recommendedToUser, job, fromUser });
  } catch (error) {
    console.error('Error recommending job:', error);
    res.status(500).json({ success: false, message: 'Error recommending job' });
  }
};

export const updateRecommendation = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { isRecommended } = req.body;

    // Validate inputs
    if (!recommendationId || !isRecommended) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if the recommendation exists
    const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    // Update recommendation
    recommendation.isRecommended = isRecommended;
    await recommendation.save();

    res.status(200).json({ success: true, message: 'Recommendation updated successfully' });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ success: false, message: 'Error updating recommendation' });
  }
};


export const deleteRecommendation = async (req, res) => {
  try {
    const { recommendationId } = req.params;

    // Validate input
    if (!recommendationId) {
      return res.status(400).json({ success: false, message: 'Recommendation ID is required' });
    }

    // Check if the recommendation exists
    const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    // Remove recommendation ID from recommending user's recommendedJobs array
    await IndividualUser.findByIdAndUpdate(recommendation.recommendedBy, {
      $pull: { recommendedJobs: recommendationId }
    });

    // Remove recommendation ID from recommended-to user's receivedRecommendations array
    await IndividualUser.findByIdAndUpdate(recommendation.recommendedTo, {
      $pull: { receivedRecommendations: recommendationId }
    });

    // Delete recommendation
    await Recommendation.deleteOne({ _id: recommendationId });

    res.status(200).json({ success: true, message: 'Recommendation deleted successfully' });
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ success: false, message: 'Error deleting recommendation' });
  }
};




// Controller to get recommended jobs for an IndividualUser
export const getRecommendedJobs = async (req, res) => {
  const userId = getUserIdFromToken(req); // Function to get user ID from token

  try {
    const user = await IndividualUser.findById(userId)
      .populate({
        path: 'recommendedJobs',
        populate: [
          {
            path: 'job',
            model: 'JobAds',
            select: '_id title description jobType remoteWork jobAdDeadline media location postedBy applicants.user createdAt',
          }, // Populate job details and applicants' user info
          {
            path: 'recommendedTo',
            model: 'User',
            select: 'name email profilePicture',
            populate: {
              path: 'profilePicture',
              model: 'Image'
            }
          }, // Populate user who recommended
        ]
      })
      .exec();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Extract recommended jobs with detailed job, recommendedBy, and media information
    const detailedRecommendedJobs = await Promise.all(user.recommendedJobs.map(async (recommendation) => {
      const job = recommendation.job.toObject();

      // Populate mediaRef based on mediaType
      if (job.media?.mediaType === 'Video') {
        await JobAds.populate(job, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: { path: 'thumbnailUrl', model: 'Image' }
        });
      } else if (job.media?.mediaType === 'Image') {
        await JobAds.populate(job, { path: 'media.mediaRef', model: 'Image' });
      }

      // Process applicants to filter details
      job.applicants = job.applicants.map(applicant => {
        if (applicant.user) {
          return {
            ...applicant,
            user: applicant.user._id.toString() === userId
              ? applicant.user
              : { _id: applicant.user._id }
          };
        }
        return applicant; // Return applicant as is if user is null
      });

      return {
        ...recommendation.toObject(),
        job: {
          ...job,
          applicantsCount: job.applicants.length,
        }
      };
    }));

    res.status(200).json({ success: true, recommendedJobs: detailedRecommendedJobs });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({ success: false, message: 'Error fetching recommended jobs' });
  }
};



// Controller to get received recommendations for an IndividualUser

export const getReceivedRecommendations = async (req, res) => {
  const userId = getUserIdFromToken(req); // Function to get user ID from token

  try {
    const user = await IndividualUser.findById(userId)
      .populate({
        path: 'receivedRecommendations',
        populate: [
          {
            path: 'job',
            model: 'JobAds',
            select: '_id title description jobType remoteWork jobAdDeadline media location postedBy applicants.user createdAt',
          }, // Populate job details and applicants' user info
          {
            path: 'recommendedBy',
            model: 'User',
            select: 'name email profile profilePicture',
            populate: {
              path: 'profilePicture',
              model: 'Image'
            }
          }, // Populate user who recommended
        ]
      })
      .exec();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Extract recommended jobs with detailed job, recommendedBy, and media information
    const detailedReceivedRecommendedJobs = await Promise.all(user.receivedRecommendations.map(async (recommendation) => {
      const job = recommendation.job.toObject();

      // Populate mediaRef based on mediaType
      if (job.media?.mediaType === 'Video') {
        await JobAds.populate(job, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: { path: 'thumbnailUrl', model: 'Image' }
        });
      } else if (job.media?.mediaType === 'Image') {
        await JobAds.populate(job, { path: 'media.mediaRef', model: 'Image' });
      }

      // Process applicants to filter details
      job.applicants = job.applicants.map(applicant => {
        if (applicant.user) {
          return {
            ...applicant,
            user: applicant.user._id.toString() === userId
              ? applicant.user
              : { _id: applicant.user._id }
          };
        }
        return applicant; // Return applicant as is if user is null
      });

      return {
        ...recommendation.toObject(),
        job: {
          ...job,
          applicantsCount: job.applicants.length,
        }
      };
    }));

    res.status(200).json({ success: true, recommendedJobs: detailedReceivedRecommendedJobs });
  } catch (error) {
    console.error('Error fetching recommended jobs:', error);
    res.status(500).json({ success: false, message: 'Error fetching recommended jobs' });
  }
};

export const getAllIndividualUsersForRecommendation = async (req, res) => {
  try {
    const { name, email, phone } = req.query;

    // Build the query object
    const query = { 'profile.profileType': 'IndividualUser' };

    if (name) {
      const nameParts = name.split(' ').map(part => new RegExp(part, 'i'));
      query['$or'] = [
        { 'name.first': { $in: nameParts } },
        { 'name.middle': { $in: nameParts } },
        { 'name.last': { $in: nameParts } }
      ];
    }

    if (email) {
      query['email.id'] = new RegExp(email, 'i');
    }

    if (phone) {
      query['phone.number'] = new RegExp(phone, 'i');
    }

    // Find users matching the query
    const users = await User.find(query)
      .select('email phone name profilePicture profile')
      .populate('profilePicture');

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching individual users:', error);
    res.status(500).json({ success: false, message: 'Error fetching individual users' });
  }
};
