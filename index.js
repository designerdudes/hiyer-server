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
import './config/passport/auth.js'
import authRoute from "./routes/v1/auth.route.js";
import errorHandler from "./middleware/error.js";
import { updateAllImageUrls, updateAllVideoUrls } from "./controllers/mediaControl.controller/mediaUpload.js";
import JobAds from "./models/organization.model/jobAds.model.js";
import passport from "passport";
import session from "express-session";
import {sendEmail} from "./config/zohoMail.js";
import paymentRouter from "./routes/v1/individualUser.route/payment.js";
import './utils/cronjob.js'
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


// Set up session management
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
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
app.use("/payments/v1",paymentRouter)
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


// Route for initiating google authentication

app.get('/auth/google', (req, res, next) => {
  req.session.profileType = req.body.profileType;
  next();
}, passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, data) => {
    if (err) {
      return res.redirect('/auth/google/failure');
    }
    if (!data) {
      return res.redirect('/auth/google/failure');
    }
    // Send the token to the frontend
    res.redirect(`/auth/google/success?token=${data.token}`);
  })(req, res, next);
});

app.get('/auth/google/success', (req, res) => {
  const { token } = req.query;
  res.json({ success: true, message: 'Authentication successful', token });
});

app.get('/auth/google/failure', (req, res) => {
  res.json({ success: false, message: 'Authentication failed' });
});


// Route for initiating Facebook authentication
app.get('/auth/facebook', (req, res, next) => {
  req.session.profileType = req.body.profileType;  
  next();
}, passport.authenticate('facebook', { scope: ['email'] }));

// Callback route after Facebook authentication
app.get('/auth/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', (err, data) => {
    if (err) {
      return res.redirect('/auth/facebook/failure');
    }
    if (!data) {
      return res.redirect('/auth/facebook/failure');
    }
    // Send the token to the frontend
    res.redirect(`/auth/facebook/success?token=${data.token}`);
  })(req, res, next);
});

// Success route
app.get('/auth/facebook/success', (req, res) => {
  const { token } = req.query;
  res.json({ success: true, message: 'Authentication successful', token });
});

// Failure route
app.get('/auth/facebook/failure', (req, res) => {
  res.json({ success: false, message: 'Authentication failed' });
});


// Route for initiating GitHub authentication
app.get('/auth/github', (req, res, next) => {
  req.session.profileType = req.body.profileType;  // Assuming you pass profileType in the request body
  next();
}, passport.authenticate('github'));

// Callback route after GitHub authentication
app.get('/auth/github/callback', (req, res, next) => {
  passport.authenticate('github', (err, data) => {
    if (err) {
      return res.redirect('/auth/github/failure');
    }
    if (!data) {
      return res.redirect('/auth/github/failure');
    }
    // Send the token to the frontend
    res.redirect(`/auth/github/success?token=${data.token}`);
  })(req, res, next);
});

// Success route
app.get('/auth/github/success', (req, res) => {
  const { token } = req.query;
  res.json({ success: true, message: 'Authentication successful', token });
});

// Failure route
app.get('/auth/github/failure', (req, res) => {
  res.json({ success: false, message: 'Authentication failed' });
});

// Route for initiating Twitter authentication
app.get('/auth/twitter', (req, res, next) => {
  req.session.profileType = req.body.profileType;  // Assuming you pass profileType in the request body
  next();
}, passport.authenticate('twitter'));

// Callback route after Twitter authentication
app.get('/auth/twitter/callback', (req, res, next) => {
  passport.authenticate('twitter', (err, data) => {
    if (err) {
      return res.redirect('/auth/twitter/failure');
    }
    if (!data) {
      return res.redirect('/auth/twitter/failure');
    }
    // Send the token to the frontend
    res.redirect(`/auth/twitter/success?token=${data.token}`);
  })(req, res, next);
});

// Success route
app.get('/auth/twitter/success', (req, res) => {
  const { token } = req.query;
  res.json({ success: true, message: 'Authentication successful', token });
});

// Failure route
app.get('/auth/twitter/failure', (req, res) => {
  res.json({ success: false, message: 'Authentication failed' });
});


// Route for initiating Apple authentication
app.get('/auth/apple', (req, res, next) => {
  req.session.profileType = req.body.profileType;  // Assuming you pass profileType in the request body
  next();
}, passport.authenticate('apple'));

// Callback route after Apple authentication
app.get('/auth/apple/callback', (req, res, next) => {
  passport.authenticate('apple', (err, data) => {
    if (err) {
      return res.redirect('/auth/apple/failure');
    }
    if (!data) {
      return res.redirect('/auth/apple/failure');
    }
    // Send the token to the frontend
    res.redirect(`/auth/apple/success?token=${data.token}`);
  })(req, res, next);
});

// Success route
app.get('/auth/apple/success', (req, res) => {
  const { token } = req.query;
  res.json({ success: true, message: 'Authentication successful', token });
});

// Failure route
app.get('/auth/apple/failure', (req, res) => {
  res.json({ success: false, message: 'Authentication failed' });
});

// Route for initiating LinkedIn authentication
app.get('/auth/linkedin', (req, res, next) => {
  req.session.profileType = req.body.profileType;  // Assuming you pass profileType in the request body
  next();
}, passport.authenticate('linkedin'));

// Callback route after LinkedIn authentication
app.get('/auth/linkedin/callback', (req, res, next) => {
  passport.authenticate('linkedin', (err, data) => {
    if (err) {
      return res.redirect('/auth/linkedin/failure');
    }
    if (!data) {
      return res.redirect('/auth/linkedin/failure');
    }
    // Send the token to the frontend
    res.redirect(`/auth/linkedin/success?token=${data.token}`);
  })(req, res, next);
});

// Success route
app.get('/auth/linkedin/success', (req, res) => {
  const { token } = req.query;
  res.json({ success: true, message: 'Authentication successful', token });
});

// Failure route
app.get('/auth/linkedin/failure', (req, res) => {
  res.json({ success: false, message: 'Authentication failed' });
});

// Route for initiating Microsoft authentication
app.get('/auth/microsoft', (req, res, next) => {
  req.session.profileType = req.body.profileType;  // Assuming you pass profileType in the request body
  next();
}, passport.authenticate('microsoft'));

// Callback route after Microsoft authentication
app.get('/auth/microsoft/callback', (req, res, next) => {
  passport.authenticate('microsoft', (err, data) => {
    if (err) {
      return res.redirect('/auth/microsoft/failure');
    }
    if (!data) {
      return res.redirect('/auth/microsoft/failure');
    }
    // Send the token to the frontend
    res.redirect(`/auth/microsoft/success?token=${data.token}`);
  })(req, res, next);
});

// Success route
app.get('/auth/microsoft/success', (req, res) => {
  const { token } = req.query;
  res.json({ success: true, message: 'Authentication successful', token });
});

// Failure route
app.get('/auth/microsoft/failure', (req, res) => {
  res.json({ success: false, message: 'Authentication failed' });
});


 const sendDynamicEmail = async (req, res) => {
  const { toAddress, toName, subject, body } = req.body;

  if (!toAddress || !toName || !subject || !body) {
    return res.status(400).json({ error: 'All fields (toAddress, toName, subject, body) are required' });
  }

  try {
    await sendEmail(toAddress, toName, subject, body);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending email' });
  }
};

app.post('/send-email', sendDynamicEmail);


app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log("Server listening on port " + process.env.PORT);
});