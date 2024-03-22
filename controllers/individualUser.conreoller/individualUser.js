import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import mongoose from "mongoose";

export const addOrUpdateUserData = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const userId = decodedToken.id;
  try {
    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      // If user doesn't exist, create a new document
      individualUser = new IndividualUser({ _id: userId });
    }

    const userData = req.body;

    // Update address if provided
    if (userData.address) {
      individualUser.address = userData.address;
    }

    // Update social links if provided
    if (userData.socialLinks) {
      individualUser.socialLinks = userData.socialLinks;
    }

    // Update resume if provided
    if (userData.resume) {
      individualUser.resume = userData.resume;
    }

    // Update portfolio if provided
    if (userData.portfolio) {
      individualUser.portfolio = userData.portfolio;
    }

    // Update bio if provided
    if (userData.bio) {
      individualUser.bio = userData.bio;
    }

    // Save the updated user data
    await individualUser.save();

    res.status(200).json({
      message: "User data updated successfully",
      user: individualUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addEducation = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const userId = decodedToken.id;

  try {
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
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const userId = decodedToken.id;
  const educationId = req.params.educationId;

  try {
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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;
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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;

    let individualUser = await IndividualUser.findById(userId);

    if (!individualUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add new experience
    individualUser.experiences.push(req.body);

    // Save the updated user data
    await individualUser.save();

    res
      .status(200)
      .json({ message: "Experience added successfully", user: individualUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;
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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;
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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;

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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;
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
    individualUser.skills[skillIndex].name = name;
    individualUser.skills[skillIndex].proficiency = proficiency;

    // Save the updated user data
    await individualUser.save();

    res
      .status(200)
      .json({ message: "Skill updated successfully", user: individualUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;
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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;

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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;

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
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;
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
