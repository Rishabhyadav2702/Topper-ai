const mongoose = require("mongoose");

const topicScoreSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: Number, required: true },
    topic: { type: String, required: true },
    selectedAnswer: { type: Number, required: true },
    correctAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    topicBreakdown: [topicScoreSchema],
    answers: [answerSchema],
  },
  {
    timestamps: true,
  }
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

module.exports = QuizAttempt;
