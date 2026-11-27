const express = require("express");
const router = express.Router();
const {
  getQuizQuestions,
  submitQuiz,
  getQuizHistory,
} = require("../controllers/quizController");
const { protect, optionalProtect } = require("../middleware/authMiddleware");

router.get("/questions", optionalProtect, getQuizQuestions);
router.post("/submit", optionalProtect, submitQuiz);
router.get("/history", protect, getQuizHistory);

module.exports = router;
