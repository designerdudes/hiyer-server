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

// Schema for Education
const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true,
  },
  institute: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

// Schema for Experience
const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
});

// Schema for Skill
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  proficiency: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    required: true,
  },
});

// Schema for Certification
const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  issuer: String,
  issueDate: Date,
  expirationDate: Date,
  url:String,
});

// Schema for Individual User
const individualUserSchema = new mongoose.Schema(
  {
    address: addressSchema,
    education: [educationSchema],
    experiences: [experienceSchema],
    skills: [skillSchema],
    certifications: [certificationSchema],
    socialLinks: {
      linkedin: String,
      instagram: String,
    },
    resume: String,
    portfolio: String,
    bio: String,
  },
  {
    timestamps: true,
  }
);

const IndividualUser = mongoose.model("IndividualUser", individualUserSchema);

export default IndividualUser;
