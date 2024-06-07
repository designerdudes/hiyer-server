import jwt from 'jsonwebtoken';
import OrganizationMember from '../../models/organizationUser.model/organizationMember.model.js';

// Function to get user ID from token
const getUserIdFromToken = (req) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  return decodedToken.id;
};

// Add or Update Organization Member Data
export const addOrUpdateOrganizationMember = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    // Fetch the organization member document
    let organizationMember = await OrganizationMember.findById(userId);

    if (!organizationMember) {
      // If organization member doesn't exist, create a new document
      organizationMember = new OrganizationMember({ _id: userId });
    }

    const memberData = req.body;

    // Update address if provided
    if (memberData.address) {
      organizationMember.address = memberData.address;
    }

    // Update role if provided
    if (memberData.role) {
      organizationMember.role = memberData.role;
    }

    // Update department if provided
    if (memberData.department) {
      organizationMember.department = memberData.department;
    }

    // Update date of joining if provided
    if (memberData.dateOfJoining) {
      organizationMember.dateOfJoining = memberData.dateOfJoining;
    }

    // Update profile picture if provided
    if (memberData.profilePicture) {
      organizationMember.profilePicture = memberData.profilePicture;
    }

    // Update social links if provided
    if (memberData.socialLinks) {
      organizationMember.socialLinks = memberData.socialLinks;
    }

    // Update languages if provided
    if (memberData.languages) {
      organizationMember.languages = memberData.languages;
    }

    // Save the updated organization member data
    await organizationMember.save();

    res.status(200).json({
      message: "Organization member data updated successfully",
      member: organizationMember,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};


// Update Address
export const updateAddress = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationMember = await OrganizationMember.findById(userId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body.address) {
      organizationMember.address = req.body.address;
    }

    await organizationMember.save();

    res.status(200).json({ message: "Address updated successfully", member: organizationMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Role
export const updateRole = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationMember = await OrganizationMember.findById(userId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body.role) {
      organizationMember.role = req.body.role;
    }

    await organizationMember.save();

    res.status(200).json({ message: "Role updated successfully", member: organizationMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Department
export const updateDepartment = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationMember = await OrganizationMember.findById(userId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body.department) {
      organizationMember.department = req.body.department;
    }

    await organizationMember.save();

    res.status(200).json({ message: "Department updated successfully", member: organizationMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Date of Joining
export const updateDateOfJoining = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationMember = await OrganizationMember.findById(userId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body.dateOfJoining) {
      organizationMember.dateOfJoining = req.body.dateOfJoining;
    }

    await organizationMember.save();

    res.status(200).json({ message: "Date of Joining updated successfully", member: organizationMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Profile Picture
export const updateProfilePicture = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationMember = await OrganizationMember.findById(userId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body.profilePicture) {
      organizationMember.profilePicture = req.body.profilePicture;
    }

    await organizationMember.save();

    res.status(200).json({ message: "Profile Picture updated successfully", member: organizationMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Social Links
export const updateSocialLinks = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationMember = await OrganizationMember.findById(userId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body.socialLinks) {
      organizationMember.socialLinks = req.body.socialLinks;
    }

    await organizationMember.save();

    res.status(200).json({ message: "Social Links updated successfully", member: organizationMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Update Languages
export const updateLanguages = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    let organizationMember = await OrganizationMember.findById(userId);
    if (!organizationMember) {
      return res.status(404).json({ message: "Organization member not found" });
    }

    if (req.body.languages) {
      organizationMember.languages = req.body.languages;
    }

    await organizationMember.save();

    res.status(200).json({ message: "Languages updated successfully", member: organizationMember });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
