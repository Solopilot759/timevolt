import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/sidebar";
import "../styles/dashboard.css";
import "../styles/generate.css";
import "../styles/schedule.css";

import { useSettings } from "../components/settings-context";
import PageTransition from "../components/PageTransitions";
import { formatTime } from "../utils/formattime";
import API from "../services/api";

function MySchedule() {

  const { timeFormat } = useSettings();

  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasActive, setHasActive] = useState(true);

  const today = new Date();

  const todayName = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const todayLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });


  // ============================================================
  // LOAD ACTIVE TIMETABLE
  // ============================================================

  useEffect(() => {

    const loadActiveTimetable = async () => {

      try {

        const response = await API.get("/timetables/active");
        setTimetable(response.data);

      } catch (err) {

        if (err.response && err.response.status === 404) {
          setHasActive(false);
        } else {
          console.error("My Schedule error:", err);
          setError(
            err.response?.data?.detail || "Failed to load your schedule."
          );
        }

      } finally {

        setLoading(false);

      }

    };

    loadActiveTimetable();

  }, []);


  // ============================================================
  // TODAY'S ENTRIES
  // ============================================================

  const todaysEntries = (timetable?.entries || [])
    .filter((entry) => entry.day === todayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));


  // ============================================================
  // LOADING / ERROR
  // ============================================================

  if (loading) {

    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <PageTransition>
            <h2>Loading your schedule...</h2>
          </PageTransition>
        </main>
      </div>
    );

  }

  if (error) {

    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <PageTransition>
            <h2>Unable to load your schedule</h2>
            <p>{error}</p>
          </PageTransition>
        </main>
      </div>
    );

  }


  // ============================================================
  // MAIN RENDER
  // ============================================================

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-content">

        <PageTransition>

        <div className="generate-header schedule-header">

          <div>
            <h1>My Schedule</h1>
            <p>{todayLabel}</p>
          </div>

        </div>

        <section className="dashboard-panel">

          {!hasActive ? (

            <div className="empty-state">
              <h3>No active timetable</h3>
              <p>
                Generate a timetable and save it, or activate one
                from your saved timetables, to see today's schedule
                here.
              </p>
              <Link to="/generate">Generate a timetable</Link>
            </div>

          ) : (

            <>

              <div className="panel-header">
                <div>
                  <h2>{todayName}</h2>
                  <p>From "{timetable.name}"</p>
                </div>

                <Link to="/timetables" className="dashboard-link-button">
                  View full week
                </Link>
              </div>

              {todaysEntries.length === 0 ? (

                <div className="empty-state">
                  <h3>Nothing scheduled today</h3>
                  <p>
                    Your active timetable doesn't have any sessions
                    on {todayName.toLowerCase()}. Enjoy the free time.
                  </p>
                </div>

              ) : (

                <div className="today-slot-list">

                  {todaysEntries.map((entry) => (

                    <div className="today-slot" key={entry.id}>

                      <div className="today-slot-time">
                        <strong>{formatTime(entry.start_time, timeFormat)}</strong>
                        <span>{formatTime(entry.end_time, timeFormat)}</span>
                      </div>

                      <div className="today-slot-line" />

                      <div className="today-slot-info">
                        <h3>{entry.activity_name}</h3>
                        <p>
                          {entry.activity_type === "course"
                            ? "Course"
                            : "Activity"}
                        </p>
                      </div>

                    </div>

                  ))}

                </div>

              )}

            </>

          )}

        </section>

        </PageTransition>

      </main>

    </div>
  );
}

export default MySchedule;