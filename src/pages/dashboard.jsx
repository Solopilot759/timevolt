import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/sidebar";
import "../styles/dashboard.css";
import "../styles/schedule.css";

import { useSettings } from "../components/settings-context";
import PageTransition from "../components/PageTransitions";
import { formatTime } from "../utils/formattime";
import API from "../services/api";

function Dashboard() {

  const { timeFormat } = useSettings();

  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [timetables, setTimetables] = useState([]);

  const [activeTimetable, setActiveTimetable] = useState(null);
  const [hasActiveTimetable, setHasActiveTimetable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });


  // ============================================================
  // LOAD DASHBOARD DATA
  // ============================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        // ------------------------------------------------------
        // GET CURRENT USER
        // ------------------------------------------------------
        const userResponse = await API.get("/auth/me");
        setUser(userResponse.data);


        // ------------------------------------------------------
        // GET COURSES / ACTIVITIES
        // ------------------------------------------------------
        const activitiesResponse = await API.get("/activities/");
        setActivities(activitiesResponse.data);


        // ------------------------------------------------------
        // GET SAVED TIMETABLES
        // ------------------------------------------------------
        const timetablesResponse = await API.get("/timetables/");
        setTimetables(timetablesResponse.data);


        // ------------------------------------------------------
        // GET ACTIVE TIMETABLE (for Today's Schedule)
        // ------------------------------------------------------
        try {
          const activeResponse = await API.get("/timetables/active");
          setActiveTimetable(activeResponse.data);
        } catch (activeErr) {
          if (activeErr.response && activeErr.response.status === 404) {
            setHasActiveTimetable(false);
          } else {
            throw activeErr; // Re-throw to catch block below if it's not a 404
          }
        }

      } catch (err) {

        console.error("Dashboard error:", err);
        setError(
          err.response?.data?.detail || "Failed to load dashboard data."
        );

      } finally {

        setLoading(false);

      }

    };

    loadDashboard();

  }, []);


  // ============================================================
  // CALCULATIONS
  // ============================================================

  const totalActivities = activities.length;

  const weeklyHours = activities.reduce(
    (total, activity) =>
      total + Number(activity.hours_per_week || 0),
    0
  );

  const recentTimetables = timetables.slice(0, 3);

  const todaysEntries = (activeTimetable?.entries || [])
    .filter((entry) => entry.day === todayName)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const scheduledMinutesToday = todaysEntries.reduce(
    (total, entry) =>
      total +
      (parseTimeToMinutes(entry.end_time) -
        parseTimeToMinutes(entry.start_time)),
    0
  );

  const freeHoursToday = Math.max(
    0,
    24 - scheduledMinutesToday / 60
  );

  const formatHours = (value) =>
    Number.isInteger(value) ? `${value}h` : `${value.toFixed(1)}h`;


  // ============================================================
  // FORMAT SAVED DATE
  // ============================================================

  const formatSavedAt = (isoString) => {

    const date = new Date(isoString);

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (
      <div className="dashboard-layout">

        <Sidebar />

        <main className="dashboard-content">

          <PageTransition>
            <h2>Loading dashboard...</h2>
          </PageTransition>

        </main>

      </div>
    );

  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (
      <div className="dashboard-layout">

        <Sidebar />

        <main className="dashboard-content">

          <PageTransition>

            <h2>Unable to load dashboard</h2>

            <p>{error}</p>

          </PageTransition>

        </main>

      </div>
    );

  }


  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-content">

        <PageTransition>


        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="dashboard-topbar">

          <div>

            <p className="dashboard-greeting">
              Welcome back, {user?.full_name}
            </p>

            <h1>
              Your Personal Time Planner
            </h1>

            <p className="dashboard-description">
              TimeVolt, Stay Organised
              Stay Efficient
            </p>

          </div>


          <div className="dashboard-date">

            <div>

              <small>
                Today
              </small>

              <strong>
                {new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* ====================================================
            STATS
        ==================================================== */}

        <section className="dashboard-stats">


          {/* COURSES / ACTIVITIES */}

          <div className="stat-card">

            <div className="stat-icon blue">
              C
            </div>

            <div>

              <span>
                Courses / Activities
              </span>

              <h2>
                {totalActivities}
              </h2>

              <small>
                Currently planned
              </small>

            </div>

          </div>


          {/* SAVED TIMETABLES */}

          <div className="stat-card">

            <div className="stat-icon purple">
              T
            </div>

            <div>

              <span>
                Saved Timetables
              </span>

              <h2>
                {timetables.length}
              </h2>

              <small>
                Available to view
              </small>

            </div>

          </div>


          {/* WEEKLY HOURS */}

          <div className="stat-card">

            <div className="stat-icon green">
              H
            </div>

            <div>

              <span>
                Planned Hours
              </span>

              <h2>
                {weeklyHours}h
              </h2>

              <small>
                Per week
              </small>

            </div>

          </div>


          {/* FREE HOURS */}

          <div className="stat-card">

            <div className="stat-icon orange">
              F
            </div>

            <div>

              <span>
                Free Hours
              </span>

              <h2>
                {hasActiveTimetable ? formatHours(freeHoursToday) : "—"}
              </h2>

              <small>
                {hasActiveTimetable
                  ? "Out of 24 hours today"
                  : "Calculated after timetable generation"}
              </small>

            </div>

          </div>

        </section>


        {/* ====================================================
            MAIN GRID
        ==================================================== */}

        <div className="dashboard-grid">


          {/* ==================================================
              TODAY'S SCHEDULE
          ================================================== */}

          <section className="dashboard-panel today-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Today's Schedule
                </h2>

                <p>
                  {hasActiveTimetable
                    ? `From "${activeTimetable?.name}"`
                    : "Your latest generated schedule"}
                </p>

              </div>

              <Link to="/schedule">
                View schedule
              </Link>

            </div>


            <div className="schedule-list">

              {!hasActiveTimetable ? (

                <div className="empty-state">

                  <h3>
                    No timetable yet
                  </h3>

                  <p>
                    Generate a timetable to see your
                    schedule here.
                  </p>

                  <Link to="/generate">
                    Generate timetable
                  </Link>

                </div>

              ) : todaysEntries.length === 0 ? (

                <div className="empty-state">

                  <h3>
                    Nothing scheduled today
                  </h3>

                  <p>
                    No sessions on {todayName.toLowerCase()} in your
                    active timetable.
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

            </div>

          </section>


          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <section className="dashboard-panel">

            <div className="panel-header">

              <div>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Manage your TimeVolt workspace
                </p>

              </div>

            </div>


            <div className="quick-actions">


              <Link
                to="/activities"
                className="quick-action"
              >

                <div className="quick-action-icon">
                  C
                </div>

                <div>

                  <h3>
                    Courses / Activities
                  </h3>

                  <p>
                    Add or manage your activities
                  </p>

                </div>

                <span>
                  →
                </span>

              </Link>


              <Link
                to="/generate"
                className="quick-action featured"
              >

                <div className="quick-action-icon">
                  G
                </div>

                <div>

                  <h3>
                    Generate Timetable
                  </h3>

                  <p>
                    Create an optimized schedule
                  </p>

                </div>

                <span>
                  →
                </span>

              </Link>


              <Link
                to="/timetables"
                className="quick-action"
              >

                <div className="quick-action-icon">
                  T
                </div>

                <div>

                  <h3>
                    My Saved Timetables
                  </h3>

                  <p>
                    View your generated timetables
                  </p>

                </div>

                <span>
                  →
                </span>

              </Link>


            </div>

          </section>

        </div>


        {/* ====================================================
            COURSES / ACTIVITIES
        ==================================================== */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                Courses / Activities
              </h2>

              <p>
                Things you currently plan to schedule
              </p>

            </div>

            <Link to="/activities">
              View all
            </Link>

          </div>


          {activities.length === 0 ? (

            <div className="empty-state">

              <h3>
                Add courses or activities
              </h3>

              <p>
                Add the things you want TimeVolt
                to organize for you.
              </p>

              <Link to="/activities">
                Add courses / activities
              </Link>

            </div>

          ) : (

            <div className="timetable-cards">

              {activities
                .slice(0, 3)
                .map((activity) => (

                  <div
                    className="timetable-card"
                    key={activity.id}
                  >

                    <div className="timetable-card-icon">
                      {activity.activity_type === "course"
                        ? "C"
                        : "A"}
                    </div>

                    <div className="timetable-card-info">

                      <h3>
                        {activity.name}
                      </h3>

                      <p>
                        {activity.hours_per_week} hours/week
                      </p>

                      <small>
                        {activity.activity_type}
                      </small>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* ====================================================
            RECENT TIMETABLES
        ==================================================== */}

        <section className="dashboard-panel">

          <div className="panel-header">

            <div>

              <h2>
                My Saved Timetables
              </h2>

              <p>
                Your generated timetable plans
              </p>

            </div>

            <Link to="/timetables">
              View all
            </Link>

          </div>


          {timetables.length === 0 ? (

            <div className="empty-state">

              <h3>
                No saved timetables
              </h3>

              <p>
                Your generated timetables will appear
                here.
              </p>

              <Link to="/generate">
                Generate your first timetable
              </Link>

            </div>

          ) : (

            <div className="timetable-cards">

              {recentTimetables.map((timetable) => (

                <Link
                  className="timetable-card"
                  key={timetable.id}
                  to="/timetables"
                >

                  <div className="timetable-card-icon">
                    T
                  </div>

                  <div className="timetable-card-info">

                    <h3>
                      {timetable.name}
                      {timetable.is_active && " · Active"}
                    </h3>

                    <p>
                      {timetable.entry_count} sessions
                    </p>

                    <small>
                      Saved {formatSavedAt(timetable.created_at)}
                    </small>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>

        </PageTransition>

      </main>

    </div>
  );
}

export default Dashboard;