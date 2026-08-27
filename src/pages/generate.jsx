import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";

import Sidebar from "../components/sidebar";
import "../styles/dashboard.css";
import "../styles/generate.css";

import { useSettings } from "../components/settings-context";
import PageTransition from "../components/PageTransitions";
import { formatTime } from "../utils/formattime";
import API from "../services/api";

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function GenerateTimetable() {

  const { timeFormat, defaultSessionLength } = useSettings();

  const [activities, setActivities] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sessionLengths, setSessionLengths] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [timetable, setTimetable] = useState(null);
  const [unscheduled, setUnscheduled] = useState([]);

  const [timetableName, setTimetableName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);


  // ============================================================
  // LOAD ACTIVITIES
  // ============================================================

  useEffect(() => {

    const loadActivities = async () => {

      try {

        const response = await API.get("/activities/");
        setActivities(response.data);

      } catch (err) {

        console.error("Generate timetable error:", err);
        setError(
          err.response?.data?.detail || "Failed to load courses and activities."
        );

      } finally {

        setLoading(false);

      }

    };

    loadActivities();

  }, []);


  // ============================================================
  // SELECTION HANDLING
  // ============================================================

  const toggleActivity = (id) => {

    setSelectedIds((previous) => {

      const updated = new Set(previous);

      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);

        // Seed a sensible default session length the first time
        // an activity is selected, without overwriting a value
        // the user already typed in.
        setSessionLengths((prevLengths) => {
          if (prevLengths[id] !== undefined) {
            return prevLengths;
          }
          return { ...prevLengths, [id]: defaultSessionLength };
        });
      }

      return updated;

    });

  };

  const updateSessionLength = (id, value) => {

    setSessionLengths((previous) => ({
      ...previous,
      [id]: value,
    }));

  };

  const selectedActivities = activities.filter((activity) =>
    selectedIds.has(activity.id)
  );

  const totalHours = selectedActivities.reduce(
    (total, activity) => total + Number(activity.hours_per_week || 0),
    0
  );


  // ============================================================
  // GENERATE TIMETABLE
  // ============================================================

  const handleGenerate = async () => {

    if (selectedIds.size === 0) {
      setGenerateError("Select at least one course or activity first.");
      return;
    }

    setGenerating(true);
    setGenerateError("");

    try {

      const payload = {
        activities: Array.from(selectedIds).map((id) => ({
          activity_id: id,
          session_length_hours:
            Number(sessionLengths[id]) || defaultSessionLength,
        })),
      };

      const response = await API.post("/timetable/generate", payload);

      const data = response.data;

      setTimetable(data.entries);
      setUnscheduled(data.unscheduled || []);

      // Reset any previous save state, since this is a fresh result
      setSaved(false);
      setSaveError("");
      setTimetableName("");

    } catch (err) {

      console.error("Generate timetable error:", err);
      setGenerateError(
        err.response?.data?.detail || "Failed to generate timetable."
      );

    } finally {

      setGenerating(false);

    }

  };


  // ============================================================
  // SAVE TIMETABLE
  // ============================================================

  const handleSave = async () => {

    if (!timetableName.trim()) {
      setSaveError("Give this timetable a name before saving.");
      return;
    }

    setSaving(true);
    setSaveError("");

    try {

      await API.post("/timetables/", {
        name: timetableName.trim(),
        entries: timetable,
      });

      setSaved(true);

    } catch (err) {

      console.error("Save timetable error:", err);
      setSaveError(
        err.response?.data?.detail || "Failed to save timetable."
      );

    } finally {

      setSaving(false);

    }

  };

  // ============================================================
  // EXPORT TIMETABLE AS PDF
  // ============================================================

  const handleExportPDF = () => {
    if (!timetable || timetable.length === 0) {
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("TimeVolt", 20, 20);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(timetableName.trim() || "Generated Timetable", 20, 30);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 38);

    const startY = 50;
    const dayColumnWidth = 40;
    const timeColumnWidth = 35;
    const activityColumnWidth = 95;

    let y = startY;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.rect(15, y, dayColumnWidth, 10);
    doc.rect(15 + dayColumnWidth, y, timeColumnWidth, 10);
    doc.rect(
      15 + dayColumnWidth + timeColumnWidth,
      y,
      activityColumnWidth,
      10
    );

    doc.text("Day", 18, y + 7);
    doc.text("Time", 18 + dayColumnWidth, y + 7);
    doc.text(
      "Course / Activity",
      18 + dayColumnWidth + timeColumnWidth,
      y + 7
    );

    y += 10;

    doc.setFont("helvetica", "normal");

    const sortedEntries = [...timetable].sort((a, b) => {
      const dayDifference =
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);

      if (dayDifference !== 0) {
        return dayDifference;
      }

      return a.start_time.localeCompare(b.start_time);
    });

    sortedEntries.forEach((entry) => {
      if (y > 275) {
        doc.addPage();
        y = 20;

        doc.setFont("helvetica", "bold");
        doc.text("TimeVolt — Timetable", 15, y);
        y += 10;

        doc.rect(15, y, dayColumnWidth, 10);
        doc.rect(15 + dayColumnWidth, y, timeColumnWidth, 10);
        doc.rect(
          15 + dayColumnWidth + timeColumnWidth,
          y,
          activityColumnWidth,
          10
        );

        doc.text("Day", 18, y + 7);
        doc.text("Time", 18 + dayColumnWidth, y + 7);
        doc.text(
          "Course / Activity",
          18 + dayColumnWidth + timeColumnWidth,
          y + 7
        );

        y += 10;
        doc.setFont("helvetica", "normal");
      }

      const timeText =
        `${formatTime(entry.start_time, timeFormat)} - ` +
        `${formatTime(entry.end_time, timeFormat)}`;

      doc.rect(15, y, dayColumnWidth, 10);
      doc.rect(15 + dayColumnWidth, y, timeColumnWidth, 10);
      doc.rect(
        15 + dayColumnWidth + timeColumnWidth,
        y,
        activityColumnWidth,
        10
      );

      doc.text(entry.day, 18, y + 7);
      doc.text(timeText, 18 + dayColumnWidth, y + 7);
      doc.text(
        entry.activity_name,
        18 + dayColumnWidth + timeColumnWidth,
        y + 7
      );

      y += 10;
    });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by TimeVolt — gettimevolt.com", pageWidth / 2, 290, {
      align: "center",
    });

    const filename = `${timetableName.trim() || "TimeVolt-Timetable"}`
      .replace(/[^a-z0-9-_ ]/gi, "")
      .replace(/\s+/g, "-");

    doc.save(`${filename}.pdf`);
  };


  // ============================================================
  // GROUP GENERATED ENTRIES BY DAY
  // ============================================================

  const entriesByDay = {};

  if (timetable) {

    timetable.forEach((entry) => {

      if (!entriesByDay[entry.day]) {
        entriesByDay[entry.day] = [];
      }

      entriesByDay[entry.day].push(entry);

    });

  }


  // ============================================================
  // LOADING / ERROR STATES
  // ============================================================

  if (loading) {

    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <PageTransition>
            <h2>Loading your activities...</h2>
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
            <h2>Unable to load activities</h2>
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

        <div className="generate-header">
          <h1>Generate Timetable</h1>
          <p>
            Create a schedule around your activities. Select the
            courses or activities you want TimeVolt to arrange, and
            set how long each session should be.
          </p>
        </div>


        {/* ==================================================
            SELECTION VIEW
        ================================================== */}

        {!timetable && (

          <section className="dashboard-panel">

            <div className="panel-header">
              <div>
                <h2>Your Courses / Activities</h2>
                <p>Choose what you want scheduled</p>
              </div>
            </div>

            {activities.length === 0 ? (

              <div className="empty-state">
                <h3>No courses or activities yet</h3>
                <p>
                  Add courses or activities first so TimeVolt has
                  something to schedule.
                </p>
              </div>

            ) : (

              <div className="activity-select-list">

                {activities.map((activity) => {

                  const isSelected = selectedIds.has(activity.id);

                  return (

                    <div
                      className={
                        isSelected
                          ? "activity-select-item selected"
                          : "activity-select-item"
                      }
                      key={activity.id}
                    >

                      <label className="activity-select-checkbox">

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleActivity(activity.id)}
                        />

                        <div className="activity-select-info">
                          <h3>{activity.name}</h3>
                          <p>
                            {activity.activity_type === "course"
                              ? "Course"
                              : "Activity"}
                            {" · "}
                            {activity.hours_per_week} hours/week
                          </p>
                        </div>

                      </label>

                      {isSelected && (

                        <div className="session-length-input">
                          <label htmlFor={`session-${activity.id}`}>
                            Session length (hrs)
                          </label>
                          <input
                            id={`session-${activity.id}`}
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={
                              sessionLengths[activity.id] ??
                              defaultSessionLength
                            }
                            onChange={(e) =>
                              updateSessionLength(
                                activity.id,
                                e.target.value
                              )
                            }
                          />
                        </div>

                      )}

                    </div>

                  );

                })}

              </div>

            )}

            <div className="generate-summary">

              <div>
                <strong>{selectedIds.size}</strong> selected
                <span className="generate-summary-divider">·</span>
                <strong>{totalHours}h</strong> planned per week
              </div>

              {generateError && (
                <p className="generate-error">{generateError}</p>
              )}

              <button
                className="dashboard-primary-button"
                onClick={handleGenerate}
                disabled={generating || selectedIds.size === 0}
              >
                {generating ? "Generating..." : "Generate Timetable"}
              </button>

            </div>

          </section>

        )}


        {/* ==================================================
            GENERATED TIMETABLE VIEW
        ================================================== */}

        {timetable && (

          <section className="dashboard-panel">

            <div className="panel-header">
              <div>
                <h2>Your Generated Timetable</h2>
                <p>Here's how your week looks</p>
              </div>

              <button
                className="dashboard-link-button"
                onClick={() => setTimetable(null)}
              >
                Edit selection
              </button>
            </div>

            {unscheduled.length > 0 && (

              <div className="unscheduled-warning">

                <h3>Couldn't fully fit everything in</h3>

                <ul>
                  {unscheduled.map((item) => (
                    <li key={item.activity_id}>
                      {item.activity_name} — {item.remaining_hours}h
                      still unscheduled
                    </li>
                  ))}
                </ul>

              </div>

            )}

            {Object.keys(entriesByDay).length === 0 ? (

              <div className="empty-state">
                <h3>No timetable generated</h3>
                <p>Something went wrong — try generating again.</p>
              </div>

            ) : (

              <>

                <div className="generated-timetable">

                  {Object.entries(entriesByDay)
                    .sort(
                      ([dayA], [dayB]) =>
                        DAY_ORDER.indexOf(dayA) - DAY_ORDER.indexOf(dayB)
                    )
                    .map(([day, entries]) => (

                    <div className="timetable-day" key={day}>

                      <h3>{day}</h3>

                      {[...entries]
                        .sort((a, b) =>
                          a.start_time.localeCompare(b.start_time)
                        )
                        .map((entry, index) => (

                        <div className="timetable-slot" key={index}>
                          <span className="timetable-slot-time">
                            {formatTime(entry.start_time, timeFormat)} -{" "}
                            {formatTime(entry.end_time, timeFormat)}
                          </span>
                          <span className="timetable-slot-name">
                            {entry.activity_name}
                          </span>
                        </div>

                      ))}

                    </div>

                  ))}

                </div>


                {/* ============================================
                    SAVE TIMETABLE
                ============================================ */}

                <div className="save-timetable-bar">
                  {saved ? (
                    <div className="save-success">
                      <p>Timetable saved successfully.</p>
                      <Link to="/timetables" className="dashboard-link-button">
                        View saved timetables
                      </Link>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Name this timetable (e.g. Semester 1)"
                        value={timetableName}
                        onChange={(e) => setTimetableName(e.target.value)}
                      />

                      <button
                        className="dashboard-primary-button"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Timetable"}
                      </button>

                      <button
                        className="dashboard-primary-button"
                        onClick={handleExportPDF}
                        disabled={!timetable || timetable.length === 0}
                      >
                        Export PDF
                      </button>
                    </>
                  )}

                  {saveError && (
                    <p className="generate-error">{saveError}</p>
                  )}
                </div>

              </>

            )}

          </section>

        )}

        </PageTransition>

      </main>

    </div>
  );
}

export default GenerateTimetable;