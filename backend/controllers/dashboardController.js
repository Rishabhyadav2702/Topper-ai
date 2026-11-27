const {
  ensureUserTasksInitialized,
  buildUserLearningSummary,
} = require("../utils/learningHelpers");

const getDashboardData = async (req, res) => {
  try {
    await ensureUserTasksInitialized(req.user);
    const summary = await buildUserLearningSummary(req.user);
    res.json(summary);
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: error.message || "Failed to load dashboard data" });
  }
};

module.exports = {
  getDashboardData,
};
