import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  landmark: String,
});

mongoose.model("Address", addressSchema);

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
    },profilePicture:{
      type: String,
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
        enum: ["google", "facebook", "twitter", "linkedin","apple","github","microsoft"],
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
