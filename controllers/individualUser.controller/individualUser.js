import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import User from "../../models/user.model.js";
import validator from 'validator';
import JobApplication from "../../models/organization.model/jobApplication.model.js";

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
      experiences: individualUser.experiences,
    });
  } catch (error) {
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

    // Find the index of the position to delete
    const positionIndex = experience.positions.findIndex(
      (pos) => pos._id.toString() === positionId
    );

    if (positionIndex === -1) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Remove the position entry from the array
    experience.positions.splice(positionIndex, 1);

    // Check if the number of positions is less than or equal to 1, delete the entire experience
    if (experience.positions.length <= 1) {
      // Remove the experience entry from the array
      individualUser.experiences.id(experienceId).remove();
    }

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "Position deleted successfully",
      experiences: individualUser.experiences,
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
    const  skillId = req.params.id;

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
    const  certificationId  = req.params.id;

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
    const  projectId  = req.params.id;

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
    const   projectId  = req.params.id;

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
    const videoRef  = req.params.id;

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


export const addIntroVideo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req); // Assuming you have a function to get userId
    const { videoTitle, videoDescription } = req.body;

    let mediaResult = {};
    if (req.files && req.files.video) {
      mediaResult = await uploadMedia(req); // Assuming uploadMedia returns video_id
    } else {
      return res.status(400).json({ error: "Video file is required" });
    }

    const newIntroVideo = {
      videoRef: mediaResult.video_id,
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


export const applyJobApplication = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;
    const { coverLetter, mediaType, mediaRef } = req.body;

    // Convert id to ObjectId using 'new'
    const jobId = new mongoose.Types.ObjectId(id);

    const media = {
      mediaType,
      mediaRef,
    };

    const newApplicant = {
      user: userId,
      resumeVideo: media,
      coverLetter,
    };

    const jobApplication = await JobApplication.findById(jobId);
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

export const withdrawJobApplicant = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { jobId } = req.params;

    // Convert jobId and userId to ObjectId
    const jobObjectId = mongoose.Types.ObjectId(jobId);
    const userObjectId = mongoose.Types.ObjectId(userId);

    // Find the job application by ID
    const jobApplication = await JobApplication.findById(jobObjectId);
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Find the index of the applicant within the job application's applicants array
    const applicantIndex = jobApplication.applicants.findIndex(app => app.user.toString() === userObjectId.toString());
    if (applicantIndex === -1) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Remove the applicant from the applicants array
    jobApplication.applicants.splice(applicantIndex, 1);
    await jobApplication.save();

    // Update IndividualUser model to remove the applied job
    await IndividualUser.findByIdAndUpdate(userObjectId, {
      $pull: { "jobposting.applied": jobApplication._id },
    });

    res.status(200).json({ message: 'Applicant removed successfully' });
  } catch (error) {
    console.error('Error removing applicant:', error);
    res.status(500).json({ error: 'An error occurred while removing the applicant' });
  }
};

export const toggleSaveJobApplication = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;

    // Convert id to ObjectId
    const jobId = mongoose.Types.ObjectId(id);

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
    const userId = getUserIdFromToken(req);
    const user = await User.findById(userId).select('email phone name profilePicture profile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const individualUser = await IndividualUser.findById(user.profile.profileRef)
    .populate('jobposting.applied')
    .populate('jobposting.saved')
    .populate('postedVideo.videoRef');
    if (!individualUser) {
      return res.status(404).json({ message: 'Individual user profile not found' });
    }

    res.status(200).json({
      user,
      individualUser,
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ message: 'An error occurred while fetching user details' });
  }
};


//Controller to get user details by ID from URL parameter
export const getUserDetailsById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('email phone name profile profilePicture');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const individualUser = await IndividualUser.findById(user.profile.profileRef)
    .populate('postedVideo.videoRef');
    if (!individualUser) {
      return res.status(404).json({ message: 'Individual user profile not found' });
    }

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
    const user = await User.findById(userId).select('email phone name profilePicture profile');
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



