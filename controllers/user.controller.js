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

export const sendEmailOTPforverification = async (req, res) => {
  try {
    let user = req.body;
    console.log("req", req.body);
    const email = user.email;

    const validEmailUser = await User.findOne({
      email,
    });
    let OTP = Math.floor(Math.random() * 900000) + 100000;
    console.log("OTP is generated", OTP);

    let otp = new UserOTP({
      email: email,
      otp: OTP,
      createdAt: new Date(),
      expireAt: new Date() + 86400000,
    });

    await otp.save();
    if (!validEmailUser) {
      await emailVerificationEmail(email, OTP, "User");

      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }

    await emailVerificationEmail(email, OTP, validEmailUser.fullName);

    res.status(200).send({
      ok: true,
      msg: "email sent",
    });
  } catch (error) {
    console.error("Error in sendOTPforverification:", error);
    res.status(500).send({
      msg: error.message,
    });
  }
};

export const verifyotp = async (req, res) => {
  try {
    let { email, mobileNo, otp, countryCode } = req.body;

    if (!email && !mobileNo) {
      return res.status(400).send({
        msg: "Email or mobile number is required",
        ok: false,
      });
    }

    // Determine which field to use for verification
    let field, value, verificationSuccessFunction;
    if (email) {
      field = "email";
      value = email;
      verificationSuccessFunction = emailVerificationSuccess;
    } else {
      field = "mobileNumber";
      value = countryCode + mobileNo;
      verificationSuccessFunction = mobileVerificationSuccess;
    }

    // Find OTP records for the provided field value
    const databaseotp = await UserOTP.find({ [field]: value });

    if (!databaseotp || databaseotp.length === 0) {
      return res.status(404).send({
        msg: "No OTP records found",
        ok: false,
      });
    }

    // Check if the provided OTP matches any of the OTP records
    const matchingOTP = databaseotp.find((record) => record.otp == otp);

    if (!matchingOTP) {
      return res.status(401).send({
        msg: "Wrong OTP!",
        ok: false,
      });
    }

    // Calculate the time difference
    const currentTime = new Date();
    const createdAt = new Date(matchingOTP.createdAt);
    const timeDifference = currentTime - createdAt;

    // Check if the time difference is more than 15 minutes (900,000 milliseconds)
    if (timeDifference > 900000) {
      // Delete OTP records for the provided field value
      await UserOTP.deleteMany({ [field]: value });

      return res.status(402).send({
        msg: "Your OTP has expired, can't verify",
        ok: false,
      });
    }
    if (email) {
      field = "email.id";
    } else {
      field = "phone.number";
    }
    // Update user's emailVerified status
    const searchCriteria =
      field === "email.id"
        ? { [field]: value }
        : { [field]: value, countryCode: countryCode };
    const validUser = await User.findOne(searchCriteria);
    if (!validUser) {
      return res.status(202).send({
        msg: "Verification successful",
        ok: false,
      });
    }

    // Include user ID and role in the JWT token payload
    const tokenPayload = {
      id: validUser._id,
    };

    const Token = jwt.sign(tokenPayload, process.env.JWT_SECRETKEY);
    res.cookie("accessToken", Token, { httpOnly: true });

    // Delete OTP records for the provided field value
    await UserOTP.deleteMany({ [field]: value });
    await verificationSuccessFunction(value);

    return res.status(200).send({
      msg: "Verification successful",
      ok: true,
      token: Token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      msg: "Internal Server Error",
      ok: false,
    });
  }
};

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
    } = req.body;

    // Verify OTP
    const otpVerifyResponse = await verifyotp(req);

    // Check if OTP verification was successful
    if (!otpVerifyResponse.ok) {
      return res
        .status(otpVerifyResponse.statusCode)
        .json({ msg: otpVerifyResponse.msg });
    }

    // Check if either email or mobile number is provided
    if (!email && !mobileNo) {
      return res
        .status(400)
        .json({ msg: "Email or mobile number is required" });
    }

    // Check if email or mobile number already exists
    let existingUser;
    let socialLogin;
    if (email) {
      existingUser = await User.findOne({ "email.id": email });
      socialLogin = existingUser ? existingUser.socialLogin : null; // Check if user exists
    } else {
      existingUser = await User.findOne({ "phone.number": mobileNo });
    }

    // If user already exists, return conflict status
    if (existingUser) {
      return res
        .status(409)
        .json({ msg: "Email or mobile number already exists", socialLogin });
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
        verified: true,
      },
      name: {
        first: firstName || "",
        middle: middleName || "",
        last: lastName || "",
      },
    };

    // Create a new user instance
    const newUser = new User(userData);

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Respond with success message, status, and user data
    res.status(200).json({
      msg: "User registered successfully",
      ok: true,
      token: otpVerifyResponse.token, // Include token from OTP verification
      user: savedUser,
    });
  } catch (error) {
    // If any error occurs during registration, respond with error message
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, mobileNo, countryCode } = req.body;

    if (!email && !mobileNo) {
      return res.status(400).send({
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
      return res.status(404).send({
        msg: "User not found",
        ok: false,
      });
    }

    if (user.socialLogin.isSocialLogin) {
      return res.status(200).send({
        msg: "Login with social link ",
        ok: true,
      });
    }

    // Generate OTP and send for verification
    let otpResult;
    if (email) {
      otpResult = await sendEmailOTPforverification(req);
    } else {
      // otpResult = await sendMobileOTPforVerification(req);
    }

    if (!otpResult.ok) {
      res.status(500).send({
        msg: "Failed to send OTP",
        ok: false,
      });
    } else {
      res.status(200).send({
        msg: "OTP sent successfully",
        ok: true,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
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
