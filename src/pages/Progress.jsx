import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { apiRequest } from "../api/client";

function Progress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setError("");
        const res = await apiRequest("/dashboard");
        setData(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProgress();
  }, []);

  const stats = data?.stats || {
    studyProgress: 0,
    studyStreak: 1,
    tasksCompleted: 0,
    totalTasks: 0,
    quizTaken: false,
    latestQuizScore: 0,
  };
  const weeklyProgress = data?.weeklyProgress || [];
  const allTopics = data?.performance?.allTopics || [];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar
          title="Your Progress"
          subtitle="Track your learning journey and improvement."
        />

        {error && (
          <div className="page-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="progress-summary">
          <div className="summary-card">
            <p>Overall Progress</p>
            <h1>{loading ? "..." : `${stats.studyProgress}%`}</h1>
            <span>
              {stats.tasksCompleted} of {stats.totalTasks} tasks completed
            </span>
          </div>

          <div className="summary-card">
            <p>Study Streak</p>
            <h1>
              🔥 {loading ? "..." : `${stats.studyStreak} Day${stats.studyStreak === 1 ? "" : "s"}`}
            </h1>
            <span>Keep the streak alive!</span>
          </div>

          <div className="summary-card">
            <p>Latest Quiz Score</p>
            <h1>
              {loading ? "..." : stats.quizTaken ? `${stats.latestQuizScore}%` : "—"}
            </h1>
            <span>
              {stats.quizTaken ? "From your diagnostic quiz" : "Take a quiz to score"}
            </span>
          </div>
        </div>

        <div className="chart-card">
          <div>
            <p className="card-label">WEEKLY ACTIVITY</p>
            <h2>Your Study Progress</h2>
          </div>

          <div className="bar-chart">
            {weeklyProgress.map((item) => (
              <div className="bar-item" key={item.day}>
                <div
                  className="bar"
                  style={{ height: `${Math.max(item.value * 2, 22)}px` }}
                >
                  <span>{item.value}%</span>
                </div>

                <p>{item.day}</p>
              </div>
            ))}
          </div>
        </div>

        {allTopics.length === 0 && !loading ? (
          <div className="performance-card empty-quiz-cta" style={{ marginTop: "25px" }}>
            <h3>Subject Performance Breakdown</h3>
            <p>
              Complete the Diagnostic Quiz to see how you perform across each
              subject.
            </p>
            <Link to="/quiz" className="primary-btn">
              Take Diagnostic Quiz
            </Link>
          </div>
        ) : (
          <div className="subject-performance">
            {allTopics.map((topic) => (
              <div className="performance-card" key={topic.topic}>
                <h3>{topic.topic}</h3>
                <h1>{topic.percentage}%</h1>
                <p>
                  {topic.percentage >= 80
                    ? "Excellent performance 🚀"
                    : topic.percentage >= 60
                    ? "Good progress — keep practicing 💪"
                    : "Needs more attention 🎯"}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Progress;
