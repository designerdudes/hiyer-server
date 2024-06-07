import OrganizationalUser from "../../models/organizationUser.model/organizationUser.model.js";



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



// Add or Update Organizational User Data
export const addOrUpdateUserData = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    // Find user by ID or create a new one if not found
    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Update user data with the request body fields if provided
    const userData = req.body;
    const updateFields = [
      "name",
      "type",
      "industry",
      "address",
      "contact",
      "teamMembers",
      "projects",
      "website",
      "socialLinks",
      "logo",
      "bio",
    ];
    updateFields.forEach(field => {
      if (userData[field]) {
        organizationalUser[field] = userData[field];
      }
    });

    // Save the updated user data
    await OrganizationalUser.save();

    // Send response
    res.status(200).json({
      message: "Organizational user data updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    // Handle errors
    res.status(400).json({ message: error.message });
  }
};


// Add or Update Address
export const addOrUpdateAddress = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { pincode, state, city, country, landmark } = req.body;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Update address fields if provided
    if (pincode) organizationalUser.address.pincode = pincode;
    if (state) organizationalUser.address.state = state;
    if (city) organizationalUser.address.city = city;
    if (country) organizationalUser.address.country = country;
    if (landmark) organizationalUser.address.landmark = landmark;

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Address added or updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};




// Add or Update Team Members
export const addOrUpdateTeamMembers = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const teamMembers = req.body.teamMembers;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Update team members if provided
    if (teamMembers) {
      organizationalUser.teamMembers = teamMembers;
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Team members added or updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Add Team Member
export const addTeamMember = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const newTeamMember = req.body.newTeamMember;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Add the new team member to the list
    organizationalUser.teamMembers.push(newTeamMember);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Team member added successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update Team Member
export const updateTeamMember = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const teamMemberId = req.params.teamMemberId;
    const updatedTeamMember = req.body.updatedTeamMember;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the team member to update
    const teamMemberIndex = organizationalUser.teamMembers.findIndex(
      (member) => member._id.toString() === teamMemberId
    );

    if (teamMemberIndex === -1) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Merge the existing team member data with the new data
    organizationalUser.teamMembers[teamMemberIndex] = {
      ...organizationalUser.teamMembers[teamMemberIndex],
      ...updatedTeamMember,
    };

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Team member updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Delete Team Member
export const deleteTeamMember = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const teamMemberId = req.params.teamMemberId;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the team member to delete
    const teamMemberIndex = organizationalUser.teamMembers.findIndex(
      (member) => member._id.toString() === teamMemberId
    );

    if (teamMemberIndex === -1) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Remove the team member entry from the array
    organizationalUser.teamMembers.splice(teamMemberIndex, 1);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Team member deleted successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};



// Add or Update Projects
export const addOrUpdateProjects = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const projects = req.body.projects;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Update projects if provided
    if (projects) {
      organizationalUser.projects = projects;
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Projects added or updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Add Project
export const addProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const newProject = req.body.newProject;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Add the new project to the list
    organizationalUser.projects.push(newProject);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Project added successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const projectId = req.params.projectId;
    const updatedProject = req.body.updatedProject;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the project to update
    const projectIndex = organizationalUser.projects.findIndex(
      (project) => project._id.toString() === projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Merge the existing project data with the new data
    organizationalUser.projects[projectIndex] = {
      ...organizationalUser.projects[projectIndex],
      ...updatedProject,
    };

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Project updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Delete Project
export const deleteProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const projectId = req.params.projectId;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the project to delete
    const projectIndex = organizationalUser.projects.findIndex(
      (project) => project._id.toString() === projectId
    );

    if (projectIndex === -1) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Remove the project entry from the array
    organizationalUser.projects.splice(projectIndex, 1);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Project deleted successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};


// Add or Update Contact Information
export const addOrUpdateContactInfo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const contactInfo = req.body.contactInfo;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Update contact information if provided
    if (contactInfo) {
      organizationalUser.contact = contactInfo;
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Contact information added or updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Add or Update Website
export const addOrUpdateWebsite = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const website = req.body.website;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Update website if provided
    if (website) {
      organizationalUser.website = website;
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Website added or updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Add or Update Social Links
export const addOrUpdateSocialLinks = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const socialLinks = req.body.socialLinks;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      // If user doesn't exist, create a new document
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    // Update social links if provided
    if (socialLinks) {
      organizationalUser.socialLinks = socialLinks;
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Social links added or updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update Logo
export const updateLogo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const logo = req.body.logo;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update logo if provided
    if (logo) {
      organizationalUser.logo = logo;
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Logo updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update Bio
export const updateBio = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const bio = req.body.bio;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update bio if provided
    if (bio) {
      organizationalUser.bio = bio;
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Bio updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Add Social Link
export const addSocialLink = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const socialLink = req.body.socialLink;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the social link to the list
    organizationalUser.socialLinks.push(socialLink);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Social link added successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};



// Update Social Link
export const updateSocialLink = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const socialLinkId = req.params.socialLinkId;
    const updatedSocialLink = req.body.updatedSocialLink;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the social link to update
    const socialLinkIndex = organizationalUser.socialLinks.findIndex(
      (link) => link._id.toString() === socialLinkId
    );

    if (socialLinkIndex === -1) {
      return res.status(404).json({ message: "Social link not found" });
    }

    // Merge the existing social link data with the new data
    organizationalUser.socialLinks[socialLinkIndex] = {
      ...organizationalUser.socialLinks[socialLinkIndex],
      ...updatedSocialLink,
    };

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Social link updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Delete Social Link
export const deleteSocialLink = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const socialLinkId = req.params.socialLinkId;

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the social link to delete
    const socialLinkIndex = organizationalUser.socialLinks.findIndex(
      (link) => link._id.toString() === socialLinkId
    );

    if (socialLinkIndex === -1) {
      return res.status(404).json({ message: "Social link not found" });
    }

    // Remove the social link from the array
    organizationalUser.socialLinks.splice(socialLinkIndex, 1);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Social link deleted successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};


