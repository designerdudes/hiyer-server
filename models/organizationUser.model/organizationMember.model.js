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
    institution: {
        type: String,
        required: true,
    },
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    grade: String,
    activitiesAndSocieties: String,
    description: String,
});

// Schema for Work Experience
const workExperienceSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
    },
    position: String,
    startDate: {
        type: Date,
        required: true,
    },
    endDate: Date,
    description: String,
});

// Schema for Skills
const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    proficiency: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    },
});

// Schema for Organization Member
const organizationMemberSchema = new mongoose.Schema(
    {
        address: addressSchema,
        role: {
            type: String,
            required: true,
        },
        department: String,
        dateOfJoining: {
            type: Date,
            required: true,
        },
        profilePicture: String,
        // bio: String,
        socialLinks: {
            linkedin: String,
            twitter: String,
            facebook: String,
            github: String,
            personalWebsite: String,
        },
        // education: [educationSchema],
        // workExperience: [workExperienceSchema],
        // skills: [skillSchema],
        // certifications: [String],
        languages: [String],
        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrganizationalUser",
            required: true,
          },subscription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubscriptionTransaction', 
            default: null  
          },
        // hobbies: [String],
    },
    {
        timestamps: true,
    }
);

const OrganizationMember = mongoose.model("OrganizationMember", organizationMemberSchema);

export default OrganizationMember;
