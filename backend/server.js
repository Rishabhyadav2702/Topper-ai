const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const quizRoutes = require("./routes/quizRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/study-plan", studyPlanRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Topper.ai Backend is healthy" });
});

app.get("/", (req, res) => {
  res.send("Topper.ai Backend is running successfully 🚀");
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
