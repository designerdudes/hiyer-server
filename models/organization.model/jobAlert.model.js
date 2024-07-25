import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'volunteer', 'seasonal', 'apprenticeship'],
  },
  experienceLevel: {
    type: String,
    enum: ['entry-level', 'mid-level', 'senior-level'],
  }
}, {
  timestamps: true
});

const JobAlert = mongoose.model("JobAlert", jobAlertSchema);

export default JobAlert;
