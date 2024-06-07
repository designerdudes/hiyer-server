import mongoose from "mongoose";

// Schema for Address
const addressSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  landmark: String,
});

// Schema for Team Member
const teamMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  position: String,
});

// Schema for Project
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
});

// Schema for Organizational User
const organizationalUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: String,
    industry: String,
    address: addressSchema,
    contact: {
      email: {
        type: String,
        required: true,
      },
      phone: String,
    },
    teamMembers: [teamMemberSchema],
    projects: [projectSchema],
    website: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
    },
    logo: String,
    bio: String,
    postedApplications: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
    }],
  },
  {
    timestamps: true,
  }
);

const OrganizationalUser = mongoose.model(
  "Organization",
  organizationalUserSchema
);

export default OrganizationalUser;
