import { deleteImageFromCloudinary, deleteVideoFromCloudinary } from "../../config/cloudinary/cloudinary.config";
import JobApplication from "../../models/organization.model/jobApplication.model";
import { uploadImageController, uploadMedia } from "../mediaControl.controller/mediaUpload";

export const addJobApplication = async (req, res) => {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = authorizationHeader.split("Bearer ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
        const userId = decodedToken.id;

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
        if (req.file.video) {
            mediaResult = await uploadMedia(req, res);
        } else if (req.file.image) {
            mediaResult = await uploadImageController(req, res);
        }

        const media = {
            mediaType: req.file ? (req.file.video ? 'Video' : req.file.image ? 'Image' : '') : '',
            mediaRef: mediaResult.video_id || mediaResult.image_id || null
        };

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
            media,
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



export const editJobApplicationVideo = async (req, res) => {
    try {
        const { id } = req.params; // Get job application ID from request parameters

        const jobApplication = await JobApplication.findById(id);

        if (!jobApplication) {
            return res.status(404).json({ error: "Job application not found" });
        }

        // Check if req.file.video exists
        if (req.file && req.file.video) {
            let uploadResult1;
            // Upload the new video to Cloudinary
            try {
                uploadResult1 = await uploadVideoToCloudinary(req.file.video);
            } catch (uploadError) {
                console.error('Error uploading video to Cloudinary:', uploadError);
                return res.status(500).json({ error: "Failed to upload video" });
            }

            // Check if the job application has media type image
            if (jobApplication.media && jobApplication.media.mediaType === 'Image') {
                // Update thumbnail URL if media type is image
                jobApplication.thumbnailUrl = jobApplication.media.mediaRef;
            }

            // Get the existing video document
            const video = await Video.findById(jobApplication.media.mediaRef);
            if (video) {
                // Update the existing video document with new video details
                video.videoUrl = uploadResult1.videoUrl;
                video.streamingUrls = {
                    hls: uploadResult1.hlsUrl,
                    dash: uploadResult1.dashUrl,
                };
                video.representations = uploadResult1.representations;
                video.postedBy = jobApplication.postedBy; // Assuming postedBy is the user ID
                await video.save();
            } else {
                // Create a new Video document if it does not exist
                const newVideo = new Video({
                    videoUrl: uploadResult1.videoUrl,
                    thumbnailUrl: null, // Assuming no thumbnail update here
                    streamingUrls: {
                        hls: uploadResult1.hlsUrl,
                        dash: uploadResult1.dashUrl,
                    },
                    representations: uploadResult1.representations,
                    postedBy: jobApplication.postedBy,
                });
                await newVideo.save();

                // Update the job application document with the new video reference
                jobApplication.media = {
                    mediaType: 'Video',
                    mediaRef: newVideo._id
                };
            }
        } else {
            return res.status(400).json({ error: "Video file is required" });
        }

        // Save the updated job application document
        await jobApplication.save();

        // Respond with the updated job application document
        res.status(200).json(jobApplication);
    } catch (error) {
        console.error('Error editing job application video:', error);
        res.status(500).json({ error: error.message });
    }
};






export const editJobApplicationImage = async (req, res) => {
    try {
        const { id } = req.params; // Get job application ID from request parameters

        const jobApplication = await JobApplication.findById(id);

        if (!jobApplication) {
            return res.status(404).json({ error: "Job application not found" });
        }

        // Ensure the media type is an image
        if (!jobApplication.media || jobApplication.media.mediaType !== 'Image') {
            return res.status(400).json({ error: "The media type is not an image" });
        }

        // Check if req.file.image exists
        if (req.file && req.file.image) {
            let uploadResult1;
            // Upload the new image to Cloudinary
            try {
                uploadResult1 = await uploadImageToCloudinary(req.file.image);
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                return res.status(500).json({ error: "Failed to upload image" });
            }

            // Check if the job application has an existing image
            if (jobApplication.media && jobApplication.media.mediaRef) {
                // Get the existing image document
                const image = await Image.findById(jobApplication.media.mediaRef);
                if (image) {
                    // Delete the existing image from Cloudinary
                    try {
                        await deleteImageFromCloudinary(image.imageUrl);
                    } catch (deleteError) {
                        console.error('Error deleting image from Cloudinary:', deleteError);
                        return res.status(500).json({ error: "Failed to delete existing image" });
                    }
                    // Remove the existing image document from the database
                    try {
                        await Image.findByIdAndDelete(jobApplication.media.mediaRef);
                    } catch (deleteError) {
                        console.error('Error deleting image document:', deleteError);
                        return res.status(500).json({ error: "Failed to delete existing image document" });
                    }
                }
            }

            // Create a new Image document with the uploaded image URL
            const newImage = new Image({
                imageUrl: uploadResult1.imageUrl,
                transformations: [
                    { width: 800, height: 800, quality: 'auto' }
                ],
                postedBy: jobApplication.postedBy // Assuming postedBy is the user ID
            });

            await newImage.save();

            // Update the job application document with the new image reference
            jobApplication.media = {
                mediaType: 'Image',
                mediaRef: newImage._id
            };
        } else {
            return res.status(400).json({ error: "Image file is required" });
        }

        // Save the updated job application document
        await jobApplication.save();

        // Respond with the updated job application document
        res.status(200).json(jobApplication);
    } catch (error) {
        console.error('Error editing job application image:', error);
        res.status(500).json({ error: error.message });
    }
};


export const deleteJobApplication = async (req, res) => {
    try {
        const { id } = req.params; // Get job application ID from request parameters

        // Find the job application by ID
        const jobApplication = await JobApplication.findById(id);
        if (!jobApplication) {
            return res.status(404).json({ error: "Job application not found" });
        }

        // Handle media deletion
        const { media } = jobApplication;

        if (media && media.mediaType === 'Video') {
            // Fetch video document
            const video = await Video.findById(media.mediaRef);
            if (video) {
                // Delete video from Cloudinary
                await deleteVideoFromCloudinary(video.videoUrl);
                // Remove Video document reference
                await Video.findByIdAndDelete(media.mediaRef);
            }
        } else if (media && media.mediaType === 'Image') {
            // Fetch image document
            const image = await Image.findById(media.mediaRef);
            if (image) {
                // Delete image from Cloudinary
                await deleteImageFromCloudinary(image.imageUrl);
                // Remove Image document reference
                await Image.findByIdAndDelete(media.mediaRef);
            }
        }

        // Delete the job application document
        await JobApplication.findByIdAndDelete(id);

        // Remove job application reference from IndividualUser model
        await IndividualUser.updateMany(
            { "jobposting.applied": id },
            { $pull: { "jobposting.applied": id } }
        );

        res.status(200).json({ message: "Job application deleted successfully" });
    } catch (error) {
        console.error('Error deleting job application:', error);
        res.status(500).json({ error: 'An error occurred while deleting the job application' });
    }
};




// Controller to update the applicant status based on user ID
export const updateApplicantStatus = async (req, res) => {
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


