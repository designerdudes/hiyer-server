import OrganizationMember from "../../models/organizationUser.model/organizationMember.model.js";
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
export const addTeamMember = async (req, res) => {
  try {
    const organizationId = getUserIdFromToken(req); // Assuming the token contains the organization ID

    const { email, countryCode, mobileNo, firstName,
      middleName,
      lastName, profileType, role, department, dateOfJoining } = req.body;

    // Prepare user data
    const userData = {
      email: {
        id: email,
      },
      phone: {
        countryCode,
        number: mobileNo,
      },
      name: {
        first: firstName || "",
        middle: middleName || "",
        last: lastName || "",
      },
      profile: {
        profileType,
      },
    };

    // Create a new User document
    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Prepare organization member data
    const organizationMemberData = {

      role,
      department,
      dateOfJoining,
      organization: organizationId,
      _id: savedUser._id, // Use the _id of the newly created user as profileRef
    };

    // Create a new OrganizationMember document
    const newOrganizationMember = new OrganizationMember(organizationMemberData);
    await newOrganizationMember.save();

    // Update the User document with the profile reference
    await User.findByIdAndUpdate(savedUser._id, {
      $set: {
        "profile.profileRef": savedUser._id, // Update the nested field
      },
    });

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(organizationId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Add the new team member to the list
    organizationalUser.teamMembers.push({
      userId: savedUser._id,
      position: role,
    });

    // Save the updated organizational user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Team member added successfully",
      teamMemberId: savedUser._id,
      organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update Team Member
export const updateTeamMember = async (req, res) => {
  try {
    const organizationId = getUserIdFromToken(req); // Assuming the token contains the organization ID
    const { teamMemberId } = req.params;
    const {
      email,
      countryCode,
      mobileNo,
      firstName,
      middleName,
      lastName,
      profileType,
      role,
      department,
      dateOfJoining
    } = req.body;

    // Find the existing user by teamMemberId
    const existingUser = await User.findById(teamMemberId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    existingUser.email.id = email || existingUser.email.id;
    existingUser.phone.countryCode = countryCode || existingUser.phone.countryCode;
    existingUser.phone.number = mobileNo || existingUser.phone.number;
    existingUser.name.first = firstName || existingUser.name.first;
    existingUser.name.middle = middleName || existingUser.name.middle;
    existingUser.name.last = lastName || existingUser.name.last;
    existingUser.profile.profileType = profileType || existingUser.profile.profileType;

    await existingUser.save();

    // Find the existing organization member by teamMemberId
    const existingOrganizationMember = await OrganizationMember.findById(teamMemberId);
    if (!existingOrganizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    // Update organization member data
    existingOrganizationMember.role = role || existingOrganizationMember.role;
    existingOrganizationMember.department = department || existingOrganizationMember.department;
    existingOrganizationMember.dateOfJoining = dateOfJoining || existingOrganizationMember.dateOfJoining;

    await existingOrganizationMember.save();

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(organizationId);
    if (!organizationalUser) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Update the role in the teamMembers array if necessary
    const teamMemberIndex = organizationalUser.teamMembers.findIndex(
      member => member.userId.toString() === teamMemberId
    );
    if (teamMemberIndex !== -1) {
      organizationalUser.teamMembers[teamMemberIndex].position = role || organizationalUser.teamMembers[teamMemberIndex].position;
      await organizationalUser.save();
    } else {
      return res.status(404).json({ message: "Team member not found in organization" });
    }

    res.status(200).json({
      message: "Team member updated successfully",
      teamMemberId: existingUser._id,
      organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Delete Team Member
export const deleteTeamMember = async (req, res) => {
  try {
    const organizationId = getUserIdFromToken(req); // Assuming the token contains the organization ID
    const { teamMemberId } = req.params;

    // Find and delete the User document
    const user = await User.findById(teamMemberId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.remove();

    // Find and delete the OrganizationMember document
    const organizationMember = await OrganizationMember.findById(teamMemberId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }
    await organizationMember.remove();

    // Find the organizational user by organization ID
    let organizationalUser = await OrganizationalUser.findById(organizationId);
    if (!organizationalUser) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Remove the team member from the list
    organizationalUser.teamMembers = organizationalUser.teamMembers.filter(
      (member) => member.userId.toString() !== teamMemberId
    );

    // Save the updated organizational user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Team member deleted successfully",
      organizationalUser,
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

// Add URL to Project
export const addUrlToProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { projectId } = req.params;
    const { url } = req.body;

    if (!url || !validator.isURL(url)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project to update
    let project = organizationalUser.projects.id(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Add the new URL
    project.urls.push(url);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "URL added successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update URL in Project
export const updateUrlInProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { projectId, urlIndex } = req.params;
    const { url } = req.body;

    if (!url || !validator.isURL(url)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project to update
    let project = organizationalUser.projects.id(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (urlIndex < 0 || urlIndex >= project.urls.length) {
      return res.status(400).json({ message: "Invalid URL index" });
    }

    // Update the URL
    project.urls[urlIndex] = url;

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "URL updated successfully",
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


