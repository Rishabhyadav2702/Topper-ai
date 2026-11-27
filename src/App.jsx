import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import StudyPlan from "./pages/StudyPlan";
import Progress from "./pages/Progress";
import Mentor from "./pages/Mentor";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/quiz" element={<Quiz />} />
      <Route
        path="/study-plan"
        element={
          <ProtectedRoute>
            <StudyPlan />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor"
        element={
          <ProtectedRoute>
            <Mentor />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
