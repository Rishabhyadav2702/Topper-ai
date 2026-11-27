const QuizAttempt = require("../models/QuizAttempt");
const {
  DIAGNOSTIC_QUESTIONS,
  touchUserStreak,
} = require("../utils/learningHelpers");

const getQuizQuestions = async (req, res) => {
  const questions = DIAGNOSTIC_QUESTIONS.map(({ id, question, options, topic }) => ({
    id,
    question,
    options,
    topic,
  }));

  res.json({ questions });
};

const submitQuiz = async (req, res) => {
  try {
    const incomingAnswers = Array.isArray(req.body.answers) ? req.body.answers : [];
    if (incomingAnswers.length === 0) {
      return res.status(400).json({ message: "Please submit quiz answers" });
    }

    const answerLookup = new Map(
      incomingAnswers.map((a) => [Number(a.questionId), Number(a.selectedAnswer)])
    );

    const gradedAnswers = [];
    const topicTotals = new Map();
    let score = 0;

    DIAGNOSTIC_QUESTIONS.forEach((q) => {
      const selected = answerLookup.has(q.id) ? answerLookup.get(q.id) : -1;
      const isCorrect = selected === q.correctAnswer;
      if (isCorrect) score += 1;

      gradedAnswers.push({
        questionId: q.id,
        topic: q.topic,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
      });

      const current = topicTotals.get(q.topic) || { topic: q.topic, correct: 0, total: 0 };
      current.total += 1;
      if (isCorrect) current.correct += 1;
      topicTotals.set(q.topic, current);
    });

    const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const topicBreakdown = Array.from(topicTotals.values()).map((item) => ({
      ...item,
      percentage: Math.round((item.correct / item.total) * 100),
    }));

    let savedAttempt = null;
    if (req.user) {
      savedAttempt = await QuizAttempt.create({
        user: req.user._id,
        score,
        totalQuestions,
        percentage,
        topicBreakdown,
        answers: gradedAnswers,
      });
      await touchUserStreak(req.user);
    }

    res.status(req.user ? 201 : 200).json({
      saved: Boolean(savedAttempt),
      attempt: savedAttempt || {
        score,
        totalQuestions,
        percentage,
        topicBreakdown,
        answers: gradedAnswers,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({ message: error.message || "Failed to grade quiz" });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ attempts });
  } catch (error) {
    console.error("Quiz history error:", error);
    res.status(500).json({ message: error.message || "Failed to fetch quiz history" });
  }
};

module.exports = {
  getQuizQuestions,
  submitQuiz,
  getQuizHistory,
};
