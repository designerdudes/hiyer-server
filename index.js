import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./routes/v1/user.route.js";
import individualUserRoute from "./routes/v1/individualUser.route/individualUser.route.js";
import organizationRoute from "./routes/v1/organization.route/organizationUser.route.js";
import organizationMemberRoute from "./routes/v1/organization.route/organizationMember.route.js"
import jobApplicationRoute from "./routes/v1/jobApplication.route/jobApplication.js"
import mediaControllRoute from "./routes/v1/mediaControll.route/mediaControll.js";
import dropDownControllRoute from "./routes/v1/api/dropdownRoutes.js";

import authRoute from "./routes/v1/auth.route.js";
import errorHandler from "./middleware/error.js";
import { updateAllImageUrls, updateAllVideoUrls } from "./controllers/mediaControl.controller/mediaUpload.js";

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
app.use("/jobApplication/v1", jobApplicationRoute);

app.use("/media/v1", mediaControllRoute);


app.use("/dropDown/v1", dropDownControllRoute);

// Route to update all video URLs
app.put('/update-videos', updateAllVideoUrls);

// Route to update all image URLs
app.put('/update-images', updateAllImageUrls);

app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT);
});