import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    phoneVerified: {
      type: Boolean,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    middleName: String,
    lastName: String,
    picture: {
      type: String,
    },
    deviceToken: String,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

 

export default User;

