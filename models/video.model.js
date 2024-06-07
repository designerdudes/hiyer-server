// Import Mongoose
import mongoose from 'mongoose';

const timestampSchema = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    chapterTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { _id: false });


const representationSchema = new mongoose.Schema({
    resolution: {
        type: String,
        // required: true
    },
    bitrate: {
        type: Number,
        // required: true
    }
}, { _id: false });

const videoSchema = new mongoose.Schema({
    videoUrl: {
        type: String,
        // required: true
    },
    thumbnailUrl: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
    },
    streamingUrls: {
        hls: {
            type: String,
            // required: true
        },
        dash: {
            type: String,
            // required: true
        }
    },
    representations: [representationSchema],
    chapters: [timestampSchema],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
