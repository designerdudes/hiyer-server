import express from "express";
import {
  sendEmailOTPforverification,
  verifyotp,
  registerUser,
  login,
} from "../controllers/user.controller.js"; // Import your controller functions

const router = express.Router();
 
router.post("/send-email-otp", sendEmailOTPforverification);
router.post("/verify-otp", verifyotp);
router.post("/register", registerUser);
router.post("/login", login);

export default router;
