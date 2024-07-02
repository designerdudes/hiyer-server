import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/v1/user.route.js";
import individualUserRoute from "./routes/v1/individualUser.route/individualUser.route.js";
import organizationRoute from "./routes/v1/organization.route/organizationUser.route.js";
import organizationMemberRoute from "./routes/v1/organization.route/organizationMember.route.js"
import jobAdsRoute from "./routes/v1/jobAds.route/jobAds.js"
import mediaControllRoute from "./routes/v1/mediaControll.route/mediaControll.js";
import dropDownControllRoute from "./routes/v1/api/dropdownRoutes.js";

import authRoute from "./routes/v1/auth.route.js";
import errorHandler from "./middleware/error.js";
import { updateAllImageUrls, updateAllVideoUrls } from "./controllers/mediaControl.controller/mediaUpload.js";
import JobAds from "./models/organization.model/jobAds.model.js";

dotenv.config();


// Retry connection to MongoDB
const connectWithRetry = () => {
  console.log('MongoDB connection with retry');
  return mongoose.connect(process.env.DB_URL).then(() => {
      console.log('MongoDB is connected');
  }).catch((err) => {
      console.error('MongoDB connection unsuccessful, retry after 5 seconds. ', err);
      setTimeout(connectWithRetry, 5000);
  });
};
connectWithRetry();

const app = express();
app.use(express.json());

// Enable CORS for a specific origin
app.use(cors({ origin: "*" }));

// Basic home route
app.get("/", (req, res) => {
  res.send("home");
});
app.use("/auth/v1", authRoute);
app.use("/user/v1", userRoute);
app.use("/individualUser/v1", individualUserRoute);
app.use("/organization/v1", organizationRoute);
app.use("/organizationMember/v1", organizationMemberRoute);
app.use("/jobAds/v1", jobAdsRoute);

app.use("/media/v1", mediaControllRoute);


app.use("/dropDown/v1", dropDownControllRoute);

// Route to update all video URLs
app.put('/update-videos', updateAllVideoUrls);

// Route to update all image URLs
app.put('/update-images', updateAllImageUrls);

app.put('/update-job-ads-keys', async (req, res) => {
  try {
    // Get all job ads
    const jobAds = await JobAds.find();

    // Iterate through each job ad and update keys
    for (let jobAd of jobAds) {
      if (jobAd.applicationType) jobAd.jobType = jobAd.applicationType;
      if (jobAd.applicationDeadline) jobAd.jobAdDeadline = jobAd.applicationDeadline;
      if (jobAd.applicationLink) jobAd.jobAdLink = jobAd.applicationLink;
      if (jobAd.applicationSource) jobAd.jobAdSource = jobAd.applicationSource;
      
      // Update the embedded applicant schema keys if needed
      for (let applicant of jobAd.applicants) {
        if (applicant.companyReview) {
          applicant.evaluationRounds = applicant.companyReview;
          applicant.companyReview = undefined;
        }
        // Correct the mediaType value
        if (applicant.resumeVideo && applicant.resumeVideo.mediaType === 'video') {
          applicant.resumeVideo.mediaType = 'Video';
        }
        if (applicant.resumeVideo && applicant.resumeVideo.mediaType === 'image') {
          applicant.resumeVideo.mediaType = 'Image';
        }
      }

      // Correct the mediaType value in the job ad's media field
      if (jobAd.media && jobAd.media.mediaType === 'video') {
        jobAd.media.mediaType = 'Video';
      }
      if (jobAd.media && jobAd.media.mediaType === 'image') {
        jobAd.media.mediaType = 'Image';
      }

      // Remove old keys
      jobAd.applicationType = undefined;
      jobAd.applicationDeadline = undefined;
      jobAd.applicationLink = undefined;
      jobAd.applicationSource = undefined;

      // Save the updated job ad
      await jobAd.save();
    }

    res.status(200).json({ message: 'Job Ads updated successfully' });
  } catch (error) {
    console.error('Error updating job ads:', error);
    res.status(500).json({ error: 'An error occurred while updating job ads' });
  }
});



app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT);
});