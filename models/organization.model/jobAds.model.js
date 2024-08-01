import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  notes: String,
  interviewDate: Date,
});


const mediaSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    enum: ['Video', 'Image'],
    // required: true
  },
  mediaRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'mediaType',
    // required: true
  }
}, {
  timestamps: true,
});

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resumeVideo: mediaSchema,
  coverLetter: {
    type: String,
  },
  applicantStatus: {
    type: String,
    enum: ['pending', 'shortlisted', 'selected', 'rejected'],
    default: 'pending',
  },
  applicantNotes: String,
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  // companyReview: {
  //   status: {
  //     type: String,
  //     enum: ['pending', 'completed'],
  //     default: 'pending',
  //   },
  //   interviewer: String,
  //   interviewDate: Date,
  //   interviewNotes: String,
  //   technicalAssessment: String,
  //   culturalFitAssessment: String,
  //   referencesChecked: Boolean,
  // },
  applicationHistory: [{
    status: String,
    notes: String,
    updatedAt: Date,
  }],
  evaluationRounds: [roundSchema],
});

const jobAdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'volunteer', 'seasonal', 'apprenticeship'],
    // required: true,
  },
  experienceLevel: {
    type: String,
    enum: ['entry-level', 'mid-level', 'senior-level'],
    required: true,
  },
  remoteWork: {
    type: Boolean,
    default: false,
  },
  salary: {
    min: {
      type: Number,

    },
    max: {
      type: Number,

    },
    currency: {
      type: String,
      default: 'INR',
    }
  },
  jobAdDeadline: Date,
  media: mediaSchema,
  location: String,
  benefits: [String],
  jobAdLink: String,
  skills: [String],
  jobAdSource: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  industry: {
    type: String,
  },
  tags: [String],
  applicants: [applicationSchema],
}, {
  timestamps: true,
});

const JobAds = mongoose.model('JobAds', jobAdSchema);

export default JobAds;