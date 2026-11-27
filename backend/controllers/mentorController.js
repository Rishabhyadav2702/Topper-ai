const ChatMessage = require("../models/ChatMessage");
const {
  buildUserLearningSummary,
  touchUserStreak,
} = require("../utils/learningHelpers");

const generateEducationalResponse = (userQuestion, userName = "Student", context = null) => {
  const query = userQuestion.toLowerCase().trim();
  const weakList = context?.performance?.needsAttention?.map((t) => t.topic) || [];
  const weakHint =
    weakList.length > 0
      ? ` Based on your diagnostic quiz, prioritizing **${weakList.join(", ")}** will give you the biggest boost.`
      : "";

  if (
    query.includes("javascript") ||
    query.includes("js") ||
    query.includes("closure") ||
    query.includes("promise") ||
    query.includes("async")
  ) {
    return `Hey ${userName}! 💻 Here's what you need to understand about this concept:

1. **Core Concept:** In JavaScript, asynchronous programming and functions are foundational. For example, a **closure** is created whenever an inner function retains access to its outer lexical scope even after that outer function has finished executing.
2. **Best Practice:** Always use modern ES6+ patterns like \`async/await\` over callback chains for cleaner, error-resistant code.
3. **Action Step:** Try writing a small 10-line example in your browser console to test this right now.${weakHint}`;
  }

  if (
    query.includes("data structure") ||
    query.includes("array") ||
    query.includes("linked list") ||
    query.includes("tree") ||
    query.includes("graph") ||
    query.includes("dsa") ||
    query.includes("stack") ||
    query.includes("queue")
  ) {
    return `Great question, ${userName}! 🧠 Data Structures are key to problem solving:

1. **How to Approach:** Break down the time and space complexity:
   - **Array:** $O(1)$ random lookup by index, but $O(N)$ insertion/deletion in the middle.
   - **Linked List:** $O(1)$ insertion at known pointers, but $O(N)$ sequential traversal.
2. **Visual Tip:** Always draw pointer movements or recursion trees on paper before coding.
3. **Recommendation:** Practice 2 medium problems on Linked Lists or Stacks today and check off your Data Structures task in **Study Plan**!`;
  }

  if (
    query.includes("react") ||
    query.includes("hook") ||
    query.includes("state") ||
    query.includes("props") ||
    query.includes("useeffect")
  ) {
    return `Let's master React together, ${userName}! ⚛️

1. **State vs Props:** \`props\` are read-only inputs passed from parent to child components, while \`state\` (\`useState\`) is local memory that triggers a re-render when changed.
2. **Key Rule of useEffect:** Always specify the exact dependency array \`[dep1, dep2]\`. An empty array \`[]\` means it only runs on mount.
3. **Practice Idea:** Try building a small toggleable task card and inspect how state updates trigger re-renders!`;
  }

  if (
    query.includes("physics") ||
    query.includes("math") ||
    query.includes("chemistry") ||
    query.includes("formula") ||
    query.includes("jee") ||
    query.includes("neet")
  ) {
    return `Hello ${userName}! 📐 Here's a structured breakdown for your exam preparation:

1. **Formula & Principles:** Never just memorize formulas — understand the *boundary conditions* and *assumptions* under which each formula holds.
2. **Problem Solving Technique:**
   - Step 1: Write down all knowns & unknowns with units.
   - Step 2: Draw a Free Body Diagram (FBD) or visual sketch.
   - Step 3: Apply the governing law (e.g., Conservation of Energy or Momentum).
3. **Study Tip:** Solve 5 previous years' questions (PYQs) right after studying any topic to test your conceptual clarity!`;
  }

  if (
    query.includes("study") ||
    query.includes("plan") ||
    query.includes("time") ||
    query.includes("routine") ||
    query.includes("focus") ||
    query.includes("motivation")
  ) {
    return `You've got this, ${userName}! 🎯 Here is my recommended Topper.ai study strategy:

- **Pomodoro Technique:** Study with 100% focus for 25 minutes, then take a strict 5-minute break.
- **Active Recall:** Instead of just re-reading notes, close the book and write down everything you remember.
- **Spaced Repetition:** Revisit difficult topics at 1-day, 3-day, and 7-day intervals.${weakHint}
Check out your **Study Plan** tab in the sidebar to tick off today's milestones!`;
  }

  return `Hi ${userName}! 🎓 That's a thoughtful question:

"${userQuestion}"

Here is how I recommend breaking this down:
1. **First Principles:** Identify the fundamental concepts underlying this topic.
2. **Step-by-step Execution:** Learn the theory first, solve a simple guided example, and then tackle a realistic problem on your own.
3. **Next Steps:** Would you like me to explain the core definitions, provide a worked example, or give you a quick quiz question to test yourself?${weakHint}`;
};

const getMentorHistory = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages });
  } catch (error) {
    console.error("Get mentor history error:", error);
    res.status(500).json({ message: error.message || "Failed to load chat history" });
  }
};

const clearMentorHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({ message: "Chat history cleared" });
  } catch (error) {
    console.error("Clear mentor history error:", error);
    res.status(500).json({ message: error.message || "Failed to clear chat history" });
  }
};

const askMentor = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Please provide a question or message" });
    }

    const cleanMessage = message.trim();
    const studentName = req.user ? req.user.name : "Student";
    const apiKey = process.env.GEMINI_API_KEY;

    let userContext = null;
    if (req.user) {
      userContext = await buildUserLearningSummary(req.user);
    }

    let mentorReply = "";

    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const weakTopics =
          userContext?.performance?.needsAttention?.map((t) => `${t.topic} (${t.percentage}%)`).join(", ") ||
          "None identified yet";

        const prompt = `You are Topper.ai Mentor, an encouraging, highly knowledgeable AI tutor and mentor for students.
Student Name: ${studentName}
Topics needing attention: ${weakTopics}
Student Message: ${cleanMessage}
Provide a clear, engaging, step-by-step educational answer with actionable tips and formatting.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          mentorReply = data.candidates[0].content.parts[0].text;
        }
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to built-in mentor engine:", geminiError.message);
      }
    }

    if (!mentorReply) {
      mentorReply = generateEducationalResponse(cleanMessage, studentName, userContext);
    }

    if (req.user) {
      await ChatMessage.insertMany([
        { user: req.user._id, sender: "user", text: cleanMessage },
        { user: req.user._id, sender: "ai", text: mentorReply },
      ]);
      await touchUserStreak(req.user);
    }

    res.json({
      reply: mentorReply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Mentor error:", error);
    res.status(500).json({ message: error.message || "Failed to get AI mentor response" });
  }
};

const getPersonalizedInsight = async (req, res) => {
  try {
    if (req.user) {
      const summary = await buildUserLearningSummary(req.user);
      return res.json(summary.insight);
    }

    res.json({
      title: "Daily Focus Recommendation",
      recommendation:
        "Take the Diagnostic Quiz to unlock personalized insights tailored to your strengths and weak areas! 🚀",
      actionUrl: "/quiz",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  askMentor,
  getPersonalizedInsight,
  getMentorHistory,
  clearMentorHistory,
};
