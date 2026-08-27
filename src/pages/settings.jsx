import Sidebar from "../components/sidebar";
import "../styles/dashboard.css";
import "../styles/settings.css";

import { useSettings } from "../components/settings-context";
import PageTransition from "../components/PageTransitions";

function Settings() {

  const {
    theme,
    setTheme,
    timeFormat,
    setTimeFormat,
    defaultSessionLength,
    setDefaultSessionLength,
  } = useSettings();

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-content">

        <PageTransition>

        <div className="generate-header">
          <h1>Settings</h1>
          <p>Customize how TimeVolt looks and behaves for you.</p>
        </div>


        {/* ==================================================
            APPEARANCE
        ================================================== */}

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>Appearance</h2>
              <p>Choose how TimeVolt looks on this device</p>
            </div>
          </div>

          <div className="settings-row">

            <div className="settings-row-info">
              <h3>Theme</h3>
              <p>Switch between light and dark mode</p>
            </div>

            <div className="segmented-control">

              <button
                className={
                  theme === "light" ? "segment active" : "segment"
                }
                onClick={() => setTheme("light")}
              >
                Light
              </button>

              <button
                className={
                  theme === "dark" ? "segment active" : "segment"
                }
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>

            </div>

          </div>

        </section>


        {/* ==================================================
            TIME FORMAT
        ================================================== */}

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>Time Format</h2>
              <p>Choose how times are displayed across TimeVolt</p>
            </div>
          </div>

          <div className="settings-row">

            <div className="settings-row-info">
              <h3>Clock format</h3>
              <p>Applies to your schedule and saved timetables</p>
            </div>

            <div className="segmented-control">

              <button
                className={
                  timeFormat === "12" ? "segment active" : "segment"
                }
                onClick={() => setTimeFormat("12")}
              >
                12-hour
              </button>

              <button
                className={
                  timeFormat === "24" ? "segment active" : "segment"
                }
                onClick={() => setTimeFormat("24")}
              >
                24-hour
              </button>

            </div>

          </div>

        </section>


        {/* ==================================================
            SCHEDULING DEFAULTS
        ================================================== */}

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>Scheduling Defaults</h2>
              <p>Applied automatically on the Generate Timetable page</p>
            </div>
          </div>

          <div className="settings-row">

            <div className="settings-row-info">
              <h3>Default session length</h3>
              <p>
                Starting session length (hours) when you select an
                activity to schedule
              </p>
            </div>

            <input
              type="number"
              min="0.5"
              step="0.5"
              value={defaultSessionLength}
              onChange={(e) =>
                setDefaultSessionLength(Number(e.target.value) || 0.5)
              }
              className="settings-number-input"
            />

          </div>

        </section>

        </PageTransition>

      </main>

    </div>
  );
}

export default Settings;