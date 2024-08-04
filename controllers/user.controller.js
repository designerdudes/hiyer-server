import mongoose from "mongoose";
import { errorHandeler } from "../middleware/errorHandeler.utils.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import UserOTP from "../models/otp.model.js";
import {
  emailVerificationEmail,
  emailVerificationSuccess,
} from "../config/sendMail.js";
import axios from "axios";
import User from "../models/user.model.js";
import { mobileVerificationSuccess } from "../config/sendSms.js";
import IndividualUser from "../models/individualUser.model/individualUser.model.js";
import OrganizationalUser from "../models/organizationUser.model/organizationUser.model.js";
import OrganizationMember from "../models/organizationUser.model/organizationMember.model.js";

import { sendOtpEmail, sendVerificationSuccessEmail, sendWelcomeOrgEmail, sendWelcomeUserEmail } from "../config/zohoMail.js";



const extractNameFromEmail = (email) => {
  const namePart = email.split('@')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};

// Controller function to handle sending OTP for email verification
export const sendEmailOTPforverification = async (req, res) => {
  try {
    const { email } = req.body;
    const validEmailUser = await User.findOne({ "email.id": email });
    console.log('Valid Email User:', validEmailUser);
    // if (!validEmailUser) {
    //   return res.status(404).json({
    //     ok: false,
    //     msg: "User not found",
    //   });
    // }

    const userName = validEmailUser ? validEmailUser.name.first : extractNameFromEmail(email);

    console.log('User Name:', userName);
    let OTP = Math.floor(Math.random() * 900000) + 100000; // Generate a random 6-digit OTP
    console.log("OTP is generated", OTP);

    let otp = new UserOTP({
      email: email,
      otp: OTP,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 86400000), // Set expiration time correctly (24 hours)
    });

    await otp.save();


    await sendOtpEmail(email, userName, OTP);

    res.status(200).json({
      ok: true,
      msg: validEmailUser ? "Email sent to existing user" : "Email sent to new user",
    });



  } catch (error) {
    console.error("Error in sending OTP for verification:", error);
    res.status(500).json({
      ok: false,
      msg: "Failed to send OTP. Please try again later.",
    });
  }
};

export const sendOrganisationEmailOTPforverification = async (req, res) => {
  try {
    const { email, mobileNo, countryCode } = req.body;



    let query;

    query = {
      "email.id": email.toLowerCase().trim(),
    };





    const validEmailUser = await User.findOne(query);

    const validMobileNumber = await User.findOne({ "phone.number": mobileNo });

    console.log('Valid Email User:', validEmailUser);
    console.log('Valid Mobile Number:', validMobileNumber);
    // if (!validEmailUser) {
    //   return res.status(404).json({
    //     ok: false,
    //     msg: "User not found",
    //   });
    // }

    const userName = validEmailUser ? validEmailUser.name.first : extractNameFromEmail(email);

    if (!validEmailUser && !validMobileNumber) {

      let OTP = Math.floor(Math.random() * 900000) + 100000; // Generate a random 6-digit OTP
      console.log("OTP is generated", OTP);

      let otp = new UserOTP({
        email: email,
        otp: OTP,
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 86400000), // Set expiration time correctly (24 hours)
      });

      await otp.save();


      await sendOtpEmail(email, userName, OTP);

      res.status(200).json({
        ok: true,
        msg: "Email sent to new user",
      });
    }
    if (validEmailUser && !validMobileNumber) {

      res.status(400).json({
        ok: true,
        msg: "User already exists, please login",
      });
    }

    if (!validEmailUser && validMobileNumber) {
      return res.status(400).json({
        ok: false,
        msg: "User with this mobile number already exists",
      });
    }


  } catch (error) {
    console.error("Error in sending OTP for verification:", error);
    res.status(500).json({
      ok: false,
      msg: "Failed to send OTP. Please try again later.",
    });
  }
};


export const sendOTPforMobileverification = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    console.log('Request Body:', req.body);

    const validMobileNumberUser = await User.findOne({ mobileNumber });
    console.log('Valid Mobile Number User:', validMobileNumberUser);

    if (!validMobileNumberUser) {
      return res.status(404).send({
        ok: false,
        msg: 'User with this mobile number not found',
      });
    }

    const url = `https://2factor.in/API/V1/1fb18834-4c08-11ef-8b60-0200cd936042/SMS/${mobileNumber}/AUTOGEN/HiyerOTP`;

    const response = await axios.get(url, { maxBodyLength: Infinity });

    console.log('Response Data:', response.data);

    if (response.data.Status === 'Success') {
      return res.status(200).send({
        ok: true,
        msg: 'OTP sent successfully',
        data: response.data,
      });
    } else {
      return res.status(400).send({
        ok: false,
        msg: 'Failed to send OTP',
        data: response.data,
      });
    }
  } catch (error) {
    console.error('Error in sendOTPforMobileVerification:', error);
    return res.status(500).send({
      msg: error.message,
    });
  }
};

// verifyOtpCore function with modifications

const verifyOtpCore = async (email, mobileNo, otp) => {
  try {
    let field, value, verificationSuccessFunction, provider;
    if (email) {
      field = "email";
      value = email;
      verificationSuccessFunction = sendVerificationSuccessEmail;
      provider = "email";
    } else {
      field = "mobileNumber";
      value = `${mobileNo}`;
      verificationSuccessFunction = mobileVerificationSuccess;
      provider = "phone";

      // External API verification for mobile OTP
      const url = `https://2factor.in/API/V1/7d3208f4-0209-11ef-8cbb-0200cd936042/SMS/VERIFY3/${value}/${otp}`;
      const response = await axios.get(url, { maxBodyLength: Infinity });

      if (response.data.Status !== 'Success') {
        return { ok: false, msg: response.data.Details, statusCode: 401 };
      }
    }

    // Internal OTP verification for email
    if (email) {
      const databaseOtp = await UserOTP.find({ [field]: value });

      if (!databaseOtp || databaseOtp.length === 0) {
        return { ok: false, msg: "No OTP records found", statusCode: 404 };
      }

      const matchingOTP = databaseOtp.find((record) => record.otp == otp);

      if (!matchingOTP) {
        return { ok: false, msg: "Wrong OTP!", statusCode: 401 };
      }

      const currentTime = new Date();
      const createdAt = new Date(matchingOTP.createdAt);
      const timeDifference = currentTime - createdAt;

      if (timeDifference > 900000) {
        await UserOTP.deleteMany({ [field]: value });
        return { ok: false, msg: "Your OTP has expired, can't verify", statusCode: 402 };
      }
    }

    const searchCriteria =
      field === "email"
        ? { "email.id": value }
        : { "phone.number": mobileNo, countryCode: countryCode };

    const validUser = await User.findOne(searchCriteria);

    if (!validUser) {
      return { ok: true, msg: "Verification successful", token: null, statusCode: 202, provider };
    }

    const tokenPayload = {
      id: validUser._id,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);

    if (email) {
      await UserOTP.deleteMany({ [field]: value });
      // await verificationSuccessFunction(value);
      const userName = validUser ? validUser.name.first : "User";

      await sendVerificationSuccessEmail(email, userName)
    }

    return { ok: true, msg: "Verification successful", token: token, statusCode: 200, provider };
  } catch (error) {
    console.error("Error in verifyOtpCore:", error);
    return { ok: false, msg: "Internal Server Error", statusCode: 500 };
  }
};


export const verifymobileotp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    console.log('User:', req.body);

    if (!mobileNumber || !otp) {
      return res.status(400).send({
        ok: false,
        msg: 'Mobile number and OTP are required',
      });
    }

    const url = `https://2factor.in/API/V1/7d3208f4-0209-11ef-8cbb-0200cd936042/SMS/VERIFY3/${mobileNumber}/${otp}`;

    const response = await axios.get(url, { maxBodyLength: Infinity });

    console.log('Response Data:', response.data);

    if (response.data.Status === 'Success') {
      return res.status(200).send({
        ok: true,
        msg: 'Mobile number verified',
        data: response.data,
      });
    } else {
      return res.status(401).send({
        ok: false,
        msg: 'Wrong OTP!',
        data: response.data,
      });
    }
  } catch (error) {
    console.error('Error in verifymobileotp:', error);
    return res.status(500).send({
      ok: false,
      msg: 'Internal Server Error',
    });
  }
};

// registerUser function with modifications
export const registerUser = async (req, res) => {
  try {
    const {
      email,
      mobileNo,
      firstName,
      middleName,
      lastName,
      countryCode,
      otp,
      profileType,
      companyName,
    } = req.body;

    // Verify OTP
    const otpVerifyResponse = await verifyOtpCore(email, mobileNo, otp, countryCode);

    if (!otpVerifyResponse.ok) {
      return res.status(otpVerifyResponse.statusCode).json({ msg: otpVerifyResponse.msg });
    }

    // Check if either email or mobile number is provided
    if (!email && !mobileNo) {
      return res.status(400).json({ msg: "Email or mobile number is required" });
    }

    // Check if email or mobile number already exists
    let existingUser;
    let socialLogin;
    if (email) {
      existingUser = await User.findOne({ "email.id": email });
      socialLogin = existingUser ? existingUser.socialLogin : null;
    } else {
      existingUser = await User.findOne({ "phone.number": mobileNo });
    }

    let token = otpVerifyResponse.token;

    if (existingUser) {
      return res.status(409).json({ msg: "Email or mobile number already exists", socialLogin, token });
    }

    // Prepare user data
    const userData = {
      email: {
        id: email,
        verified: true,

      },
      phone: {
        countryCode,
        number: mobileNo,
      },
      name: {
        first: firstName || "",
        middle: middleName || "",
        last: lastName || "",
      },
      profile: {
        profileType,
      }
    };

    // Create a new user instance
    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Create a document in the specific profile type collection
    let profileModel;
    let profileData = {
      _id: savedUser._id, // Use the _id of the newly created user as profileRef
    };

    switch (profileType) {
      case 'IndividualUser':
        profileModel = IndividualUser;
        break;
      case 'OrganizationalUser':
        profileModel = OrganizationalUser;
        profileData = {
          ...profileData,
          name: companyName || userData.name.first, // Ensure the required name field is set
          contact: {
            email: email, // Assuming email is just a string
            phone: `${countryCode}${mobileNo}`, // Format the phone as string
          }
        };
        break;
      case 'OrganizationMember':
        profileModel = OrganizationMember;
        break;
      default:
        return res.status(400).json({ msg: "Invalid profileType" });
    }

    // Update the user's profileRef
    await User.findByIdAndUpdate(savedUser._id, {
      $set: {
        "profile.profileRef": savedUser._id,
      },
    });

    // Save the profile data
    const newProfile = new profileModel(profileData);
    await newProfile.save();

    // Create a token if not provided by OTP verification

    if (!token) {
      const tokenPayload = {
        id: savedUser._id,
      };
      token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
    }

    // Set verified to true for the verified email or phone
    if (otpVerifyResponse.provider === 'email') {
      savedUser.email.verified = true;
    } else {
      savedUser.phone.verified = true;
    }

    if (profileType === 'IndividualUser') {
      await sendWelcomeUserEmail(email, userData.name.first)
    } else if (profileType === 'OrganizationalUser') {
      await sendWelcomeOrgEmail(email, userData.name.first)
    }



    // Respond with success message, status, and user data
    res.status(200).json({
      msg: "User registered successfully",
      ok: true,
      token,
      user: savedUser,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


export const verifyotp = async (req, res) => {
  try {
    const { email, mobileNo, otp, countryCode } = req.body;

    if (!email && !mobileNo) {
      return res.status(400).send({
        msg: "Email or mobile number is required",
        ok: false,
      });
    }

    const result = await verifyOtpCore(email, mobileNo, otp, countryCode);

    if (!result.ok) {
      return res.status(result.statusCode).send({
        msg: result.msg,
        ok: false,
      });
    }

    if (result.token) {
      res.cookie("accessToken", result.token, { httpOnly: true });
    }

    const query = email ? { "email.id": email } : { "phone.number": mobileNo };
    await User.findOneAndUpdate(query, { lastLoggedIn: new Date() });

    return res.status(result.statusCode).send({
      msg: result.msg,
      ok: true,
      token: result.token,
    });
  } catch (error) {
    console.error("Error in verifyotp:", error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};


export const login = async (req, res) => {
  try {
    const { email, mobileNo, countryCode } = req.body;

    if (!email && !mobileNo) {
      return res.status(400).json({
        msg: "Email or mobile number is required",
        ok: false,
      });
    }

    let query;
    if (email) {
      query = { "email.id": email.toLowerCase().trim() };
    } else {
      query = { "phone.number": mobileNo };
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
        ok: false,
      });
    }

    if (user.socialLogin.isSocialLogin) {
      return res.status(200).json({
        msg: "Login with social link",
        ok: true,
      });
    }

    // Send OTP for verification
    if (email) {
      await sendEmailOTPforverification(req, res);
    } else {
      const url = `https://2factor.in/API/V1/7d3208f4-0209-11ef-8cbb-0200cd936042/SMS/${mobileNo}/AUTOGEN/OTP_Template2`;

      const response = await axios.get(url, { maxBodyLength: Infinity });

      if (response.data.Status !== 'Success') {
        return res.status(400).json({
          msg: 'Failed to send OTP',
          ok: false,
          data: response.data,
        });
      }
    }

    return res.status(200).json({
      msg: "OTP sent successfully",
      ok: true,
    });

  } catch (error) {
    console.error('Error in login:', error);
    if (!res.headersSent) {
      res.status(500).json({
        msg: "Internal Server Error",
        ok: false,
      });
    }
  }
};


// export const organisationLogin = async (req, res) => {
//   try {
//     const { email, mobileNo, countryCode } = req.body;

//     if (!email && !mobileNo) {
//       return res.status(400).send({
//         msg: "Email or mobile number is required",
//         ok: false,
//       });
//     }

//     let query;
//     if (email) {
//       query = { "email.id": email.toLowerCase().trim() };
//     } else {
//       query = {
//         "phone.countryCode": countryCode,
//         "phone.number": mobileNo.trim(),
//       };
//     }

//     const user = await User.findOne(query);

//     if (!user) {
//       return res.status(404).send({
//         msg: "Organisation not found",
//         ok: false,
//       });
//     }

//     if (user?.socialLogin?.isSocialLogin) {
//       return res.status(200).send({
//         msg: "Login with social link",
//         ok: true,
//       });
//     }

//     //check if the user is an organization
//     if (user?.profile?.profileType !== "OrganizationalUser") {
//       return res.status(404).send({
//         msg: "User is not an organization, please login as an individual user",
//         ok: false,
//       });

//     }

//     // Generate OTP and send for verification
//     const validEmailUser = await User.findOne({ "email.id": email });
//     const userName = validEmailUser ? validEmailUser?.name?.first : extractNameFromEmail(email);

//     let OTP = Math.floor(Math.random() * 900000) + 100000; // Generate a random 6-digit OTP
//     console.log("OTP is generated", OTP);

//     let otp = new UserOTP({
//       email: email,
//       otp: OTP,
//       createdAt: new Date(),
//       expireAt: new Date(Date.now() + 86400000), // Set expiration time correctly (24 hours)
//     });

//     await otp.save();


//     await sendOtpEmail(email, userName, OTP);

//     res.status(200).json({
//       ok: true,
//       msg: validEmailUser ? "Email sent to existing user" : "Email sent to new user",
//     });
//     console.log('User Name:', userName);
//     // let otpResult;

//     // otpResult = await sendEmailOTPforverification(req, res);

//     // console.log('OTP Result:', otpResult);
//     return res.status(200).send({
//       msg: "OTP sent successfully",
//       ok: true,
//     });

//     // if (!otpResult.ok) {
//     //   return res.status(500).send({
//     //     msg: "Failed to send OTP",
//     //     ok: false,
//     //   });
//     // } else {
//     //   return res.status(200).send({
//     //     msg: "OTP sent successfully",
//     //     ok: true,
//     //   });

//     // }
//   } catch (error) {
//     console.error('Error in login:', error);
//     res.status(500).send({
//       msg: "Internal Server Error",
//       ok: false,
//     });
//   }
// };



export const organisationLogin = async (req, res) => {
  try {
    const { email, mobileNo, countryCode } = req.body;

    if (!email && !mobileNo) {
      return res.status(400).json({
        msg: "Email or mobile number is required",
        ok: false,
      });
    }

    let query;
    if (email) {
      query = { "email.id": email.toLowerCase().trim() };
    } else {
      query = {
        "phone.countryCode": countryCode,
        "phone.number": mobileNo.trim(),
      };
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({
        msg: "Organisation not found",
        ok: false,
      });
    }

    if (user?.socialLogin?.isSocialLogin) {
      return res.status(200).json({
        msg: "Login with social link",
        ok: true,
      });
    }

    // Check if the user is an organization
    if (user?.profile?.profileType !== "OrganizationalUser") {
      return res.status(400).json({
        msg: "User is not an organization, please login as an individual user",
        ok: false,
      });
    }

    // Generate OTP and send for verification
    const validEmailUser = await User.findOne({ "email.id": email });
    const userName = validEmailUser ? validEmailUser?.name?.first : extractNameFromEmail(email);

    let OTP = Math.floor(Math.random() * 900000) + 100000; // Generate a random 6-digit OTP
    console.log("OTP is generated", OTP);

    let otp = new UserOTP({
      email: email,
      otp: OTP,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 86400000), // Set expiration time correctly (24 hours)
    });

    await otp.save();

    await sendOtpEmail(email, userName, OTP);

    res.status(200).json({
      ok: true,
      msg: validEmailUser ? "Email sent to existing user" : "Email sent to new user",
    });

    console.log('User Name:', userName);

  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};




export const updateUserName = async (req, res) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authorizationHeader.split("Bearer ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
    const userId = decodedToken.id;

    const { firstName, middleName, lastName } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user's name fields
    if (firstName) {
      user.name.first = firstName;
    }
    if (middleName) {
      user.name.middle = middleName;
    }
    if (lastName) {
      user.name.last = lastName;
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateEmail = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const userId = decodedToken.id;
  try {
    const { email, otp } = req.body;

    if (!email || !otp || !userId) {
      return res.status(400).send({
        msg: "Email, OTP, and user ID are required",
        ok: false,
      });
    }

    // Verify OTP
    const verificationResult = await verifyotp(req, res);

    if (!verificationResult.ok) {
      return res
        .status(verificationResult.statusCode)
        .json({ msg: verificationResult.msg });
    }
    const user = await User.findOneAndUpdate(
      { _id: userId, verified: true },
      { $set: { "email.id": email.toLowerCase().trim() } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }

    res.status(200).send({
      msg: "Email updated successfully",
      ok: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};

export const updatePhone = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const userId = decodedToken.id;
  try {
    const { mobileNo, otp, countryCode } = req.body;

    if (!mobileNo || !otp || !countryCode || !userId) {
      return res.status(400).send({
        msg: "Mobile number, OTP, country code, and user ID are required",
        ok: false,
      });
    }

    // Verify OTP
    const verificationResult = await verifyotp(req, res);

    if (!verificationResult.ok) {
      return res
        .status(verificationResult.statusCode)
        .json({ msg: verificationResult.msg });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, verified: true }, // Update only verified users with matching ID
      {
        $set: {
          "phone.countryCode": countryCode,
          "phone.number": mobileNo.trim(),
        },
      },
      { new: true } // Return the updated user document
    );

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }

    res.status(200).send({
      msg: "Phone number updated successfully",
      ok: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};

export const socialAuth = async (req, res, next) => {
  const { email, phone, name, socialLogin, profilePicture } = req.body.userData;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ "email.id": email });

    if (!existingUser) {
      // Create a new user if email doesn't exist
      const newUser = new User({
        email: {
          id: email,
          verified: true,
        },
        ...(phone && {
          phone: {
            countryCode: phone.countryCode,
            number: phone.number,
            verified: phone.verified || false,
          },
        }),
        name: {
          first: name.first || "",
          middle: name.middle || "",
          last: name.last || "",
        },
        socialLogin: {
          isSocialLogin: true,
          provider: socialLogin.provider,
        },
        ...(profilePicture && { profilePicture }),
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRETKEY);
      res
        .cookie("accessToken", token, { httpOnly: true })
        .status(201)
        .json({ message: "User created", user: token });
    } else {
      // If email exists
      if (existingUser.socialLogin.provider === socialLogin.provider) {
        // Provider matches, allow login
        const token = jwt.sign(
          { id: existingUser._id },
          process.env.JWT_SECRETKEY
        );
        res
          .cookie("accessToken", token, { httpOnly: true })
          .status(200)
          .json({ message: "User signed in", user: token });
      } else if (!socialLogin.provider) {
        // Provider information not provided, prompt to log in without social login
        res.status(400).json({ message: "Please log in without social login" });
      } else {
        // Provider doesn't match, inform the user to log in with the correct provider
        res.status(400).json({
          message: `Email exists. Please login with the ${existingUser.socialLogin.provider} associated with your account`,
          provider: existingUser.socialLogin.provider,
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const foundUser = await User.findById(userId);

    // Check if the user is not found
    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Respond with the user data
    res.status(200).json({ user: foundUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCurrentUser = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const id = decodedToken.id;
  try {
    // Find user by ID
    const user = await User.findById(id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // User found, send user data in the response
    res.status(200).json({ user });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split("Bearer ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRETKEY);
  const id = decodedToken.id;

  try {
    // Find user by ID
    const user = await User.findById(id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    // Send success response
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
