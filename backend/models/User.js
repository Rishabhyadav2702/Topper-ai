const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    grade: {
      type: String,
      default: "12th Standard",
    },
    targetExam: {
      type: String,
      default: "JEE / NEET / Boards",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    studyPlanInitialized: {
      type: Boolean,
      default: false,
    },
    studyStreak: {
      type: Number,
      default: 1,
    },
    lastStreakDate: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to MongoDB
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
