import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import { sendOtpEmail } from "../utils/email.js";
import Otp from "../model/otp.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// =====================
// Generate JWT Token
// =====================
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

// =====================
// Register User
// =====================
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ==========================
    // ISSUE 1:
    // Validation was missing
    // ==========================
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // ==========================
    // ISSUE 2:
    // Missing await
    // Old:
    // let userExsit = User.findOne({ email });
    // ==========================
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ==========================
    // ISSUE 3:
    // Wrong:
    // new User.create()
    // ==========================
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    // 6-digit OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    console.log(`OTP for ${email}: ${otp}`);

    await Otp.create({
      email,
      otp,
      action: "account_verification",
    });

    await sendOtpEmail(
      email,
      otp,
      "account Verification"
    );

    res.status(201).json({
      message:
        "User registered successfully. Please verify your email.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// =====================
// Login User
// =====================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        error: "Invalid credentials. Please register.",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid credentials",
      });
    }

    // ==========================
    // ISSUE 4:
    // Typo
    // accont_verification ❌
    // account_verification ✅
    // ==========================
    if (!user.isVerified && user.role === "user") {
      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      await Otp.deleteMany({
        email,
        action: "account_verification",
      });

      await Otp.create({
        email,
        otp,
        action: "account_verification",
      });

      await sendOtpEmail(
        email,
        otp,
        "account Verification"
      );

      return res.status(400).json({
        error:
          "Please verify your account. A new OTP has been sent to your email.",
      });
    }

    // ==========================
    // ISSUE 5:
    // Token was missing
    // ==========================
    res.status(200).json({
      message: "Login successful",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// =====================
// Verify OTP
// =====================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await Otp.findOne({
      email,
      otp,
      action: "account_verification",
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // ==========================
    // ISSUE 6:
    // updateOne() doesn't return user
    // Use findOneAndUpdate()
    // ==========================
    const user = await User.findOneAndUpdate(
      { email },
      {
        isVerified: true,
      },
      {
        new: true,
      }
    );

    await Otp.deleteMany({
      email,
      action: "account_verification",
    });

    res.status(200).json({
      message: "Account verified successfully",
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  verifyOtp,
};