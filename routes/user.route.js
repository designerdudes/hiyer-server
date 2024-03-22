import express from "express";
import {
  sendEmailOTPforverification,
  verifyotp,
  registerUser,
  login,
  updateUserName,
  updateEmail,
  updatePhone,
  socialAuth,
  getUserById,
  getCurrentUser,
  deleteUser,
} from "../controllers/user.controller.js"; // Import your controller functions

const router = express.Router();

router.get("/:id", getUserById);
router.put("/update-username", updateUserName);
router.put("/update-email", updateEmail);
router.put("/update-phone", updatePhone);
router.post("/social-auth", socialAuth);
router.get("/current-user", getCurrentUser);
router.delete("/current-user", deleteUser);

export default router;
