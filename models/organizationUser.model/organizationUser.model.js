import mongoose from "mongoose";
import validator from 'validator';

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
  status: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending',
  },
});


const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
  urls: {
    type: [String],
    validate: {
      validator: (urls) => urls.every((url) => validator.isURL(url)),
      message: (props) => `${props.value} contains invalid URLs`,
    },
  },
  toolsUsed: {
    type: [String],
  },
  role: String, 
  highlights: [String],  
});


// Schema for Organizational User
const organizationalUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyLogo:String,
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
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
      github:String,
    }, 
    bio: String,
    postedJobAds: [{ 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobAds',
    }],
    savedCandidates:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IndividualUser'
      
    }],candidateFollowers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IndividualUser'
    }] ,recommendedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recommendation',
    }],jobAlerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobAlert',
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
