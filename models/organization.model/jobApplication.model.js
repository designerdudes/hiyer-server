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
        required: true
    },
    mediaRef: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'mediaType', // Dynamic reference path based on mediaType
        required: true
    }
}, {
    timestamps: true,
}); 

const applicantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    resumeVideo: { mediaSchema },
    coverLetter: {
        type: String,

    },
    applicantStatus: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending',
    },
    applicantNotes: String,
    appliedDate: {
        type: Date,
        default: Date.now,
    },
    companyReview: {
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
        interviewer: String,
        interviewDate: Date,
        interviewNotes: String,
        technicalAssessment: String,
        culturalFitAssessment: String,
        referencesChecked: Boolean,
    },
    applicationHistory: [{
        status: String,
        notes: String,
        updatedAt: Date,
    }],
    evaluationRounds: [roundSchema],
});



const jobApplicationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    applicationType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship','freelance','volunteer','seasonal','apprenticeship'],
        required: true,
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
    salary: String,
    applicationDeadline: Date,
    Media: { mediaSchema },
    location: String,
    benefits: [String],
    applicationLink: String,
    skills: [String],
    applicationSource: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    industry: {
        type: String,
    },
    tags: [String],

    applicants: [applicantSchema],


}, {
    timestamps: true,
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication;
