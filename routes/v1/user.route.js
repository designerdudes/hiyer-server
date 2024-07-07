import express from "express";
import { getCurrentUser, socialAuth, updateEmail, updatePhone, updateUserName } from "../../controllers/user.controller.js";
import { upload } from "../../config/multer.js";
import { uploadProfileImageController } from "../../controllers/mediaControl.controller/mediaUpload.js";
 

const router = express.Router();

// router.get("/:id", getUserById);
router.put("/update-username", updateUserName);
router.put("/update-email", updateEmail);
router.put("/update-phone", updatePhone);
router.post("/social-auth", socialAuth);

router.post('/uploadProfilePicture', upload.fields([{ name: 'image', maxCount: 1 }]), uploadProfileImageController);

// router.get("/current-user", getCurrentUser);
// router.delete("/current-user", deleteUser);

export default router;
