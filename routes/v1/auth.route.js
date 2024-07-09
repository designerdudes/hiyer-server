import express from "express";
import {
  sendEmailOTPforverification,
  verifyotp,
  registerUser,
  login,
  organisationLogin,
} from "../../controllers/user.controller.js"; // Import your controller functions
import { socialAuth } from "../../controllers/user.controller.js";

const router = express.Router();

router.post("/send-email-otp", sendEmailOTPforverification);
router.post("/organisation-login", organisationLogin);
router.post("/verify-otp", verifyotp);
router.post("/register", registerUser);
router.post("/login", login);
router.post("/social-auth", socialAuth);

export default router;
