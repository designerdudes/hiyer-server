import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
  
  email: String,
  otp: String,
  mobileNumber: Number,
  createdAt: Date,
  expiredAt: Date,
});

const UserOTP = mongoose.model("OTPverification", otpSchema);

export default UserOTP;
