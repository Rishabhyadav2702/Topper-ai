const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  ensureUserTasksInitialized,
  touchUserStreak,
} = require("../utils/learningHelpers");

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "topper_ai_jwt_super_secret_key_2026",
    { expiresIn: "30d" }
  );
};

const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;
    const { grade, targetExam } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      grade: grade || "12th Standard",
      targetExam: targetExam || "JEE / NEET / Boards",
      lastLogin: new Date(),
    });

    await ensureUserTasksInitialized(user);
    await touchUserStreak(user);

    console.log(`[USER REGISTERED] New student registered: ${user.name} (${user.email})`);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      grade: user.grade,
      targetExam: user.targetExam,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message || "Server error during registration" });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      user.lastLogin = new Date();
      await user.save();
      await ensureUserTasksInitialized(user);
      await touchUserStreak(user);

      console.log(`🔔 [STUDENT LOGIN] ${user.name} (${user.email})`);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        grade: user.grade,
        targetExam: user.targetExam,
        token: generateToken(user._id),
      });
    } else {
      console.log(`⚠️ [FAILED LOGIN ATTEMPT] Email: ${email}`);
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error during login" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: error.message || "Server error fetching profile" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.grade = req.body.grade || user.grade;
    user.targetExam = req.body.targetExam || user.targetExam;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      grade: updatedUser.grade,
      targetExam: updatedUser.targetExam,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: error.message || "Server error updating profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
