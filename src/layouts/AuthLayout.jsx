import { Outlet } from "react-router-dom";
import timevoltLogo from "../assets/images/timevolt.png";
import "../styles/authLayout.css";

function AuthLayout() {
  return (
    <div className="auth-container">
      {/* LEFT SIDE */}
      <div className="auth-left">
        {/* Background image overlay */}
        <div className="auth-background-image"></div>

        <div className="auth-left-content">
          <img
            src={timevoltLogo}
            alt="TimeVolt Logo"
            className="logo"
          />

          <h1>TimeVolt</h1>

          <h2>
            Smart Timetable
            <br />
            Management System
          </h2>

          <p>
            Generate conflict-free timetables faster,
            manage classes, work, or workouts effortlessly,
            and simplify planning for every part of your life.
          </p>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">
                <span>01</span>
              </div>

              <div>
                <h3>Automated Timetable Generation</h3>
                <p>
                  Generate optimized timetables without
                  unnecessary conflicts.
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <span>02</span>
              </div>

              <div>
                <h3>Smart scheduling for everyone</h3>
                <p>
                 Your time, Organized
                </p>
              </div>
            </div>

            <div className="feature">
              <div className="feature-icon">
                <span>03</span>
              </div>

              <div>
                <h3>Built for real-world use</h3>
                <p>
                  One planner,
                  Every part of your week.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
          <Outlet />
        </div>
      </div>
    
  );
}

export default AuthLayout;