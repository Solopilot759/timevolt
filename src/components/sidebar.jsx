import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import timevoltLogo from "../assets/images/timevolt.png";

function Sidebar() {
  const navigate = useNavigate();

  // Controls the off-canvas sidebar on mobile screens.
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("timevolt_token");
    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("timevolt_token");
    sessionStorage.removeItem("isAuthenticated");

    navigate("/");
  };

  return (
    <>
      {/* ================= MOBILE MENU BUTTON ================= */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* ================= MOBILE BACKDROP ================= */}
      {isOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* ================= LOGO ================= */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <img src={timevoltLogo} alt="TimeVolt logo" />
          </div>

          <div>
            <h2>TimeVolt</h2>
            <p>Personal Time Planner</p>
          </div>

          <button
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="sidebar-nav">
          {/* MAIN */}
          <p className="section-title">MAIN</p>

          <NavLink
            to="/dashboard"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">D</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/generate"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">GT</span>
            <span>Generate Timetable</span>
          </NavLink>

          {/* PLANNER */}
          <p className="section-title">PLANNER</p>

          <NavLink
            to="/activities"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">C</span>
            <span>Courses / Activity</span>
          </NavLink>

          <NavLink
            to="/schedule"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">S</span>
            <span>My Schedule</span>
          </NavLink>

          <NavLink
            to="/timetables"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">ST</span>
            <span>My Saved Timetables</span>
          </NavLink>

          {/* ACCOUNT */}
          <p className="section-title">ACCOUNT</p>

          <NavLink
            to="/profile"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">P</span>
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={closeSidebar}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">S</span>
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* ================= LOGOUT ================= */}
        <div className="sidebar-bottom">
          <button
            className="nav-link logout"
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
          >
            <span className="nav-icon">L</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

    </>
  );
}

export default Sidebar;