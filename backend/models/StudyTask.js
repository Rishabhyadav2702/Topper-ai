const mongoose = require("mongoose");

const studyTaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Please provide a subject"],
      trim: true,
      default: "General",
    },
    duration: {
      type: String,
      trim: true,
      default: "30 min",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StudyTask = mongoose.model("StudyTask", studyTaskSchema);

module.exports = StudyTask;
