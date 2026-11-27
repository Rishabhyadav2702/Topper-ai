const express = require("express");
const router = express.Router();
const {
  askMentor,
  getPersonalizedInsight,
  getMentorHistory,
  clearMentorHistory,
} = require("../controllers/mentorController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");

router.get("/history", protect, getMentorHistory);
router.delete("/history", protect, clearMentorHistory);
router.post("/chat", optionalProtect, askMentor);
router.get("/insight", optionalProtect, getPersonalizedInsight);

module.exports = router;
