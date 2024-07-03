import mongoose from "mongoose";
import OrganizationMember from "../../models/organizationUser.model/organizationMember.model.js";
import OrganizationalUser from "../../models/organizationUser.model/organizationUser.model.js";
import User from "../../models/user.model.js";
import { getUserIdFromToken } from "../../utils/getUserIdFromToken.js";
import validator from 'validator';
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import Video from "../../models/video.model.js";
import Image from "../../models/image.model.js";
import JobAds from "../../models/organization.model/jobAds.model.js";

 
 

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
      if (userData.hasOwnProperty(field)) {  // Check if field exists in req.body
        organizationalUser[field] = userData[field];
      }
    });

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Organizational user data updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add or Update Address
export const addOrUpdateAddress = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { pincode, state, city, country, landmark } = req.body;

    // Find the organizational user by user ID or create a new one if not found
    let organizationalUser = await OrganizationalUser.findById(userId) || new OrganizationalUser({ _id: userId });

    // Update address fields if provided
    organizationalUser.address = organizationalUser.address || {};
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
    res.status(400).json({ message: error.message });
  }
};




// Add or Update Team Members
export const addTeamMember = async (req, res) => {
  try {
    const organizationId = getUserIdFromToken(req);

    const { email, countryCode, mobileNo, firstName, middleName, lastName, role, department, dateOfJoining } = req.body;

    // Create a new User document
    const newUser = new User({
      email: { id: email },
      phone: { countryCode, number: mobileNo },
      name: {
        first: firstName || "",
        middle: middleName || "",
        last: lastName || "",
      },
      profile: { profileType: "OrganizationMember" },
    });

    const savedUser = await newUser.save();

    // Create a new OrganizationMember document
    const newOrganizationMember = new OrganizationMember({
      role,
      department,
      dateOfJoining,
      organization: organizationId,
      _id: savedUser._id,
    });

    await newOrganizationMember.save();

    // Update the User document with the profile reference
    savedUser.profile.profileRef = savedUser._id;
    await savedUser.save();

    // Find and update the organizational user
    const organizationalUser = await OrganizationalUser.findByIdAndUpdate(
      organizationId,
      {
        $push: { teamMembers: { userId: savedUser._id, position: role } },
      },
      { new: true }
    );

    if (!organizationalUser) {
      return res.status(404).json({ message: "Organization not found" });
    }

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
    const { email, countryCode, mobileNo, firstName, middleName, lastName, profileType, role, department, dateOfJoining } = req.body;

    // Find the existing user by teamMemberId
    const existingUser = await User.findById(teamMemberId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user data
    if (email) existingUser.email.id = email;
    if (countryCode) existingUser.phone.countryCode = countryCode;
    if (mobileNo) existingUser.phone.number = mobileNo;
    if (firstName) existingUser.name.first = firstName;
    if (middleName) existingUser.name.middle = middleName;
    if (lastName) existingUser.name.last = lastName;
    if (profileType) existingUser.profile.profileType = profileType;

    await existingUser.save();

    // Find the existing organization member by teamMemberId
    const existingOrganizationMember = await OrganizationMember.findById(teamMemberId);
    if (!existingOrganizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    // Update organization member data
    if (role) existingOrganizationMember.role = role;
    if (department) existingOrganizationMember.department = department;
    if (dateOfJoining) existingOrganizationMember.dateOfJoining = dateOfJoining;

    await existingOrganizationMember.save();

    // Find the organizational user by user ID
    let organizationalUser = await OrganizationalUser.findById(organizationId);
    if (!organizationalUser) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Update the role in the teamMembers array if necessary
    const teamMemberIndex = organizationalUser.teamMembers.findIndex(member => member.userId.toString() === teamMemberId);
    if (teamMemberIndex !== -1) {
      if (role) organizationalUser.teamMembers[teamMemberIndex].position = role;
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
    const user = await User.findByIdAndDelete(teamMemberId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find and delete the OrganizationMember document
    const organizationMember = await OrganizationMember.findByIdAndDelete(teamMemberId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

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


export const addProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add new project
    organizationalUser.projects.push(req.body);

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({ message: "Project added successfully", user: organizationalUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const updateProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const projectId = req.params.id;
    const updateData = req.body;

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

    // Update only the provided fields
    for (const key in updateData) {
      if (updateData.hasOwnProperty(key)) {
        project.set(key, updateData[key]);
      }
    }

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "Project updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const deleteProject = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const projectId = req.params.id;

    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the index of the project to delete
    const projectIndex = organizationalUser.projects.findIndex(
      (proj) => proj._id.toString() === projectId
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

    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the project to update
    let project = organizationalUser.projects.id(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (urlId < 0 || urlId >= project.urls.length) {
      return res.status(400).json({ message: "Invalid URL index" });
    }

    // Update the URL
    project.urls[urlId] = url;

    // Save the updated user data
    await organizationalUser.save();

    res.status(200).json({
      message: "URL updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeProjectURL = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id, urlId } = req.params;

    let organizationalUser = await OrganizationalUser.findById(userId);

    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const project = organizationalUser.projects.id(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (urlId >= project.urls.length) {
      return res.status(404).json({ message: "URL index out of range" });
    }

    project.urls.splice(urlId, 1);

    await organizationalUser.save();

    res.status(200).json({
      message: "URL removed from project successfully",
      user: organizationalUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add or Update Contact Information
export const addOrUpdateContactInfo = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const contactInfo = req.body.contactInfo;

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    if (contactInfo) {
      organizationalUser.contact = contactInfo;
    }

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

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    if (website) {
      organizationalUser.website = website;
    }

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

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    if (socialLinks) {
      organizationalUser.socialLinks = socialLinks;
    }

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

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (logo) {
      organizationalUser.logo = logo;
    }

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

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bio) {
      organizationalUser.bio = bio;
    }

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
    const socialLinks = req.body.socialLinks;

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      organizationalUser = new OrganizationalUser({ _id: userId });
    }

    if (socialLinks) {
      organizationalUser.socialLinks = {
        ...organizationalUser.socialLinks,
        ...socialLinks,
      };
    }

    await organizationalUser.save();

    res.status(200).json({
      message: "Social links added or updated successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

// Update Social Links
export const updateSocialLinks = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const updatedSocialLinks = req.body; // This should be an object with keys corresponding to social links

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    for (const [key, value] of Object.entries(updatedSocialLinks)) {
      if (organizationalUser.socialLinks.hasOwnProperty(key)) {
        organizationalUser.socialLinks[key] = value;
      } else {
        return res.status(400).json({ message: `Invalid social link key: ${key}` });
      }
    }

    await organizationalUser.save();

    res.status(200).json({
      message: "Social links updated successfully",
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
    const socialLinkKey = req.params.socialLinkKey; // assuming key is passed as a param

    let organizationalUser = await OrganizationalUser.findById(userId);
    if (!organizationalUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!organizationalUser.socialLinks.hasOwnProperty(socialLinkKey)) {
      return res.status(404).json({ message: "Social link not found" });
    }

    // Delete the social link
    organizationalUser.socialLinks[socialLinkKey] = undefined;

    await organizationalUser.save();

    res.status(200).json({
      message: "Social link deleted successfully",
      user: organizationalUser,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};



export const toggleSaveCandidate = async (req, res) => {
  try {
    const orgUserId = getUserIdFromToken(req); 
    const { candidateId } = req.params; 
    const candidateObjectId = new mongoose.Types.ObjectId(candidateId);

    const organizationalUser = await OrganizationalUser.findById(orgUserId).select('savedCandidates');
    if (!organizationalUser) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const candidateIndex = organizationalUser.savedCandidates.indexOf(candidateObjectId);
    if (candidateIndex === -1) {
      organizationalUser.savedCandidates.push(candidateObjectId);
    } else {
      organizationalUser.savedCandidates.splice(candidateIndex, 1);
    }

    await organizationalUser.save();

    res.status(200).json({
      message: candidateIndex === -1 ? 'Candidate saved successfully' : 'Candidate removed from saved list',
      organization: organizationalUser,
    });
  } catch (error) {
    console.error('Error toggling saved candidate:', error);
    res.status(500).json({ error: 'An error occurred while toggling the saved candidate' });
  }
};

 

 

 
export const getOrganizationalUserData = async (req, res) => {
    try {
        const { orgid } = req.params;

        // Find the organizational user by ID and populate posted job ads
        const organizationalUser = await OrganizationalUser.findById(orgid)
            .populate({
                path: 'postedJobAds',
                select: '_id title description jobType remoteWork jobAdDeadline media location postedBy applicants.user createdAt'
                
            })
            .exec();
console.log(organizationalUser)
        if (!organizationalUser) {
            return res.status(404).json({ success: false, message: 'Organizational user not found' });
        }

        for (const jobAd of organizationalUser.postedJobAds) {
            const mediaType = jobAd.media?.mediaType;
            if (mediaType === 'Video') {
                await JobAds.populate(jobAd, {
                    path: 'media.mediaRef',
                    model: 'Video',
                    populate: { path: 'thumbnailUrl', model: 'Image' }
                });
            } else if (mediaType === 'Image') {
                await JobAds.populate(jobAd, {
                    path: 'media.mediaRef',
                    model: 'Image'
                });
            }
        }

        res.status(200).json({ success: true, data: organizationalUser });
    } catch (error) {
        console.error('Error fetching organizational user data:', error);
        res.status(500).json({ success: false, message: 'Error fetching organizational user data' });
    }
};



export const getSavedCandidates = async (req, res) => {
  try {
    const orgUserId = getUserIdFromToken(req); // Get organizational user ID from token

    const organizationalUser = await OrganizationalUser.findById(orgUserId).populate({
      path: 'savedCandidates',
      select: '_id', // Select only the _id of each saved candidate
      populate: {
        path: 'introVideo.videoRef',
        model: 'Video',
        populate: [
          {
            path: 'postedBy',
            model: 'User',
            select: 'name profilePicture', // Select fields you want from User model
          },
          {
            path: 'thumbnailUrl',
            model: 'Image',
          },
        ],
      },
    });

    if (!organizationalUser) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(200).json({
      savedCandidates: organizationalUser.savedCandidates,
    });
  } catch (error) {
    console.error('Error fetching saved candidates:', error);
    res.status(500).json({ error: 'An error occurred while fetching saved candidates' });
  }
};


export const getCandidateFollowers = async (req, res) => {
  try {
    const orgUserId = getUserIdFromToken(req); // Get organizational user ID from token

    const organizationalUser = await OrganizationalUser.findById(orgUserId).populate({
      path: 'candidateFollowers',
      select: '_id', // Select only the _id of each saved candidate
      populate: {
        path: 'introVideo.videoRef',
        model: 'Video',
        populate: [
          {
            path: 'postedBy',
            model: 'User',
            select: 'name profilePicture', // Select fields you want from User model
          },
          {
            path: 'thumbnailUrl',
            model: 'Image',
          },
        ],
      },
    });

    if (!organizationalUser) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.status(200).json({
      savedCandidates: organizationalUser.candidateFollowers,
    });
  } catch (error) {
    console.error('Error fetching saved candidates:', error);
    res.status(500).json({ error: 'An error occurred while fetching saved candidates' });
  }
};

// Controller to get Individual Users with introVideo based on various criteria
export const getIndividualUsersWithIntroVideo = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = req.query;

    // Build query based on filters
    let query = {};

    if (filters.industry) query['industry'] = { $in: filters.industry.split(',') };
    if (filters.intrestedCompanies) query['intrestedCompanies'] = { $in: filters.intrestedCompanies.split(',') };
    if (filters['address.state']) query['address.state'] = filters['address.state'];
    if (filters['education.degree']) query['education.degree'] = filters['education.degree'];
    if (filters['skills.name']) query['skills.name'] = { $in: filters['skills.name'].split(',') };

    // Count total documents that match the filters
    const totalCandidates = await IndividualUser.countDocuments(query);

    // Sort order handling
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Retrieve paginated individual users based on filters and sorting
    let individualUsersQuery = IndividualUser.find(query)
      .select('_id introVideo')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Populate introVideo field for each individualUser based on IndividualUser model
    individualUsersQuery = individualUsersQuery.populate({
      path: 'introVideo.videoRef',
      model: 'Video',
      populate: [
        {
          path: 'postedBy',
          model: 'User',
          select: 'name profilePicture  ', // Select fields you want from User model
        },
        {
          path: 'thumbnailUrl',
          model: 'Image',
        },
      ],
    });

    // Execute the query
    const individualUsers = await individualUsersQuery.exec();

    // Extract necessary fields from populated data
    const formattedUsers = individualUsers.map(user => ({
      _id: user._id,
      introVideo: user.introVideo,
      // Add other necessary fields if needed
    }));

    // Calculate total pages based on total individual users and limit
    const totalPages = Math.ceil(totalCandidates / limit);

    // Send response with pagination info and detailed individual users
    res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalCandidates,
      candidates: formattedUsers,
    });
  } catch (error) {
    console.error('Error fetching individual users:', error);
    res.status(500).json({ error: 'An error occurred while fetching individual users' });
  }
};




 
