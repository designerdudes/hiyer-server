import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      id: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    }, profilePicture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
    },
    phone: {
      countryCode: {
        type: String,
        minlength: 2,
        maxlength: 3,
      },
      number: {
        type: String,
        unique: true,
        trim: true,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
    name: {
      first: String,
      middle: String,
      last: String,
    },

    socialLogin: {
      isSocialLogin: {
        type: Boolean,
        default: false,
      },
      provider: {
        type: String,
        enum: ["google", "facebook", "twitter", "linkedin", "apple", "github", "microsoft"],
      },
    },
    profile: {
      profileType: {
        type: String,
        enum: ['IndividualUser', 'OrganizationalUser', 'OrganizationMember'],
        required: true,
      },
      profileRef: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'profile.profileType',
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
