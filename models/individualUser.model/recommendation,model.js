import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobAds',
      required: true,
    },
    recommendedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recommendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recommendationDate: {
      type: Date,
      default: Date.now,
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

export default Recommendation;
