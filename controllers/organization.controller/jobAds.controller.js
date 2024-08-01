import mongoose from "mongoose";
import { deleteImageFromCloudinary, deleteVideoFromCloudinary } from "../../config/cloudinary/cloudinary.config.js";
import JobAds from "../../models/organization.model/jobAds.model.js";
import OrganizationalUser from "../../models/organizationUser.model/organizationUser.model.js";
import Video from "../../models/video.model.js";
import { getUserIdFromToken } from "../../utils/getUserIdFromToken.js";
import { uploadImageController, uploadMedia } from "../mediaControl.controller/mediaUpload.js";
import User from "../../models/user.model.js";
import OrganizationMember from "../../models/organizationUser.model/organizationMember.model.js";
import JobAlert from "../../models/organization.model/jobAlert.model.js";
import { sendApplicantStatusUpdateEmail, sendEmailAdNotification, sendNewJobAlertByUserEmail, sendNewJobAlertEmail } from "../../config/zohoMail.js";
import IndividualUser from "../../models/individualUser.model/individualUser.model.js";
import path from "path";

export const notifyUsersOfNewJob = async (jobId, orgId) => {
  try {
    // Find the job details
    const job = await JobAds.findById(jobId);
    if (!job) return;

    // Construct the query based on provided fields
    const query = {
      organizationId: orgId,
      title: job.title
    };

    // Add optional fields to the query if they exist
    if (job.jobType) {
      query.jobType = job.jobType;
    }
    if (job.experienceLevel) {
      query.experienceLevel = job.experienceLevel;
    }

    // Find all job alerts that match the new job
    const jobAlerts = await JobAlert.find(query).populate('createdBy');

    // Notify each user who created a matching job alert
    for (const alert of jobAlerts) {
      const user = await User.findById(alert.createdBy._id);
      if (user) {
        // Construct the user's full name, including first, middle, and last names
        const fullName = [user.name.first, user.name.middle, user.name.last]
          .filter(namePart => namePart) // Filter out any undefined or empty parts
          .join(' '); // Join the parts with a space

        // const subject = "Job Alert Match";
        // const body = `A new job matching your alert has been created. Details: Title - ${job.title}, Description - ${job.description || 'No description provided'}, Job Type - ${job.jobType || 'No job type provided'}, Experience Level - ${job.experienceLevel || 'No experience level provided'}. Apply now!`;
        // await sendEmail(user.email.id, fullName, subject, body);
        await sendNewJobAlertEmail(user.email.id, fullName, job, orgId)
      }
    }
  } catch (error) {
    console.error('Error notifying users about new job:', error);
  }
};


export const addJobAds = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    // Destructure the request body
    const {
      title,
      description,
      jobType,
      experienceLevel,
      remoteWork,
      salary,
      jobAdDeadline,
      location,
      skills,
      category,
      tags,
    } = req.body;

    // Parse and format the salary object
    let parsedSalary = { min: 0, max: 0, currency: 'INR' };
    if (typeof salary === 'string') {
      try {
        parsedSalary = JSON.parse(salary);
      } catch (error) {
        console.error('Error parsing salary JSON:', error);
      }
    } else if (typeof salary === 'object') {
      parsedSalary = salary;
    }

    // Ensure salary fields have appropriate values
    const formattedSalary = {
      min: parsedSalary.min || 0,
      max: parsedSalary.max || 0,
      currency: parsedSalary.currency || 'INR',
    };

    // Optional: Ensure min and max are numbers and handle default values
    if (typeof formattedSalary.min !== 'number') formattedSalary.min = 0;
    if (typeof formattedSalary.max !== 'number') formattedSalary.max = 0;

    let mediaResult = {};
    if ((req.files && req.files.video && req.files.image) || (req.files && req.files.video)) {
      mediaResult = await uploadMedia(req);
    } else if (req.files && req.files.image) {
      console.log('mediaResult:', req.files, 'h', req.files.image);

      mediaResult = await uploadImageController(req);
    }

    // console.log('mediaResult:', mediaResult);

    const Media = {
      mediaType: req.files ? (req.files.video ? 'Video' : req.files.image ? 'Image' : '') : '',
      mediaRef: mediaResult?.video_id || mediaResult?.image_id || null
    };
    // console.log('Media:', Media);

    const filteredFields = {
      title,
      description,
      jobType,
      experienceLevel,
      remoteWork,
      salary: formattedSalary,
      jobAdDeadline,
      location,
      skills: JSON.parse(skills),
      category,
      tags: JSON.parse(tags),
      media: Media, // Assign the Media object here
      postedBy: userId // Associate the application with the user who posted it
    };

    const nonEmptyFields = Object.fromEntries(
      Object.entries(filteredFields).filter(
        ([key, value]) => value !== undefined && value !== null && value !== ''
      )
    );

    const newJobAds = new JobAds(nonEmptyFields);
    await newJobAds.save();

    // Update the organizational user's posted jobAds
    const organization = await OrganizationalUser.findByIdAndUpdate(
      userId,
      { $push: { postedJobAds: newJobAds._id } },
      { new: true }
    );

    // Get candidate followers' information
    const candidateFollowerIds = organization.candidateFollowers;
    const candidateFollowers = await User.find(
      { _id: { $in: candidateFollowerIds } },
      'email.id name.first name.last profilePicture'
    ).populate('profilePicture', 'imageUrl');
    console.log(candidateFollowers)
    const followerEmails = candidateFollowers.map(follower => ({
      email: follower.email.id,
      firstName: follower.name.first || '',
      lastName: follower.name.last || '',
      profilePictureUrl: follower.profilePicture ? follower.profilePicture.imageUrl : null
    }));

    // Notify users of the new job
    await notifyUsersOfNewJob(newJobAds._id, userId);
    console.log(followerEmails)

    // Send email notification to candidate followers
    for (const follower of followerEmails) {
      const { email, firstName, lastName, profilePictureUrl } = follower;
      console.log({
        email,
        jobTitle: newJobAds.title,
        jobId: newJobAds._id,
        orgId: organization._id,
        orgName: organization.name,
        orgLogo: organization.companyLogo,
        firstName,
        lastName,
        profilePictureUrl
      })
      await sendEmailAdNotification(email, {
        jobTitle: newJobAds.title,
        jobId: newJobAds._id,
        orgId: organization._id,
        orgName: organization.name,
        orgLogo: organization.companyLogo,
        firstName,
        lastName,
        profilePictureUrl
      });
    }

    // Send the response only once
    res.status(201).json(newJobAds);

  } catch (error) {
    // Ensure no other response has been sent before sending this one
    console.error('Error adding job application:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An error occurred while adding the job application' });
    }
  }
};




// Edit Job Application Details
export const editJobAdsDetails = async (req, res) => {
  try {
    const { id } = req.params; // Get job application ID from request parameters

    const {
      title,
      description,
      jobType,
      experienceLevel,
      remoteWork,
      salary,
      jobAdDeadline,
      location,
      skills,
      category,
      tags,
    } = req.body;

    const filteredFields = {
      title,
      description,
      jobType,
      experienceLevel,
      remoteWork,
      salary,
      jobAdDeadline,
      location,
      skills,
      category,
      tags,
    };

    const nonEmptyFields = Object.fromEntries(
      Object.entries(filteredFields).filter(
        ([key, value]) => value !== undefined && value !== null && value !== ''
      )
    );

    // Find the job application by ID and update it with the non-empty fields
    const updatedJobAds = await JobAds.findByIdAndUpdate(
      id,
      nonEmptyFields,
      { new: true } // Return the updated document
    );

    if (!updatedJobAds) {
      return res.status(404).json({ error: "Job application not found" });
    }

    res.status(200).json(updatedJobAds);
  } catch (error) {
    console.error('Error editing job application details:', error);
    res.status(500).json({ error: 'An error occurred while editing the job application details' });
  }
};

// // Edit Job Application Video
// export const editJobAdsVideo = async (req, res) => {
//     try {
//         const { id } = req.params; // Get job application ID from request parameters

//         const jobAds = await JobAds.findById(id);

//         if (!jobAds) {
//             return res.status(404).json({ error: "Job application not found" });
//         }

//         // Check if req.file.video exists
//         if (req.file && req.file.video) {
//             let uploadResult;
//             // Upload the new video to Cloudinary
//             try {
//                 uploadResult = await uploadVideoToCloudinary(req.file.video);
//             } catch (uploadError) {
//                 console.error('Error uploading video to Cloudinary:', uploadError);
//                 return res.status(500).json({ error: "Failed to upload video" });
//             }

//             // Handle existing video reference
//             if (jobAds.media && jobAds.media.mediaType === 'Video') {
//                 const video = await Video.findById(jobAds.media.mediaRef);
//                 if (video) {
//                     video.videoUrl = uploadResult.videoUrl;
//                     video.streamingUrls = {
//                         hls: uploadResult.hlsUrl,
//                         dash: uploadResult.dashUrl,
//                     };
//                     video.representations = uploadResult.representations;
//                     video.postedBy = jobAds.postedBy;
//                     await video.save();
//                 } else {
//                     const newVideo = new Video({
//                         videoUrl: uploadResult.videoUrl,
//                         streamingUrls: {
//                             hls: uploadResult.hlsUrl,
//                             dash: uploadResult.dashUrl,
//                         },
//                         representations: uploadResult.representations,
//                         postedBy: jobAds.postedBy,
//                     });
//                     await newVideo.save();

//                     jobAds.media = {
//                         mediaType: 'Video',
//                         mediaRef: newVideo._id,
//                     };
//                 }
//             } else {
//                 const newVideo = new Video({
//                     videoUrl: uploadResult.videoUrl,
//                     streamingUrls: {
//                         hls: uploadResult.hlsUrl,
//                         dash: uploadResult.dashUrl,
//                     },
//                     representations: uploadResult.representations,
//                     postedBy: jobAds.postedBy,
//                 });
//                 await newVideo.save();

//                 jobAds.media = {
//                     mediaType: 'Video',
//                     mediaRef: newVideo._id,
//                 };
//             }
//         } else {
//             return res.status(400).json({ error: "Video file is required" });
//         }

//         // Save the updated job application document
//         await jobAds.save();

//         res.status(200).json(jobAds);
//     } catch (error) {
//         console.error('Error editing job application video:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // Edit Job Application Image
// export const editJobAdsImage = async (req, res) => {
//     try {
//         const { id } = req.params; // Get job application ID from request parameters

//         const jobAds = await JobAds.findById(id);

//         if (!jobAds) {
//             return res.status(404).json({ error: "Job application not found" });
//         }

//         // Ensure the media type is an image
//         if (jobAds.media && jobAds.media.mediaType !== 'Image') {
//             return res.status(400).json({ error: "The media type is not an image" });
//         }

//         // Check if req.file.image exists
//         if (req.file && req.file.image) {
//             let uploadResult;
//             // Upload the new image to Cloudinary
//             try {
//                 uploadResult = await uploadImageToCloudinary(req.file.image);
//             } catch (uploadError) {
//                 console.error('Error uploading image to Cloudinary:', uploadError);
//                 return res.status(500).json({ error: "Failed to upload image" });
//             }

//             // Handle existing image reference
//             if (jobAds.media && jobAds.media.mediaRef) {
//                 const image = await Image.findById(jobAds.media.mediaRef);
//                 if (image) {
//                     // Delete the existing image from Cloudinary
//                     try {
//                         await deleteImageFromCloudinary(image.imageUrl);
//                     } catch (deleteError) {
//                         console.error('Error deleting image from Cloudinary:', deleteError);
//                         return res.status(500).json({ error: "Failed to delete existing image" });
//                     }
//                     // Remove the existing image document from the database
//                     try {
//                         await Image.findByIdAndDelete(jobAds.media.mediaRef);
//                     } catch (deleteError) {
//                         console.error('Error deleting image document:', deleteError);
//                         return res.status(500).json({ error: "Failed to delete existing image document" });
//                     }
//                 }
//             }

//             const newImage = new Image({
//                 imageUrl: uploadResult.imageUrl,
//                 transformations: [
//                     { width: 800, height: 800, quality: 'auto' }
//                 ],
//                 postedBy: jobAds.postedBy
//             });

//             await newImage.save();

//             jobAds.media = {
//                 mediaType: 'Image',
//                 mediaRef: newImage._id,
//             };
//         } else {
//             return res.status(400).json({ error: "Image file is required" });
//         }

//         // Save the updated job application document
//         await jobAds.save();

//         res.status(200).json(jobAds);
//     } catch (error) {
//         console.error('Error editing job application image:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// Delete Job Application


export const deleteJobAds = async (req, res) => {
  try {
    const { id } = req.params; // Get job application ID from request parameters

    const jobAds = await JobAds.findById(id);
    if (!jobAds) {
      return res.status(404).json({ error: "Job application not found" });
    }

    // Handle media deletion
    const { media } = jobAds;

    if (media && media.mediaType === 'Video') {
      const video = await Video.findById(media.mediaRef);
      if (video) {
        await deleteVideoFromCloudinary(video.videoUrl);
        await Video.findByIdAndDelete(media.mediaRef);
      }
    } else if (media && media.mediaType === 'Image') {
      const image = await Image.findById(media.mediaRef);
      if (image) {
        await deleteImageFromCloudinary(image.imageUrl);
        await Image.findByIdAndDelete(media.mediaRef);
      }
    }

    await JobAds.findByIdAndDelete(id);

    // Remove job application reference from OrganizationalUser model
    await OrganizationalUser.updateMany(
      { postedJobAds: id },
      { $pull: { postedJobAds: id } }
    );

    // Remove job application reference from IndividualUser model
    await IndividualUser.updateMany(
      {
        $or: [
          { 'jobposting.applied': id },
          { 'jobposting.saved': id }
        ]
      },
      {
        $pull: {
          'jobposting.applied': id,
          'jobposting.saved': id
        }
      }
    );

    res.status(200).json({ message: "Job application deleted successfully" });
  } catch (error) {
    console.error('Error deleting job application:', error);
    res.status(500).json({ error: 'An error occurred while deleting the job application' });
  }
};

// Controller to update the applicant status based on user ID
export const updateApplicantStatus = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    const { jobId, userId } = req.params;
    const { applicantStatus } = req.body;

    // Validate applicantStatus
    const validStatuses = ['pending', 'shortlisted', 'selected', 'rejected'];
    if (!validStatuses.includes(applicantStatus)) {
      return res.status(400).json({ error: 'Invalid applicant status' });
    }

    // Find the job application by ID
    const jobAds = await JobAds.findById(jobId).populate('postedBy');
    if (!jobAds) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Find the applicant within the job application by their user ID
    const applicant = jobAds.applicants.find(app => app.user.toString() === userId);
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Update the applicant status
    // applicant.applicantStatus = applicantStatus;
    // applicant.applicationHistory.push({
    //   status: applicantStatus,
    //   updatedAt: new Date(),
    //   notes: `Status updated to ${applicantStatus}`,
    // });

    // Save the changes to the job application
    // await jobAds.save();
    const user = await User.findById(userId);

    await sendApplicantStatusUpdateEmail(user, jobAds, applicantStatus);
    res.status(200).json({ message: 'Applicant status updated successfully', applicant, user, jobAds, applicantStatus });
  } catch (error) {
    console.error('Error updating applicant status:', error);
    res.status(500).json({ error: 'An error occurred while updating the applicant status' });
  }
};

// Controller to remove job applicant
export const removeJobApplicant = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {

    const { jobId } = req.params;

    // Find the job application by ID
    const jobAds = await JobAds.findById(jobId);
    if (!jobAds) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Find the index of the applicant within the job application's applicants array
    const applicantIndex = jobAds.applicants.findIndex(app => app.user.toString() === userId);
    if (applicantIndex === -1) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Remove the applicant from the applicants array
    jobAds.applicants.splice(applicantIndex, 1);
    await jobAds.save();

    // Update IndividualUser model to remove the applied job
    await IndividualUser.findByIdAndUpdate(userId, {
      $pull: { "jobposting.applied": jobAds._id },
    });

    res.status(200).json({ message: 'Applicant removed successfully' });
  } catch (error) {
    console.error('Error removing applicant:', error);
    res.status(500).json({ error: 'An error occurred while removing the applicant' });
  }
};

// Controller to get 5 job jobAds based on similarity of certain fields with pagination
export const getSimilarJobAdss = async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { industry, skills, tags, jobType, experienceLevel, location, page = 1, limit = 5 } = req.query;
  console.log(req.query)
  try {
    let query = {};

    if (industry) query.industry = industry;
    if (skills) query.skills = { $in: skills.split(',') };
    if (tags) query.tags = { $in: tags.split(',') };
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = location;

    const skip = (page - 1) * limit;
    const jobAdss1 = await JobAds.find(query)
    console.log(jobAdss1)

    const jobAdss = await JobAds.find(query)
      .select('_id title description jobType remoteWork jobAdDeadline media location industry postedBy applicants.user createdAt skills tags')
      .populate({
        path: 'postedBy',
        select: 'name email companyLogo industry contact'
      })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const detailedJobAdss = await Promise.all(jobAdss.map(async (jobAds) => {
      const mediaType = jobAds.media?.mediaType;
      if (mediaType === 'Video') {
        await JobAds.populate(jobAds, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: { path: 'thumbnailUrl', model: 'Image' }
        });
      } else if (mediaType === 'Image') {
        await JobAds.populate(jobAds, {
          path: 'media.mediaRef',
          model: 'Image'
        });
      }

      const applicantsCount = jobAds.applicants.length;

      return {
        ...jobAds,
        applicantsCount
      };
    }));

    res.status(200).json(detailedJobAdss);
  } catch (error) {
    console.error('Error fetching similar job jobAds:', error);
    res.status(500).json({ error: 'An error occurred while fetching similar job jobAds' });
  }
};

// Controller to get additional job application documents based on similar fields with pagination
export const getSimilarJobAdssFromId = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const jobAds = await JobAds.findById(id);
    if (!jobAds) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    const { industry, skills, tags, jobType, experienceLevel, location } = jobAds;
    const skip = (page - 1) * limit;

    // Query to find similar job jobAds based on fields
    const jobAdss = await JobAds.find({
      $or: [
        { industry },
        { skills: { $in: skills } },
        { tags: { $in: tags } },
        { jobType },
        { experienceLevel },
        { location },
      ],
      _id: { $ne: id }, // Exclude the current job application
    })
      .select('_id title description jobType remoteWork jobAdDeadline media location postedBy applicants.user createdAt')
      .populate({
        path: 'postedBy',
        select: 'name email companyLogo industry contact'
      })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const detailedJobAdss = await Promise.all(jobAdss.map(async (jobAds) => {
      const mediaType = jobAds.media?.mediaType;
      if (mediaType === 'Video') {
        await JobAds.populate(jobAds, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: { path: 'thumbnailUrl', model: 'Image' }
        });
      } else if (mediaType === 'Image') {
        await JobAds.populate(jobAds, {
          path: 'media.mediaRef',
          model: 'Image'
        });
      }

      const applicantsCount = jobAds.applicants.length;

      return {
        ...jobAds,
        applicantsCount
      };
    }));

    res.status(200).json(detailedJobAdss);
  } catch (error) {
    console.error('Error getting similar job jobAds:', error);
    res.status(500).json({ error: 'An error occurred while fetching similar job jobAds' });
  }
};

// Controller to get job application details by ID for indiuidual user 
export const getJobAdsDetails = async (req, res) => {
  const userId = getUserIdFromToken(req);
  try {
    const { id } = req.params;

    const jobAds = await JobAds.findById(id).populate({
      path: 'postedBy',
      select: 'name email companyLogo industry contact'
    })

    if (!jobAds) {
      return res.status(404).json({ error: 'Job Ad not found' });
    }

    const mediaType = jobAds.media?.mediaType;
    if (mediaType === 'Video') {
      await JobAds.populate(jobAds, {
        path: 'media.mediaRef',
        model: 'Video',
        populate: { path: 'thumbnailUrl', model: 'Image' }
      });
    } else if (mediaType === 'Image') {
      await JobAds.populate(jobAds, {
        path: 'media.mediaRef',
        model: 'Image'
      });
    }
    // Filter applicants to show full details if userId matches, else show only user info
    const applicants = jobAds.applicants.map(applicant => {
      if (applicant.user._id.toString() === userId) {
        return applicant;
      }
      return { user: applicant.user };
    });

    const applicantsCount = jobAds.applicants.length;

    res.status(200).json({
      jobAds: {
        ...jobAds.toObject(),
        applicants
      },
      applicantsCount
    });
  } catch (error) {
    console.error('Error getting job application details:', error);
    res.status(500).json({ error: 'An error occurred while fetching job application details' });
  }
};

// Controller to get job application details by ID for organization
export const getJobAdsDetailsForPoster = async (req, res) => {
  const userId = getUserIdFromToken(req);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let effectiveUserId = userId;

    if (user.profile.profileType === 'OrganizationMember') {
      const organizationMember = await OrganizationMember.findById(user.profile.profileRef);
      if (organizationMember) {
        effectiveUserId = organizationMember.organization;
      }
    }

    const { id } = req.params;

    // Find the job application and populate necessary fields
    const jobAds = await JobAds.findById(id)
      .populate({
        path: 'postedBy',
        select: 'name email companyLogo industry contact _id'
      })
      .populate({
        path: 'applicants.user',
        select: 'name email profilePicture lastLoggedIn',
        populate: {
          path: 'profilePicture',
          model: 'Image'
        }

      })


    if (!jobAds) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Populate the media data
    const mediaType = jobAds.media?.mediaType;
    if (mediaType === 'Video') {
      await JobAds.populate(jobAds, {
        path: 'media.mediaRef',
        model: 'Video',
        populate: { path: 'thumbnailUrl', model: 'Image' }
      });
    } else if (mediaType === 'Image') {
      await JobAds.populate(jobAds, {
        path: 'media.mediaRef',
        model: 'Image'
      });
    }
    console.log(jobAds.applicants)
    // Check if the user is the one who posted the job
    const isPoster = String(jobAds.postedBy._id) === String(effectiveUserId);

    // Populate media for each applicant
    const applicants = await Promise.all(jobAds.applicants.map(async (applicant) => {
      let populatedApplicant = applicant.toObject();

      if (populatedApplicant.resumeVideo) {
        const mediaType = populatedApplicant.resumeVideo.mediaType;
        const mediaModel = mediaType === 'Video' ? 'Video' : 'Image'; // Choose model based on mediaType

        populatedApplicant.resumeVideo = await mongoose.model(mediaModel).findById(populatedApplicant.resumeVideo.mediaRef).populate('thumbnailUrl');
      }


      // Check if user is populated and calculate the active field
      if (populatedApplicant.user) {
        const lastLoggedInDate = new Date(populatedApplicant.user.lastLoggedIn);
        const userData = await IndividualUser.findById(populatedApplicant.user._id, 'skills industry')
        const isActive = (new Date() - lastLoggedInDate) < (2 * 24 * 60 * 60 * 1000); // 2 days in milliseconds
        populatedApplicant.user.active = isActive;
        populatedApplicant.user.filterData = userData
      }

      return isPoster ? populatedApplicant : { user: populatedApplicant.user };
    }));
    const applicantsCount = jobAds.applicants.length;

    res.status(200).json({
      jobAds: {
        ...jobAds.toObject(),
        applicants
      },
      applicantsCount
    });
  } catch (error) {
    console.error('Error getting job application details for poster:', error);
    res.status(500).json({ error: 'An error occurred while fetching job application details' });
  }
};


export const getApplicantsDetailsForPoster = async (req, res) => {
  const userId = getUserIdFromToken(req); // Assumes a function to extract userId from token
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let effectiveUserId = userId;

    if (user.profile.profileType === 'OrganizationMember') {
      const organizationMember = await OrganizationMember.findById(user.profile.profileRef);
      if (organizationMember) {
        effectiveUserId = organizationMember.organization;
      }
    }

    const { jobId, applicationId } = req.params;

    // Find the job ad and populate necessary fields
    const jobAds = await JobAds.findById(jobId).populate({
      path: 'postedBy',
      select: 'name email companyLogo industry contact _id'
    });

    if (!jobAds) {
      return res.status(404).json({ error: 'Job ad not found' });
    }

    // Filter the applicants array to get the specific application by applicationId
    const applicant = jobAds.applicants.find(app => String(app._id) === applicationId);

    if (!applicant) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if the user is the one who posted the job
    const isPoster = String(jobAds.postedBy._id) === String(effectiveUserId);

    // Populate the user and profilePicture for the applicant
    const populatedApplicant = await mongoose.model('User').populate(applicant, {
      path: 'user',
      select: 'name email profilePicture',
      populate: {
        path: 'profilePicture',
      }
    });

    // Populate media for the applicant's resume video
    if (populatedApplicant.resumeVideo) {
      const mediaType = populatedApplicant.resumeVideo.mediaType;
      const mediaModel = mediaType === 'Video' ? 'Video' : 'Image';

      populatedApplicant.resumeVideo.mediaRef = await mongoose
        .model(mediaModel)
        .findById(populatedApplicant.resumeVideo.mediaRef)
        .populate('thumbnailUrl'); // Adjust this based on your actual Video or Image schema
    }


    res.status(200).json({
      application: populatedApplicant,
      jobdetails: {
        title: jobAds.title,
        description: jobAds.description,
        deadline: jobAds.jobAdDeadline,
        postedBy: jobAds.postedBy,
      }
    });
  } catch (error) {
    console.error('Error getting job application details for poster:', error);
    res.status(500).json({ error: 'An error occurred while fetching job application details' });
  }
};
// Controller to get all job jobAds with pagination, filtering, and sorting
export const getAllJobAdss = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minSalary,
      maxSalary,
      currency,
      ...filters
    } = req.query;

    // Convert pagination and sorting values to numbers
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Build query based on filters
    let query = {};

    // Apply filters based on req.query
    if (filters.industry) {
      query.industry = { $regex: new RegExp(filters.industry.replace(/\s+/g, '\\s*'), 'i') };
    }
    if (filters.skills) {
      query.skills = {
        $in: filters.skills.split(',').map(skill => new RegExp(skill.trim().replace(/\s+/g, '\\s*'), 'i'))
      };
    }
    if (filters.tags) {
      query.tags = {
        $in: filters.tags.split(',').map(tag => new RegExp(tag.trim().replace(/\s+/g, '\\s*'), 'i'))
      };
    }
    if (filters.jobType) {
      query.jobType = { $regex: new RegExp(filters.jobType.replace(/\s+/g, '\\s*'), 'i') };
    }
    if (filters.experienceLevel) {
      query.experienceLevel = { $regex: new RegExp(filters.experienceLevel.replace(/\s+/g, '\\s*'), 'i') };
    }
    if (filters.location) {
      query.location = { $regex: new RegExp(filters.location.replace(/\s+/g, '\\s*'), 'i') };
    }
    if (filters.title) {
      query.title = { $regex: new RegExp(filters.title.replace(/\s+/g, '\\s*'), 'i') };
    }

    // Add salary filters if provided
    if (minSalary || maxSalary) {
      query['salary.min'] = minSalary ? { $gte: Number(minSalary) } : { $gte: 0 };
      query['salary.max'] = maxSalary ? { $lte: Number(maxSalary) } : { $lte: Infinity };
    }

    // Add currency filter if provided
    if (currency) {
      query['salary.currency'] = currency;
    }

    // Count total documents that match the filters
    const totalJobAdss = await JobAds.countDocuments(query);

    // Sort order handling
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Retrieve paginated job ads based on filters and sorting
    const jobAdss = await JobAds.find(query)
      .select('_id title description jobType remoteWork jobAdDeadline media location postedBy applicants createdAt')
      .populate({
        path: 'postedBy',
        select: 'name email companyLogo industry contact'
      })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Populate media details and calculate applicants count for each job application
    const detailedJobAdss = await Promise.all(jobAdss.map(async (jobAds) => {
      const mediaType = jobAds.media?.mediaType;
      if (mediaType === 'Video') {
        await JobAds.populate(jobAds, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: {
            path: 'thumbnailUrl',
            model: 'Image'
          }
        });
      } else if (mediaType === 'Image') {
        await JobAds.populate(jobAds, {
          path: 'media.mediaRef',
          model: 'Image'
        });
      }

      // Calculate applicants count
      const applicantsCount = jobAds.applicants.length;

      return {
        ...jobAds,
        applicantsCount
      };
    }));

    // Calculate total pages based on total job ads and limit
    const totalPages = Math.ceil(totalJobAdss / limit);

    // Send response with pagination info and detailed job ads
    res.status(200).json({
      page,
      limit,
      totalPages,
      totalJobAdss,
      jobAdss: detailedJobAdss
    });
  } catch (error) {
    console.error('Error getting all job ads:', error);
    res.status(500).json({ error: 'An error occurred while fetching job ads' });
  }
};







export const getOrganizationalUserPostedJobAds = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming userId is passed as a URL parameter

    // Find the organizational user by ID and populate the postedJobAds
    const organization = await OrganizationalUser.findById(userId)
      .populate({
        path: 'postedJobAds',
        populate: {
          path: 'applicants.user',
          select: 'name email',
        }
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Send the populated job jobAds
    res.status(200).json(organization.postedJobAds);
  } catch (error) {
    console.error('Error fetching posted jobAds:', error);
    res.status(500).json({ message: 'An error occurred while fetching posted jobAds' });
  }
};


export const getOrganizationalCurrentUserPostedJobAds = async (req, res) => {
  const userId = getUserIdFromToken(req);

  console.log('userIduserId', userId)
  try {


    // Find the organizational user by ID and populate the postedJobAds
    const organization = await OrganizationalUser.findById(userId)
      .populate({
        path: 'postedJobAds',
        populate: {
          path: 'applicants.user',
          select: 'name email', // Select the necessary fields from the user model
        }
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Send the populated job jobAds
    res.status(200).json(organization.postedJobAds);
  } catch (error) {
    console.error('Error fetching posted jobAds:', error);
    res.status(500).json({ message: 'An error occurred while fetching posted jobAds' });
  }
};

const getCurrentUserJobAdssByApplicantStatus = async (req, res, status) => {
  try {
    const organizatioId = getUserIdFromToken(req);

    // Check if organizatioId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizatioId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the organizational user by ID and populate the postedJobAds
    const organization = await OrganizationalUser.findById(organizatioId)
      .populate({
        path: 'postedJobAds',
        populate: {
          path: 'applicants.user',
          select: 'name email', // Select the necessary fields from the user model
        },
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Filter job jobAds to include only those with matching applicants
    const filteredJobAds = organization.postedJobAds.map(application => {
      const filteredApplicants = application.applicants.filter(applicant => applicant.applicantStatus === status);
      return {
        ...application,
        applicants: filteredApplicants
      };
    }).filter(application => application.applicants.length > 0);

    // Send the filtered job jobAds
    res.status(200).json(filteredJobAds);
  } catch (error) {
    console.error(`Error fetching ${status} jobAds:`, error);
    res.status(500).json({ message: `An error occurred while fetching ${status} jobAds` });
  }
};

// Controller for pending applicants
export const getCurrentUserPendingApplicants = (req, res) => {
  getCurrentUserJobAdssByApplicantStatus(req, res, 'pending');
};

// Controller for reviewed applicants
export const getCurrentUserShortlistedApplicants = (req, res) => {
  getCurrentUserJobAdssByApplicantStatus(req, res, 'shortlisted');
};

// Controller for accepted applicants
export const getCurrentUserSelectedApplicants = (req, res) => {
  getCurrentUserJobAdssByApplicantStatus(req, res, 'selected');
};

// Controller for rejected applicants
export const getCurrentUserRejectedApplicants = (req, res) => {
  getCurrentUserJobAdssByApplicantStatus(req, res, 'rejected');
};


const getJobAdssByApplicantStatus = async (req, res, status) => {
  try {

    const { organizatioId } = req.params;


    // Check if organizatioId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizatioId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the organizational user by ID and populate the postedJobAds
    const organization = await OrganizationalUser.findById(organizatioId)
      .populate({
        path: 'postedJobAds',
        populate: {
          path: 'applicants.user',
          select: 'name email', // Select the necessary fields from the user model
        },
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Filter job jobAds to include only those with matching applicants
    const filteredJobAds = organization.postedJobAds.map(application => {
      const filteredApplicants = application.applicants.filter(applicant => applicant.applicantStatus === status);
      return {
        ...application,
        applicants: filteredApplicants
      };
    }).filter(application => application.applicants.length > 0);

    // Send the filtered job jobAds
    res.status(200).json(filteredJobAds);
  } catch (error) {
    console.error(`Error fetching ${status} jobAds:`, error);
    res.status(500).json({ message: `An error occurred while fetching ${status} jobAds` });
  }
};

// Controller for pending applicants
export const getPendingApplicants = (req, res) => {
  getJobAdssByApplicantStatus(req, res, 'pending');
};

// Controller for reviewed applicants
export const getShortlistedApplicants = (req, res) => {
  getJobAdssByApplicantStatus(req, res, 'shortlisted');
};

// Controller for selected applicants
export const getSelectedApplicants = (req, res) => {
  getJobAdssByApplicantStatus(req, res, 'selected');
};

// Controller for rejected applicants
export const getRejectedApplicants = (req, res) => {
  getJobAdssByApplicantStatus(req, res, 'rejected');
};

export const createJobAlert = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { title, description, jobType, experienceLevel, organizationId } = req.body;

    // Validate required fields
    if (!title || !organizationId) {
      return res.status(400).json({ error: 'Title and organization ID are required' });
    }

    // Create new Job Alert
    const newJobAlert = new JobAlert({
      createdBy: userId,
      organizationId,
      title,
      description,
      jobType,
      experienceLevel
    });

    await newJobAlert.save();

    // Update the individual user's job alerts
    await IndividualUser.findByIdAndUpdate(
      userId,
      { $push: { jobAlerts: newJobAlert._id } },
      { new: true }
    );

    // Update the organization's job alerts
    await OrganizationalUser.findByIdAndUpdate(
      organizationId,
      { $push: { jobAlerts: newJobAlert._id } },
      { new: true }
    );
    const job = {
      title,
      description,
      jobType,
      experienceLevel
    };
    // Find the organization and send an email notification
    const organization = await OrganizationalUser.findById(organizationId)
    if (organization && organization.contact.email) {
      // Populate user details
      const user = await User.findById(userId).populate('profilePicture');
      const orgUser = await User.findById(organizationId).populate('profilePicture');


     
      const fullName = [orgUser.name.first, orgUser.name.middle, orgUser.name.last]
        .filter(namePart => namePart) // Filter out any undefined or empty parts
        .join(' '); // Join the parts with a space

      await sendNewJobAlertByUserEmail(organization.contact.email, organization.name, user, job)
    }

    res.status(201).json(newJobAlert);
  } catch (error) {
    console.error('Error creating job alert:', error);
    res.status(500).json({ error: 'An error occurred while creating the job alert' });
  }
};

export const editJobAlert = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;
    const { title, description, jobType, experienceLevel, organizationId } = req.body;

    // Validate required fields
    if (!title || !organizationId) {
      return res.status(400).json({ error: 'Title and organization ID are required' });
    }

    // Find the job alert to verify ownership
    const jobAlert = await JobAlert.findById(id);

    if (!jobAlert) {
      return res.status(404).json({ error: 'Job alert not found' });
    }

    if (jobAlert.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to edit this job alert' });
    }

    // Find and update the job alert
    const updatedJobAlert = await JobAlert.findByIdAndUpdate(
      id,
      { title, description, jobType, experienceLevel, organizationId },
      { new: true }
    );

    res.status(200).json(updatedJobAlert);
  } catch (error) {
    console.error('Error editing job alert:', error);
    res.status(500).json({ error: 'An error occurred while editing the job alert' });
  }
};


export const deleteJobAlert = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { id } = req.params;

    // Find the job alert to verify ownership
    const jobAlert = await JobAlert.findById(id);

    if (!jobAlert) {
      return res.status(404).json({ error: 'Job alert not found' });
    }

    if (jobAlert.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this job alert' });
    }

    // Find and delete the job alert
    const deletedJobAlert = await JobAlert.findByIdAndDelete(id);

    // Remove the job alert from the individual user's and organization's job alerts
    await IndividualUser.findByIdAndUpdate(
      deletedJobAlert.createdBy,
      { $pull: { jobAlerts: deletedJobAlert._id } }
    );

    await OrganizationalUser.findByIdAndUpdate(
      deletedJobAlert.organizationId,
      { $pull: { jobAlerts: deletedJobAlert._id } }
    );

    res.status(200).json({ message: 'Job alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting job alert:', error);
    res.status(500).json({ error: 'An error occurred while deleting the job alert' });
  }
};



export const getAllJobAlerts = async (req, res) => {
  try {
    const createdBy = getUserIdFromToken(req);
    const { jobType, experienceLevel } = req.query;

    // Build the query object based on provided query parameters
    let query = {};
    if (createdBy) {
      query.createdBy = createdBy;
    }
    if (jobType) {
      query.jobType = jobType;
    }
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Fetch job alerts based on the query with populated fields
    const jobAlerts = await JobAlert.find(query)
      .populate({
        path: 'createdBy',
        // select: 'name profilePicture',
        populate: {
          path: 'profilePicture',
          model: 'Image'
        }
      })
      .populate({
        path: 'organizationId',
        // select: 'name profilePicture',
        populate: {
          path: 'profilePicture',
          model: 'Image'
        }
      });

    res.status(200).json(jobAlerts);
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    res.status(500).json({ error: 'An error occurred while fetching job alerts' });
  }
};


export const getAllJobAlertsForOrganization = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    const { jobType, experienceLevel } = req.query;

    // Check if the userId belongs to an Organization or OrganizationMember
    let organizationId;

    // Check if userId is an OrganizationalUser
    const organization = await OrganizationalUser.findById(userId);
    if (organization) {
      organizationId = organization._id;
    } else {
      // Check if userId is an OrganizationMember
      const organizationMember = await OrganizationMember.findById(userId).populate('organization');
      if (organizationMember) {
        organizationId = organizationMember.organization._id;
      } else {
        return res.status(404).json({ error: 'Organization or Organization Member not found' });
      }
    }

    // Build the query object based on provided query parameters
    let query = { organizationId };
    if (jobType) {
      query.jobType = jobType;
    }
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Fetch job alerts based on the query with populated fields
    const jobAlerts = await JobAlert.find(query)
      .populate({
        path: 'createdBy',
        // select: 'name profilePicture',
        populate: {
          path: 'profilePicture',
          model: 'Image'
        }
      })
      .populate({
        path: 'organizationId',
        // select: 'name profilePicture',
        populate: {
          path: 'profilePicture',
          model: 'Image'
        }
      });

    res.status(200).json(jobAlerts);
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    res.status(500).json({ error: 'An error occurred while fetching job alerts' });
  }
};

