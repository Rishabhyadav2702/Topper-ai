import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  ChartNoAxesCombined,
  Bot,
  LogOut,
  GraduationCap,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthToken } from "../api/client";

function Sidebar() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(getAuthToken());

  const handleLogout = () => {
    clearAuthSession();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="logo">
          <div className="logo-icon">
            <GraduationCap size={24} />
          </div>

          <div>
            <h2>Topper<span>.ai</span></h2>
            <p>Learn smarter</p>
          </div>
        </div>

        <nav className="nav-menu">
          <NavLink to="/dashboard">
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink to="/quiz">
            <ClipboardList size={20} />
            Diagnostic Quiz
          </NavLink>

          <NavLink to="/study-plan">
            <CalendarDays size={20} />
            Study Plan
          </NavLink>

          <NavLink to="/progress">
            <ChartNoAxesCombined size={20} />
            Progress
          </NavLink>

          <NavLink to="/mentor">
            <Bot size={20} />
            AI Mentor
          </NavLink>
        </nav>
      </div>

      {isAuthenticated ? (
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      ) : (
        <button className="logout-btn" onClick={() => navigate("/login")}>
          <LogOut size={20} />
          Sign In
        </button>
      )}
    </aside>
  );
}

export default Sidebar;
