import express from 'express';
 
// import { signin, sendOTPforverification, verifyotp, register, getAllCustomers, getAlldeliveryagent, getallTeamMembers, sendOTPforMobileverification, verifymobileotp, getUserById, deletebyid, getCurrentUserById, getCurrentUser, addOrUpdateAddress, deleteAddress, sendOTPforAdminVerification, updateUser, } from '../controllers/user.controller.js';
import { adminAuthenticateToken, authenticateToken } from '../middleware/authToken.js';
import { sendOTPforverification } from '../controllers/user.controller.js';
 
const router = express.Router();
// router.post("/register", register)
// router.post("/updateUser",updateUser)
// router.post("/signin", signin)
router.post("/emailOtpSend", sendOTPforverification);
// router.post("/mobileOtpSend", sendOTPforMobileverification);

// router.post("/adminEmailOtpSend", sendOTPforAdminVerification);
// router.post("/emailOtpVerify", verifyotp);
// router.post("/mobileOtpVerify", verifymobileotp);

// router.get("/getallcustomers", getAllCustomers)
// router.get("/getalldeliveryagent", getAlldeliveryagent)
// router.get("/getallTeamMembers", getallTeamMembers)

// router.delete("/id/:id", deletebyid)
// router.get("/id/:id", getUserById)
// router.post("/currentUser", getCurrentUser)
// router.post("/editAddress", addOrUpdateAddress)
// router.delete('/address/:addressId', deleteAddress);

// router.post("/facebook",facebookAuth)
// router.post("/google",googleAuth)
export default router