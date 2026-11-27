const StudyTask = require("../models/StudyTask");
const QuizAttempt = require("../models/QuizAttempt");

const STARTER_TASKS = [
  {
    title: "Learn JavaScript Functions",
    subject: "JavaScript",
    duration: "45 min",
    completed: true,
    completedAt: new Date(),
  },
  {
    title: "Practice Array Questions",
    subject: "JavaScript",
    duration: "30 min",
    completed: true,
    completedAt: new Date(),
  },
  {
    title: "Learn Linked List Basics",
    subject: "Data Structures",
    duration: "60 min",
    completed: false,
    completedAt: null,
  },
  {
    title: "React Components Practice",
    subject: "React",
    duration: "45 min",
    completed: false,
    completedAt: null,
  },
];

const DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Tool Multi Language",
      "Home Text Markup Language",
    ],
    correctAnswer: 0,
    topic: "HTML",
  },
  {
    id: 2,
    question: "Which keyword is used to declare a constant in JavaScript?",
    options: ["let", "var", "const", "static"],
    correctAnswer: 2,
    topic: "JavaScript",
  },
  {
    id: 3,
    question: "Which data structure follows LIFO?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    topic: "Data Structures",
  },
  {
    id: 4,
    question: "What is React mainly used for?",
    options: [
      "Database Management",
      "Building User Interfaces",
      "Operating Systems",
      "Networking",
    ],
    correctAnswer: 1,
    topic: "React",
  },
  {
    id: 5,
    question: "Which CSS property is used to create space inside an element?",
    options: ["margin", "padding", "border", "gap"],
    correctAnswer: 1,
    topic: "CSS",
  },
];

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const touchUserStreak = async (user) => {
  if (!user) return;
  const today = getLocalDateKey();
  if (user.lastStreakDate === today) return;

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getLocalDateKey(yesterdayDate);

  if (user.lastStreakDate === yesterday) {
    user.studyStreak = (user.studyStreak || 1) + 1;
  } else {
    user.studyStreak = 1;
  }
  user.lastStreakDate = today;
  await user.save();
};

const ensureUserTasksInitialized = async (user) => {
  if (!user || user.studyPlanInitialized) return;

  const existingCount = await StudyTask.countDocuments({ user: user._id });
  if (existingCount === 0) {
    await StudyTask.insertMany(
      STARTER_TASKS.map((task) => ({
        ...task,
        user: user._id,
      }))
    );
  }

  user.studyPlanInitialized = true;
  await user.save();
};

const buildInsightText = (userName, topicScores, completedTasks, totalTasks, quizTaken) => {
  if (!quizTaken) {
    const pending = totalTasks - completedTasks;
    return `Hi ${userName}! You have ${pending} pending task${pending === 1 ? "" : "s"} in your study plan. Take the Diagnostic Quiz so I can pinpoint your strongest subjects and weak spots! 🚀`;
  }

  const sorted = [...topicScores].sort((a, b) => b.percentage - a.percentage);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  if (weakest && weakest.percentage < 70 && strongest && strongest.topic !== weakest.topic) {
    return `Hi ${userName}! You're doing great in ${strongest.topic} (${strongest.percentage}%), while ${weakest.topic} (${weakest.percentage}%) needs a bit more practice. Focus on ${weakest.topic} in your study plan today! 🎯`;
  }

  return `Awesome consistency, ${userName}! You're scoring ${strongest?.percentage ?? 100}% in ${strongest?.topic || "your topics"} and have completed ${completedTasks} of ${totalTasks} study tasks. Keep the momentum going! 🌟`;
};

const buildWeeklyProgress = (tasks, attempts) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const counts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  const mapJsDayToLabel = (dateObj) => {
    const jsDay = dateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    return days[jsDay === 0 ? 6 : jsDay - 1];
  };

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  tasks.forEach((task) => {
    if (task.completed && task.completedAt && new Date(task.completedAt) >= sevenDaysAgo) {
      const label = mapJsDayToLabel(new Date(task.completedAt));
      counts[label] += 35;
    }
  });

  attempts.forEach((attempt) => {
    if (attempt.createdAt && new Date(attempt.createdAt) >= sevenDaysAgo) {
      const label = mapJsDayToLabel(new Date(attempt.createdAt));
      counts[label] += Math.max(25, Math.round(attempt.percentage * 0.6));
    }
  });

  const hasActivity = Object.values(counts).some((v) => v > 0);
  return days.map((day) => ({
    day,
    value: hasActivity ? Math.min(100, counts[day] || 15) : 0,
  }));
};

const buildUserLearningSummary = async (user) => {
  const [tasks, attempts] = await Promise.all([
    StudyTask.find({ user: user._id }).sort({ createdAt: 1 }),
    QuizAttempt.find({ user: user._id }).sort({ createdAt: -1 }),
  ]);

  const totalTasks = tasks.length;
  const tasksCompleted = tasks.filter((t) => t.completed).length;
  const studyProgress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

  const quizTaken = attempts.length > 0;
  const latestAttempt = attempts[0] || null;
  const latestQuizScore = latestAttempt ? latestAttempt.percentage : 0;

  // Aggregate topic performance using the latest score per topic across attempts
  const topicMap = new Map();
  // Iterate oldest -> newest so latest attempt overwrites earlier topic percentage
  [...attempts].reverse().forEach((attempt) => {
    (attempt.topicBreakdown || []).forEach((item) => {
      topicMap.set(item.topic, item);
    });
  });

  const topicScores = Array.from(topicMap.values());
  const strongAreas = topicScores.filter((t) => t.percentage >= 70);
  const needsAttention = topicScores.filter((t) => t.percentage < 70);

  const insightText = buildInsightText(
    user.name,
    topicScores,
    tasksCompleted,
    totalTasks,
    quizTaken
  );

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      grade: user.grade,
      targetExam: user.targetExam,
    },
    stats: {
      studyProgress,
      tasksCompleted,
      totalTasks,
      latestQuizScore,
      quizTaken,
      studyStreak: user.studyStreak || 1,
    },
    tasks,
    performance: {
      strongAreas,
      needsAttention,
      allTopics: topicScores,
    },
    weeklyProgress: buildWeeklyProgress(tasks, attempts),
    recentAttempts: attempts.slice(0, 5),
    insight: {
      title: "Your personalized insight",
      recommendation: insightText,
      actionUrl: quizTaken ? "/mentor" : "/quiz",
    },
  };
};

module.exports = {
  STARTER_TASKS,
  DIAGNOSTIC_QUESTIONS,
  touchUserStreak,
  ensureUserTasksInitialized,
  buildUserLearningSummary,
};
