import express from "express";
import { getCurrentUser, socialAuth, updateEmail, updatePhone, updateUserName } from "../../controllers/user.controller.js";
 

const router = express.Router();

// router.get("/:id", getUserById);
router.put("/update-username", updateUserName);
router.put("/update-email", updateEmail);
router.put("/update-phone", updatePhone);
router.post("/social-auth", socialAuth);
// router.get("/current-user", getCurrentUser);
// router.delete("/current-user", deleteUser);

export default router;
