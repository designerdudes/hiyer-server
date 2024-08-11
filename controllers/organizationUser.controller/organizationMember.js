import jwt from 'jsonwebtoken';
import OrganizationMember from '../../models/organizationUser.model/organizationMember.model.js';
import { getUserIdFromToken } from '../../utils/getUserIdFromToken.js';
import User from '../../models/user.model.js';
import e from 'express';
import OrganizationalUser from '../../models/organizationUser.model/organizationUser.model.js';


export const getOrganizationalMemberDataFromToken = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const organizationMember = await OrganizationMember.findById(userId
    );

    const user = await User.findById(organizationMember._id)
      .select('email phone name profilePicture profile')
      .populate('profilePicture');
    if (!user) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    const organization = await OrganizationalUser.findById(organizationMember.organization);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }



    res.status(200).json({
      member: organizationMember,
      organization: organization
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Add or Update Organization Member Data
export const addOrUpdateOrganizationMember = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    // Fetch the organization member document
    let organizationMember = await OrganizationMember.findById(userId);

    if (!organizationMember) {
      // If organization member doesn't exist, validate the user and create a new document
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.profile.profileType !== "OrganizationMember") {
        return res.status(400).json({ message: "User is not an organization member" });
      }

      if (!req.body.organization) {
        return res.status(400).json({ message: "Organization ID is required to create a new organization member" });
      }

      organizationMember = new OrganizationMember({
        _id: userId, name: req.body.name,
        organization: req.body.organization
      });
    }

    const memberData = req.body;

    // Update the provided fields
    Object.assign(organizationMember, memberData);

    // Save the updated organization member data
    await organizationMember.save();

    res.status(200).json({
      message: "Organization member data updated successfully",
      member: organizationMember,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Get a specific organization member
export const getOrganizationMember = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const organizationMember = await OrganizationMember.findById(userId || req.params.userId);

    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    res.status(200).json({ member: organizationMember });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Organization Members
export const getOrganizationMembers = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const organizationMember = await OrganizationMember.findById(userId || req.params.userId)


    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    const organizationMembers = await OrganizationMember.find({ organization: organizationMember.organization });

    res.status(200).json({ members: organizationMembers });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// General Update Function
const updateOrganizationMemberField = async (req, res, field) => {
  try {
    const userId = getUserIdFromToken(req);
    let organizationMember = await OrganizationMember.findById(userId);

    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body[field]) {
      organizationMember[field] = req.body[field];
      await organizationMember.save();
      res.status(200).json({ message: `${field} updated successfully`, member: organizationMember });
    } else {
      res.status(400).json({ message: `${field} not provided` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Address
export const updateAddress = (req, res) => updateOrganizationMemberField(req, res, 'address');




// Update Department
export const updateDepartment = (req, res) => updateOrganizationMemberField(req, res, 'department');

// Update Date of Joining
export const updateDateOfJoining = (req, res) => updateOrganizationMemberField(req, res, 'dateOfJoining');

// Update Profile Picture
export const updateProfilePicture = (req, res) => updateOrganizationMemberField(req, res, 'profilePicture');

// Update Social Links
export const updateSocialLinks = (req, res) => updateOrganizationMemberField(req, res, 'socialLinks');

// Update Languages
export const updateLanguages = (req, res) => updateOrganizationMemberField(req, res, 'languages');