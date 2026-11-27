import { Bell, Search } from "lucide-react";
import { getStoredUser } from "../api/client";

function Topbar({ title, subtitle }) {
  const user = getStoredUser();
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "T";

  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search anything..." />
        </div>

        <button className="notification-btn" type="button" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className="profile-avatar" title={user?.name || "Student"}>
          {initial}
        </div>
      </div>
    </div>
  );
}

export default Topbar;
