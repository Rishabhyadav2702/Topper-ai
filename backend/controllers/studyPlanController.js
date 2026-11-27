const StudyTask = require("../models/StudyTask");
const {
  ensureUserTasksInitialized,
  touchUserStreak,
} = require("../utils/learningHelpers");

const getStudyPlan = async (req, res) => {
  try {
    await ensureUserTasksInitialized(req.user);
    const tasks = await StudyTask.find({ user: req.user._id }).sort({ createdAt: 1 });
    const completedCount = tasks.filter((t) => t.completed).length;

    res.json({
      tasks,
      completedCount,
      totalCount: tasks.length,
      progressPercentage:
        tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0,
    });
  } catch (error) {
    console.error("Get study plan error:", error);
    res.status(500).json({ message: error.message || "Failed to load study plan" });
  }
};

const addStudyTask = async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const subject = String(req.body.subject || "General").trim();
    const duration = String(req.body.duration || "30 min").trim();

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    await ensureUserTasksInitialized(req.user);

    const task = await StudyTask.create({
      user: req.user._id,
      title,
      subject: subject || "General",
      duration: duration || "30 min",
      completed: false,
    });

    await touchUserStreak(req.user);
    res.status(201).json({ task });
  } catch (error) {
    console.error("Add study task error:", error);
    res.status(500).json({ message: error.message || "Failed to create study task" });
  }
};

const toggleStudyTask = async (req, res) => {
  try {
    const task = await StudyTask.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Study task not found" });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    if (task.completed) {
      await touchUserStreak(req.user);
    }

    res.json({ task });
  } catch (error) {
    console.error("Toggle study task error:", error);
    res.status(500).json({ message: error.message || "Failed to update study task" });
  }
};

const deleteStudyTask = async (req, res) => {
  try {
    const deleted = await StudyTask.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Study task not found" });
    }

    res.json({ message: "Task removed", id: req.params.id });
  } catch (error) {
    console.error("Delete study task error:", error);
    res.status(500).json({ message: error.message || "Failed to delete study task" });
  }
};

module.exports = {
  getStudyPlan,
  addStudyTask,
  toggleStudyTask,
  deleteStudyTask,
};
