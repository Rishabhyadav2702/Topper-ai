import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  CircleCheck,
  Brain,
  Flame,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import { apiRequest, getStoredUser } from "../api/client";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    const data = await apiRequest("/dashboard");
    setDashboard(data);
    setError("");
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest("/dashboard")
      .then((data) => {
        if (!active) return;
        setDashboard(data);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      await apiRequest(`/study-plan/${taskId}/toggle`, { method: "PATCH" });
      await fetchDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const fallbackUser = getStoredUser();
  const displayName = dashboard?.user?.name || fallbackUser?.name || "Student";
  const firstName = displayName.trim().split(/\s+/)[0];

  const stats = dashboard?.stats || {
    studyProgress: 0,
    tasksCompleted: 0,
    totalTasks: 0,
    latestQuizScore: 0,
    quizTaken: false,
    studyStreak: 1,
  };

  const tasks = dashboard?.tasks?.slice(0, 4) || [];
  const strongAreas = dashboard?.performance?.strongAreas || [];
  const needsAttention = dashboard?.performance?.needsAttention || [];

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar
          title={`${getGreeting()}, ${firstName} 👋`}
          subtitle="Let's make today productive!"
        />

        {error && (
          <div className="page-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="stats-grid">
          <StatCard
            icon={<BookOpen size={22} />}
            label="Study Progress"
            value={loading ? "..." : `${stats.studyProgress}%`}
            description={`${stats.tasksCompleted} of ${stats.totalTasks} tasks`}
          />

          <StatCard
            icon={<CircleCheck size={22} />}
            label="Tasks Completed"
            value={loading ? "..." : String(stats.tasksCompleted)}
            description="In your study plan"
          />

          <StatCard
            icon={<Brain size={22} />}
            label="Quiz Score"
            value={
              loading
                ? "..."
                : stats.quizTaken
                ? `${stats.latestQuizScore}%`
                : "—"
            }
            description={stats.quizTaken ? "Latest diagnostic" : "No quiz yet"}
          />

          <StatCard
            icon={<Flame size={22} />}
            label="Study Streak"
            value={
              loading
                ? "..."
                : `${stats.studyStreak} Day${stats.studyStreak === 1 ? "" : "s"}`
            }
            description="Keep it going!"
          />
        </div>

        <section className="dashboard-grid">
          <div className="today-card">
            <div className="card-header">
              <div>
                <p className="card-label">TODAY'S PLAN</p>
                <h2>Let's learn something new</h2>
              </div>

              <Link to="/study-plan">
                View Plan <ArrowRight size={17} />
              </Link>
            </div>

            <div className="task-list">
              {loading ? (
                <p className="muted-empty">Loading your study tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="muted-empty">
                  No tasks yet.{" "}
                  <Link to="/study-plan" className="inline-link">
                    Add your first study task
                  </Link>
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="task-item clickable"
                    onClick={() => handleToggleTask(task._id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggleTask(task._id);
                      }
                    }}
                  >
                    <div
                      className={`task-check ${task.completed ? "completed" : ""}`}
                    >
                      ✓
                    </div>

                    <div>
                      <h4>{task.title}</h4>
                      <p>
                        {task.subject} · {task.duration}
                      </p>
                    </div>

                    <span
                      className={`task-status ${task.completed ? "done" : ""}`}
                    >
                      {task.completed ? "Completed" : "Start"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mentor-card">
            <div className="mentor-icon">
              <Brain size={32} />
            </div>

            <p className="card-label">AI MENTOR</p>

            <h2>{dashboard?.insight?.title || "Your personalized insight"}</h2>

            <p>
              {loading
                ? "Analyzing your latest activity..."
                : dashboard?.insight?.recommendation ||
                  "Take the Diagnostic Quiz to get personalized insights!"}
            </p>

            <Link to="/mentor">
              Talk to AI Mentor <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <section className="performance-section">
          <div className="section-title">
            <div>
              <p className="card-label">PERFORMANCE</p>
              <h2>Your learning overview</h2>
            </div>
          </div>

          {!loading && !stats.quizTaken ? (
            <div className="performance-card empty-quiz-cta">
              <h3>No Diagnostic Quiz Taken Yet 🎯</h3>
              <p>
                Complete the 5-question Diagnostic Quiz to unlock your topic
                strengths and focus areas.
              </p>
              <Link to="/quiz" className="primary-btn">
                Take Diagnostic Quiz <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="performance-grid">
              <div className="performance-card">
                <h3>Strong Areas 💪</h3>
                {strongAreas.length === 0 ? (
                  <p className="muted-empty">
                    Score 70%+ on a topic in the Diagnostic Quiz to appear here.
                  </p>
                ) : (
                  strongAreas.map((item) => (
                    <div key={item.topic}>
                      <div className="skill">
                        <span>{item.topic}</span>
                        <b>{item.percentage}%</b>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="performance-card">
                <h3>Needs Attention 🎯</h3>
                {needsAttention.length === 0 ? (
                  <p className="muted-empty">
                    Great job — all tested topics are 70% or higher!
                  </p>
                ) : (
                  needsAttention.map((item) => (
                    <div key={item.topic}>
                      <div className="skill">
                        <span>{item.topic}</span>
                        <b>{item.percentage}%</b>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill weak"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
