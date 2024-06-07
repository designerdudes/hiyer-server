// Import Mongoose
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true // Image URL is required
    },
    transformations: [{
        width: {
            type: Number,
            // required: true  
        },
        height: {
            type: Number,
            // required: true 
        },
        quality: {
            type: String,
            // required: true  
        }
    }],
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
  });

const Image = mongoose.model('Image', imageSchema);

export default Image;


