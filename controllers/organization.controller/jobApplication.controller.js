import mongoose from "mongoose";
import { deleteImageFromCloudinary, deleteVideoFromCloudinary } from "../../config/cloudinary/cloudinary.config.js";
import JobApplication from "../../models/organization.model/jobApplication.model.js";
import OrganizationalUser from "../../models/organizationUser.model/organizationUser.model.js";
import Video from "../../models/video.model.js";
import { getUserIdFromToken } from "../../utils/getUserIdFromToken.js";
import { uploadImageController, uploadMedia } from "../mediaControl.controller/mediaUpload.js";
import User from "../../models/user.model.js";
import OrganizationMember from "../../models/organizationUser.model/organizationMember.model.js";


export const addJobApplication = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    // Destructure the request body
    const {
      title,
      description,
      applicationType,
      experienceLevel,
      remoteWork,
      salary,
      applicationDeadline,
      location,
      skills,
      category,
      tags,
    } = req.body;

    let mediaResult = {};
    if ((req.files && req.files.video && req.files.image) || (req.files && req.files.video)) {
      mediaResult = await uploadMedia(req);
    } else if (req.files && req.files.image) {
      mediaResult = await uploadImageController(req, res);
    }

    console.log('mediaResult:', mediaResult);

    const Media = {
      mediaType: req.files ? (req.files.video ? 'Video' : req.files.image ? 'Image' : '') : '',
      mediaRef: mediaResult?.video_id || mediaResult?.image_id || null
    };
    console.log('Media:', Media);

    const filteredFields = {
      title,
      description,
      applicationType,
      experienceLevel,
      remoteWork,
      salary,
      applicationDeadline,
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

    const newJobApplication = new JobApplication(nonEmptyFields);
    await newJobApplication.save();

    // Update the organizational user's posted applications
    await OrganizationalUser.findByIdAndUpdate(
      userId,
      { $push: { postedApplications: newJobApplication._id } },
      { new: true }
    );

    res.status(201).json(newJobApplication);
  } catch (error) {
    console.error('Error adding job application:', error);
    res.status(500).json({ error: 'An error occurred while adding the job application' });
  }
};



// Edit Job Application Details
export const editJobApplicationDetails = async (req, res) => {
  try {
    const { id } = req.params; // Get job application ID from request parameters

    const {
      title,
      description,
      applicationType,
      experienceLevel,
      remoteWork,
      salary,
      applicationDeadline,
      location,
      skills,
      category,
      tags,
    } = req.body;

    const filteredFields = {
      title,
      description,
      applicationType,
      experienceLevel,
      remoteWork,
      salary,
      applicationDeadline,
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
    const updatedJobApplication = await JobApplication.findByIdAndUpdate(
      id,
      nonEmptyFields,
      { new: true } // Return the updated document
    );

    if (!updatedJobApplication) {
      return res.status(404).json({ error: "Job application not found" });
    }

    res.status(200).json(updatedJobApplication);
  } catch (error) {
    console.error('Error editing job application details:', error);
    res.status(500).json({ error: 'An error occurred while editing the job application details' });
  }
};

// // Edit Job Application Video
// export const editJobApplicationVideo = async (req, res) => {
//     try {
//         const { id } = req.params; // Get job application ID from request parameters

//         const jobApplication = await JobApplication.findById(id);

//         if (!jobApplication) {
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
//             if (jobApplication.media && jobApplication.media.mediaType === 'Video') {
//                 const video = await Video.findById(jobApplication.media.mediaRef);
//                 if (video) {
//                     video.videoUrl = uploadResult.videoUrl;
//                     video.streamingUrls = {
//                         hls: uploadResult.hlsUrl,
//                         dash: uploadResult.dashUrl,
//                     };
//                     video.representations = uploadResult.representations;
//                     video.postedBy = jobApplication.postedBy;
//                     await video.save();
//                 } else {
//                     const newVideo = new Video({
//                         videoUrl: uploadResult.videoUrl,
//                         streamingUrls: {
//                             hls: uploadResult.hlsUrl,
//                             dash: uploadResult.dashUrl,
//                         },
//                         representations: uploadResult.representations,
//                         postedBy: jobApplication.postedBy,
//                     });
//                     await newVideo.save();

//                     jobApplication.media = {
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
//                     postedBy: jobApplication.postedBy,
//                 });
//                 await newVideo.save();

//                 jobApplication.media = {
//                     mediaType: 'Video',
//                     mediaRef: newVideo._id,
//                 };
//             }
//         } else {
//             return res.status(400).json({ error: "Video file is required" });
//         }

//         // Save the updated job application document
//         await jobApplication.save();

//         res.status(200).json(jobApplication);
//     } catch (error) {
//         console.error('Error editing job application video:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // Edit Job Application Image
// export const editJobApplicationImage = async (req, res) => {
//     try {
//         const { id } = req.params; // Get job application ID from request parameters

//         const jobApplication = await JobApplication.findById(id);

//         if (!jobApplication) {
//             return res.status(404).json({ error: "Job application not found" });
//         }

//         // Ensure the media type is an image
//         if (jobApplication.media && jobApplication.media.mediaType !== 'Image') {
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
//             if (jobApplication.media && jobApplication.media.mediaRef) {
//                 const image = await Image.findById(jobApplication.media.mediaRef);
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
//                         await Image.findByIdAndDelete(jobApplication.media.mediaRef);
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
//                 postedBy: jobApplication.postedBy
//             });

//             await newImage.save();

//             jobApplication.media = {
//                 mediaType: 'Image',
//                 mediaRef: newImage._id,
//             };
//         } else {
//             return res.status(400).json({ error: "Image file is required" });
//         }

//         // Save the updated job application document
//         await jobApplication.save();

//         res.status(200).json(jobApplication);
//     } catch (error) {
//         console.error('Error editing job application image:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

// Delete Job Application
export const deleteJobApplication = async (req, res) => {
  try {
    const { id } = req.params; // Get job application ID from request parameters

    const jobApplication = await JobApplication.findById(id);
    if (!jobApplication) {
      return res.status(404).json({ error: "Job application not found" });
    }

    // Handle media deletion
    const { media } = jobApplication;

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

    await JobApplication.findByIdAndDelete(id);

    // Remove job application reference from OrganizationalUser model
    await OrganizationalUser.updateMany(
      { postedApplications: id },
      { $pull: { postedApplications: id } }
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
    const jobApplication = await JobApplication.findById(jobId);
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Find the applicant within the job application by their user ID
    const applicant = jobApplication.applicants.find(app => app.user.toString() === userId);
    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Update the applicant status
    applicant.applicantStatus = applicantStatus;
    applicant.applicationHistory.push({
      status: applicantStatus,
      updatedAt: new Date(),
      notes: `Status updated to ${applicantStatus}`,
    });

    // Save the changes to the job application
    await jobApplication.save();

    res.status(200).json({ message: 'Applicant status updated successfully', applicant });
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
    const jobApplication = await JobApplication.findById(jobId);
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Find the index of the applicant within the job application's applicants array
    const applicantIndex = jobApplication.applicants.findIndex(app => app.user.toString() === userId);
    if (applicantIndex === -1) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    // Remove the applicant from the applicants array
    jobApplication.applicants.splice(applicantIndex, 1);
    await jobApplication.save();

    // Update IndividualUser model to remove the applied job
    await IndividualUser.findByIdAndUpdate(userId, {
      $pull: { "jobposting.applied": jobApplication._id },
    });

    res.status(200).json({ message: 'Applicant removed successfully' });
  } catch (error) {
    console.error('Error removing applicant:', error);
    res.status(500).json({ error: 'An error occurred while removing the applicant' });
  }
};

// Controller to get 5 job applications based on similarity of certain fields with pagination
export const getSimilarJobApplications = async (req, res) => {
  const userId = getUserIdFromToken(req);
  const { industry, skills, tags, applicationType, experienceLevel, location, page = 1, limit = 5 } = req.query;
  console.log(req.query)
  try {
    let query = {};

    if (industry) query.industry = industry;
    if (skills) query.skills = { $in: skills.split(',') };
    if (tags) query.tags = { $in: tags.split(',') };
    if (applicationType) query.applicationType = applicationType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (location) query.location = location;

    const skip = (page - 1) * limit;
    const jobApplications1 = await JobApplication.find(query)
    console.log(jobApplications1)

    const jobApplications = await JobApplication.find(query)
      .select('_id title description applicationType remoteWork applicationDeadline media location industry postedBy applicants.user createdAt skills tags')
      .populate({
        path: 'postedBy',
        select: 'name email companyLogo industry contact'
      })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const detailedJobApplications = await Promise.all(jobApplications.map(async (jobApplication) => {
      const mediaType = jobApplication.media?.mediaType;
      if (mediaType === 'Video') {
        await JobApplication.populate(jobApplication, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: { path: 'thumbnailUrl', model: 'Image' }
        });
      } else if (mediaType === 'Image') {
        await JobApplication.populate(jobApplication, {
          path: 'media.mediaRef',
          model: 'Image'
        });
      }

      const applicantsCount = jobApplication.applicants.length;

      return {
        ...jobApplication,
        applicantsCount
      };
    }));

    res.status(200).json(detailedJobApplications);
  } catch (error) {
    console.error('Error fetching similar job applications:', error);
    res.status(500).json({ error: 'An error occurred while fetching similar job applications' });
  }
};

// Controller to get additional job application documents based on similar fields with pagination
export const getSimilarJobApplicationsFromId = async (req, res) => {
  const userId = getUserIdFromToken(req);

  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const jobApplication = await JobApplication.findById(id);
    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    const { industry, skills, tags, applicationType, experienceLevel, location } = jobApplication;
    const skip = (page - 1) * limit;

    // Query to find similar job applications based on fields
    const jobApplications = await JobApplication.find({
      $or: [
        { industry },
        { skills: { $in: skills } },
        { tags: { $in: tags } },
        { applicationType },
        { experienceLevel },
        { location },
      ],
      _id: { $ne: id }, // Exclude the current job application
    })
      .select('_id title description applicationType remoteWork applicationDeadline media location postedBy applicants.user createdAt')
      .populate({
        path: 'postedBy',
        select: 'name email companyLogo industry contact'
      })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const detailedJobApplications = await Promise.all(jobApplications.map(async (jobApplication) => {
      const mediaType = jobApplication.media?.mediaType;
      if (mediaType === 'Video') {
        await JobApplication.populate(jobApplication, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: { path: 'thumbnailUrl', model: 'Image' }
        });
      } else if (mediaType === 'Image') {
        await JobApplication.populate(jobApplication, {
          path: 'media.mediaRef',
          model: 'Image'
        });
      }

      const applicantsCount = jobApplication.applicants.length;

      return {
        ...jobApplication,
        applicantsCount
      };
    }));

    res.status(200).json(detailedJobApplications);
  } catch (error) {
    console.error('Error getting similar job applications:', error);
    res.status(500).json({ error: 'An error occurred while fetching similar job applications' });
  }
};

// Controller to get job application details by ID for indiuidual user 
export const getJobApplicationDetails = async (req, res) => {
  const userId = getUserIdFromToken(req);
  try {
    const { id } = req.params;

    const jobApplication = await JobApplication.findById(id).populate({
      path: 'postedBy',
      select: 'name email companyLogo industry contact'
    })

    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    const mediaType = jobApplication.media?.mediaType;
    if (mediaType === 'Video') {
      await JobApplication.populate(jobApplication, {
        path: 'media.mediaRef',
        model: 'Video',
        populate: { path: 'thumbnailUrl', model: 'Image' }
      });
    } else if (mediaType === 'Image') {
      await JobApplication.populate(jobApplication, {
        path: 'media.mediaRef',
        model: 'Image'
      });
    }
    // Filter applicants to show full details if userId matches, else show only user info
    const applicants = jobApplication.applicants.map(applicant => {
      if (applicant.user._id.toString() === userId) {
        return applicant;
      }
      return { user: applicant.user };
    });

    const applicantsCount = jobApplication.applicants.length;

    res.status(200).json({
      jobApplication: {
        ...jobApplication.toObject(),
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
export const getJobApplicationDetailsForPoster = async (req, res) => {
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
    const jobApplication = await JobApplication.findById(id).populate({
      path: 'postedBy',
      select: 'name email companyLogo industry contact _id'
    });

    if (!jobApplication) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Populate the media data
    const mediaType = jobApplication.media?.mediaType;
    if (mediaType === 'Video') {
      await JobApplication.populate(jobApplication, {
        path: 'media.mediaRef',
        model: 'Video',
        populate: { path: 'thumbnailUrl', model: 'Image' }
      });
    } else if (mediaType === 'Image') {
      await JobApplication.populate(jobApplication, {
        path: 'media.mediaRef',
        model: 'Image'
      });
    }

    // Check if the user is the one who posted the job
    const isPoster = String(jobApplication.postedBy._id) === String(effectiveUserId);

    // Filter applicants to show full details if the user is the poster, else show only user info
    const applicants = jobApplication.applicants.map(applicant => {
      if (isPoster) {
        return applicant;
      }
      return { user: applicant.user };
    });

    const applicantsCount = jobApplication.applicants.length;

    res.status(200).json({
      jobApplication: {
        ...jobApplication.toObject(),
        applicants
      },
      applicantsCount
    });
  } catch (error) {
    console.error('Error getting job application details for poster:', error);
    res.status(500).json({ error: 'An error occurred while fetching job application details' });
  }
};

// Controller to get all job applications with pagination, filtering, and sorting
export const getAllJobApplications = async (req, res) => {
  try {
    let { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = req.query;

    // Build query based on filters
    let query = {};

    // Apply filters based on req.query
    if (filters.industry) query.industry = filters.industry;
    if (filters.skills) query.skills = { $in: filters.skills.split(',') };
    if (filters.tags) query.tags = { $in: filters.tags.split(',') };
    if (filters.applicationType) query.applicationType = filters.applicationType;
    if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
    if (filters.location) query.location = filters.location;

    // Count total documents that match the filters
    const totalJobApplications = await JobApplication.countDocuments(query);

    // Sort order handling
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Retrieve paginated job applications based on filters and sorting
    const jobApplications = await JobApplication.find(query)
      .select('_id title description applicationType remoteWork applicationDeadline media location postedBy applicants.user createdAt')
      .populate({
        path: 'postedBy',
        select: 'name email companyLogo industry contact'
      })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Populate media details and calculate applicants count for each job application
    const detailedJobApplications = await Promise.all(jobApplications.map(async (jobApplication) => {
      const mediaType = jobApplication.media?.mediaType;
      if (mediaType === 'Video') {
        await JobApplication.populate(jobApplication, {
          path: 'media.mediaRef',
          model: 'Video',
          populate: {
            path: 'thumbnailUrl',
            model: 'Image'
          }
        });
      } else if (mediaType === 'Image') {
        await JobApplication.populate(jobApplication, {
          path: 'media.mediaRef',
          model: 'Image'
        });
      }

      // Calculate applicants count
      const applicantsCount = jobApplication.applicants.length;

      return {
        ...jobApplication,
        applicantsCount
      };
    }));

    // Calculate total pages based on total job applications and limit
    const totalPages = Math.ceil(totalJobApplications / limit);

    // Send response with pagination info and detailed job applications
    res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      totalPages,
      totalJobApplications,
      jobAds: detailedJobApplications // Changed from 'jobAds' to 'jobApplications'
    });
  } catch (error) {
    console.error('Error getting all job applications:', error);
    res.status(500).json({ error: 'An error occurred while fetching job applications' });
  }
};



export const getOrganizationalUserPostedApplications = async (req, res) => {
  try {
    const userId = req.params.userId; // Assuming userId is passed as a URL parameter

    // Find the organizational user by ID and populate the postedApplications
    const organization = await OrganizationalUser.findById(userId)
      .populate({
        path: 'postedApplications',
        populate: {
          path: 'applicants.user',
          select: 'name email',
        }
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Send the populated job applications
    res.status(200).json(organization.postedApplications);
  } catch (error) {
    console.error('Error fetching posted applications:', error);
    res.status(500).json({ message: 'An error occurred while fetching posted applications' });
  }
};


export const getOrganizationalCurrentUserPostedApplications = async (req, res) => {
  const userId = getUserIdFromToken(req);

  console.log('userIduserId', userId)
  try {


    // Find the organizational user by ID and populate the postedApplications
    const organization = await OrganizationalUser.findById(userId)
      .populate({
        path: 'postedApplications',
        populate: {
          path: 'applicants.user',
          select: 'name email', // Select the necessary fields from the user model
        }
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Send the populated job applications
    res.status(200).json(organization.postedApplications);
  } catch (error) {
    console.error('Error fetching posted applications:', error);
    res.status(500).json({ message: 'An error occurred while fetching posted applications' });
  }
};

const getCurrentUserJobApplicationsByApplicantStatus = async (req, res, status) => {
  try {
    const organizatioId = getUserIdFromToken(req);

    // Check if organizatioId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizatioId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the organizational user by ID and populate the postedApplications
    const organization = await OrganizationalUser.findById(organizatioId)
      .populate({
        path: 'postedApplications',
        populate: {
          path: 'applicants.user',
          select: 'name email', // Select the necessary fields from the user model
        },
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Filter job applications to include only those with matching applicants
    const filteredApplications = organization.postedApplications.map(application => {
      const filteredApplicants = application.applicants.filter(applicant => applicant.applicantStatus === status);
      return {
        ...application,
        applicants: filteredApplicants
      };
    }).filter(application => application.applicants.length > 0);

    // Send the filtered job applications
    res.status(200).json(filteredApplications);
  } catch (error) {
    console.error(`Error fetching ${status} applications:`, error);
    res.status(500).json({ message: `An error occurred while fetching ${status} applications` });
  }
};

// Controller for pending applicants
export const getCurrentUserPendingApplicants = (req, res) => {
  getCurrentUserJobApplicationsByApplicantStatus(req, res, 'pending');
};

// Controller for reviewed applicants
export const getCurrentUserShortlistedApplicants = (req, res) => {
  getCurrentUserJobApplicationsByApplicantStatus(req, res, 'shortlisted');
};

// Controller for accepted applicants
export const getCurrentUserSelectedApplicants = (req, res) => {
  getCurrentUserJobApplicationsByApplicantStatus(req, res, 'selected');
};

// Controller for rejected applicants
export const getCurrentUserRejectedApplicants = (req, res) => {
  getCurrentUserJobApplicationsByApplicantStatus(req, res, 'rejected');
};


const getJobApplicationsByApplicantStatus = async (req, res, status) => {
  try {

    const { organizatioId } = req.params;


    // Check if organizatioId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(organizatioId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find the organizational user by ID and populate the postedApplications
    const organization = await OrganizationalUser.findById(organizatioId)
      .populate({
        path: 'postedApplications',
        populate: {
          path: 'applicants.user',
          select: 'name email', // Select the necessary fields from the user model
        },
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Filter job applications to include only those with matching applicants
    const filteredApplications = organization.postedApplications.map(application => {
      const filteredApplicants = application.applicants.filter(applicant => applicant.applicantStatus === status);
      return {
        ...application,
        applicants: filteredApplicants
      };
    }).filter(application => application.applicants.length > 0);

    // Send the filtered job applications
    res.status(200).json(filteredApplications);
  } catch (error) {
    console.error(`Error fetching ${status} applications:`, error);
    res.status(500).json({ message: `An error occurred while fetching ${status} applications` });
  }
};

// Controller for pending applicants
export const getPendingApplicants = (req, res) => {
  getJobApplicationsByApplicantStatus(req, res, 'pending');
};

// Controller for reviewed applicants
export const getShortlistedApplicants = (req, res) => {
  getJobApplicationsByApplicantStatus(req, res, 'shortlisted');
};

// Controller for selected applicants
export const getSelectedApplicants = (req, res) => {
  getJobApplicationsByApplicantStatus(req, res, 'selected');
};

// Controller for rejected applicants
export const getRejectedApplicants = (req, res) => {
  getJobApplicationsByApplicantStatus(req, res, 'rejected');
};