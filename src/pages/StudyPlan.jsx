import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Plus, Trash2, AlertCircle } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { apiRequest } from "../api/client";

function StudyPlan() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    duration: "30 min",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setError("");
        const data = await apiRequest("/study-plan");
        setTasks(data.tasks || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, []);

  const toggleTask = async (id) => {
    try {
      setError("");
      const data = await apiRequest(`/study-plan/${id}/toggle`, {
        method: "PATCH",
      });
      setTasks((prev) =>
        prev.map((task) => (task._id === id ? data.task : task))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim() || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const data = await apiRequest("/study-plan", {
        method: "POST",
        body: JSON.stringify({
          title: newTask.title.trim(),
          subject: newTask.subject.trim() || "General",
          duration: newTask.duration.trim() || "30 min",
        }),
      });
      setTasks((prev) => [...prev, data.task]);
      setNewTask({ title: "", subject: "", duration: "30 min" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setError("");
      await apiRequest(`/study-plan/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((task) => task._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressPercent =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Topbar
          title="Your Study Plan"
          subtitle="A personalized roadmap synced with your account."
        />

        {error && (
          <div className="page-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="plan-overview">
          <div>
            <p className="card-label">TODAY'S PROGRESS</p>
            <h2>
              {completedTasks} of {tasks.length} tasks completed
            </h2>
          </div>

          <div className="plan-percentage">{progressPercent}%</div>
        </div>

        <div className="plan-progress-bar">
          <div style={{ width: `${progressPercent}%` }} />
        </div>

        <form className="add-task-form" onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Add a study task (e.g., Binary Trees practice)"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />
          <input
            type="text"
            placeholder="Subject (e.g., DSA)"
            value={newTask.subject}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, subject: e.target.value }))
            }
          />
          <input
            type="text"
            placeholder="Duration"
            value={newTask.duration}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, duration: e.target.value }))
            }
          />
          <button type="submit" disabled={submitting || !newTask.title.trim()}>
            <Plus size={18} />
            {submitting ? "Adding..." : "Add Task"}
          </button>
        </form>

        <div className="study-tasks">
          {loading ? (
            <p className="muted-empty">Loading your study plan...</p>
          ) : tasks.length === 0 ? (
            <div className="performance-card">
              <p className="muted-empty">
                No tasks in your plan yet. Add one above to get started!
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                className={`study-task ${
                  task.completed ? "task-completed" : ""
                }`}
                key={task._id}
              >
                <button
                  type="button"
                  className="complete-task"
                  onClick={() => toggleTask(task._id)}
                  aria-label="Toggle task completion"
                >
                  <CheckCircle2 size={25} />
                </button>

                <div className="study-task-info">
                  <h3>{task.title}</h3>
                  <p>{task.subject}</p>
                </div>

                <div className="task-duration">
                  <Clock size={17} />
                  {task.duration}
                </div>

                <span
                  className={
                    task.completed ? "completed-label" : "pending-label"
                  }
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>

                <button
                  type="button"
                  className="delete-task-btn"
                  onClick={() => handleDeleteTask(task._id)}
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default StudyPlan;
