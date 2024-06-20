import { deleteImageFromCloudinary, deleteVideoFromCloudinary } from "../../config/cloudinary/cloudinary.config.js";
import JobApplication from "../../models/organization.model/jobApplication.model.js";
import OrganizationalUser from "../../models/organizationUser.model/organizationUser.model.js";
import { getUserIdFromToken } from "../../utils/getUserIdFromToken.js";
import { uploadImageController, uploadMedia } from "../mediaControl.controller/mediaUpload.js";


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
        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
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
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authorizationHeader.split("Bearer ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
        const userId = decodedToken.id;
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



// Get 5 job applications based on similarity of certain fields
export const getSimilarJobApplications = async (req, res) => {

    const userId = getUserIdFromToken(req);

    const { industry, skills, tags, applicationType, experienceLevel, location } = req.query;

    try {
        let query = {};

        if (industry) {
            query.industry = industry;
        }

        if (skills) {
            query.skills = { $in: skills.split(',') };
        }

        if (tags) {
            query.tags = { $in: tags.split(',') };
        }

        if (applicationType) {
            query.applicationType = applicationType;
        }

        if (experienceLevel) {
            query.experienceLevel = experienceLevel;
        }

        if (location) {
            query.location = location;
        }

        const similarJobApplications = await JobApplication.find(query).limit(5).populate('Media.mediaRef');

        res.status(200).json(similarJobApplications);
    } catch (error) {
        console.error('Error fetching similar job applications:', error);
        res.status(500).json({ error: 'An error occurred while fetching similar job applications' });
    }
};


// Controller to get additional job application documents based on similar fields
export const getSimilarJobApplicationsFromId = async (req, res) => {
    const userId = getUserIdFromToken(req);

    try {
        const { id } = req.params;
        const jobApplication = await JobApplication.findById(id);
        if (!jobApplication) {
            return res.status(404).json({ error: 'Job application not found' });
        }

        const { industry, skills, tags, applicationType, experienceLevel, location } = jobApplication;

        // Query to find similar job applications based on fields
        const similarJobApplications = await JobApplication.find({
            $or: [
                { industry },
                { skills: { $in: skills } },
                { tags: { $in: tags } },
                { applicationType },
                { experienceLevel },
                { location },
            ],
            _id: { $ne: id }, // Exclude the current job application
        }).limit(5);

        res.status(200).json({ similarJobApplications });
    } catch (error) {
        console.error('Error getting similar job applications:', error);
        res.status(500).json({ error: 'An error occurred while fetching similar job applications' });
    }
};



// Controller to get job application details by ID with populated media data and applicants count
export const getJobApplicationDetails = async (req, res) => {
    const userId = getUserIdFromToken(req);

    try {
        const { id } = req.params;

        const jobApplication = await JobApplication.findById(id)


        if (!jobApplication) {
            return res.status(404).json({ error: 'Job application not found' });
        }

        const mediaType = jobApplication.Media.mediaType;
        if (mediaType === 'Video') {
            await jobApplication.populate({
                path: 'Media.mediaRef',
                model: 'Video',
                populate: {
                    path: 'thumbnailUrl',
                    model: 'Image'
                }
            }).execPopulate();
        } else if (mediaType === 'Image') {
            await jobApplication.populate({
                path: 'Media.mediaRef',
                model: 'Image',

            }).execPopulate();
        }


        const applicantsCount = jobApplication.applicants.length;

        res.status(200).json({
            jobApplication,
            applicantsCount
        });
    } catch (error) {
        console.error('Error getting job application details:', error);
        res.status(500).json({ error: 'An error occurred while fetching job application details' });
    }
};