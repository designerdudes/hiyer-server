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

// Schema for Education
const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
  },
  institute: {
    type: String,
    required: true,
  }, fieldofStudy: {
    type: String,
  },
  // grade
  startDate: {
    type: Date,
    required: true,
  },
  endDate: Date,
});

// Schema for Experience
const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
  },
  logoUrl: {
    type: String,
  },
  positions: {
    type: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        employmentType: {
          type: String,
          enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'volunteer', 'seasonal', 'apprenticeship'],
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: Date,
      },
    ],
    required: true,
  },
}, {
  timestamps: true
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
  }, logoUrl: {
    type: String,
  },
});

// Schema for Certification
const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  }, logoUrl: {
    type: String,
  },
  issuer: String,
  logoUrl: String,
  issueDate: Date,
  expirationDate: Date,
  url: String,
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  }, logoUrl: {
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

// Schema for Subscription
const subscriptionSchema = new mongoose.Schema({
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true,
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    required: true,
  },
});

const videoResumePackSchema = new mongoose.Schema({
  transactionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
  }],
  numberOfVideoResumesAllowed: {
    type: Number,
    required: true,
    default: 1,

  },
  currentNumberOfVideoResumes: {
    type: Number,
    default: 0,
  },
}, { _id: false });

// Schema for Individual User
const individualUserSchema = new mongoose.Schema(
  {
    industry: [{
      type: String,
    }], intrestedCompanies: [{
      type: String,
    }],
    address: addressSchema,
    education: [educationSchema],
    experiences: [experienceSchema],
    skills: [skillSchema],
    certifications: [certificationSchema],
    socialLinks: {
      linkedin: String,
      instagram: String,
      facebook: String,
      twitter: String,
      youtube: String,
      github: String,
    },
    projects: [projectSchema],
    resume: String,
    portfolio: String,
    bio: String,
    // joiningFeePaid: {
    //   type: Boolean, 
    //   default: false,
    // },
    subscription: subscriptionSchema,
    jobposting: {
      applied: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "JobAds",
        default: [],
      },
      saved: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "JobAds",
        default: [],
      },
    },
    introVideo: {
      videoRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
      videoTitle: String,
      videoDescription: String,
    },
    videoResume: [
      {
        videoRef: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Video",
        },
        videoTitle: {
          type: String,
        },
        videoDescription: {
          type: String,
        },
      },
    ],
    videoResumePack: videoResumePackSchema,
    followingOrganizations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    }],
    recommendedJobs: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Recommendation',
      default: [],
    },
    receivedRecommendations: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Recommendation',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const IndividualUser = mongoose.model("IndividualUser", individualUserSchema);

export default IndividualUser;
