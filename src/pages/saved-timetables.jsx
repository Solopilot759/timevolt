import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/sidebar";
import "../styles/dashboard.css";
import "../styles/generate.css";
import "../styles/saved-timetables.css";

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

function SavedTimetables() {

  const { timeFormat } = useSettings();

  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedId, setExpandedId] = useState(null);
  const [expandedEntries, setExpandedEntries] = useState({});
  const [expandLoading, setExpandLoading] = useState(false);

  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [actionError, setActionError] = useState("");


  // ============================================================
  // LOAD SAVED TIMETABLES
  // ============================================================

  const loadTimetables = async () => {

    try {

      setError("");

      const response = await API.get("/timetables/");

      setTimetables(response.data);

    } catch (err) {

      console.error("Saved timetables error:", err);
      setError(
        err.response?.data?.detail || "Failed to load saved timetables."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadTimetables();
  }, []);


  // ============================================================
  // VIEW / COLLAPSE ENTRIES
  // ============================================================

  const toggleExpand = async (id) => {

    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    setActionError("");

    if (expandedEntries[id]) {
      return;
    }

    setExpandLoading(true);

    try {

      const response = await API.get(`/timetables/${id}`);

      setExpandedEntries((previous) => ({
        ...previous,
        [id]: response.data.entries,
      }));

    } catch (err) {

      console.error("Load timetable detail error:", err);
      setActionError(
        err.response?.data?.detail || "Failed to load timetable details."
      );

    } finally {

      setExpandLoading(false);

    }

  };


  // ============================================================
  // SET ACTIVE
  // ============================================================

  const handleActivate = async (id) => {

    setActionError("");

    try {

      await API.patch(`/timetables/${id}/activate`);

      await loadTimetables();

    } catch (err) {

      console.error("Activate timetable error:", err);
      setActionError(
        err.response?.data?.detail || "Failed to set this timetable as active."
      );

    }

  };


  // ============================================================
  // RENAME
  // ============================================================

  const startRename = (timetable) => {
    setRenamingId(timetable.id);
    setRenameValue(timetable.name);
    setActionError("");
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const submitRename = async (id) => {

    if (!renameValue.trim()) {
      setActionError("Name cannot be empty.");
      return;
    }

    try {

      await API.patch(`/timetables/${id}`, { name: renameValue.trim() });

      setRenamingId(null);
      setRenameValue("");

      await loadTimetables();

    } catch (err) {

      console.error("Rename timetable error:", err);
      setActionError(
        err.response?.data?.detail || "Failed to rename timetable."
      );

    }

  };


  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this saved timetable?"
    );

    if (!confirmed) {
      return;
    }

    setActionError("");

    try {

      await API.delete(`/timetables/${id}`);

      if (expandedId === id) {
        setExpandedId(null);
      }

      await loadTimetables();

    } catch (err) {

      console.error("Delete timetable error:", err);
      setActionError(
        err.response?.data?.detail || "Failed to delete timetable."
      );

    }

  };


  // ============================================================
  // FORMAT DATE / TIME
  // ============================================================

  const formatSavedAt = (isoString) => {

    const date = new Date(isoString);

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  };


  // ============================================================
  // GROUP EXPANDED ENTRIES BY DAY
  // ============================================================

  const groupByDay = (entries) => {

    const grouped = {};

    entries.forEach((entry) => {

      if (!grouped[entry.day]) {
        grouped[entry.day] = [];
      }

      grouped[entry.day].push(entry);

    });

    return grouped;

  };


  // ============================================================
  // LOADING / ERROR STATES
  // ============================================================

  if (loading) {

    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <PageTransition>
            <h2>Loading your saved timetables...</h2>
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
            <h2>Unable to load saved timetables</h2>
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
          <h1>My Saved Timetables</h1>
          <p>
            View, rename, activate, or delete the timetables
            you've saved.
          </p>
        </div>

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>Saved Timetables</h2>
              <p>{timetables.length} saved</p>
            </div>

            <Link to="/generate" className="dashboard-link-button">
              Generate a new one
            </Link>
          </div>

          {actionError && (
            <p className="generate-error saved-timetables-error">
              {actionError}
            </p>
          )}

          {timetables.length === 0 ? (

            <div className="empty-state">
              <h3>No saved timetables yet</h3>
              <p>
                Generate a timetable and save it to see it appear
                here.
              </p>
              <Link to="/generate">Generate a timetable</Link>
            </div>

          ) : (

            <div className="saved-timetable-list">

              {timetables.map((item) => (

                <div className="saved-timetable-card" key={item.id}>

                  <div className="saved-timetable-header">

                    <div className="saved-timetable-title">

                      {renamingId === item.id ? (

                        <div className="rename-row">

                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) =>
                              setRenameValue(e.target.value)
                            }
                            autoFocus
                          />

                          <button
                            className="dashboard-link-button"
                            onClick={() => submitRename(item.id)}
                          >
                            Save
                          </button>

                          <button
                            className="dashboard-link-button"
                            onClick={cancelRename}
                          >
                            Cancel
                          </button>

                        </div>

                      ) : (

                        <>
                          <h3>
                            {item.name}
                            {item.is_active && (
                              <span className="active-badge">
                                Active
                              </span>
                            )}
                          </h3>

                          <p>
                            Saved {formatSavedAt(item.created_at)}
                            {" · "}
                            {item.entry_count} sessions
                          </p>
                        </>

                      )}

                    </div>

                    <div className="saved-timetable-actions">

                      <button
                        className="dashboard-link-button"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {expandedId === item.id ? "Hide" : "View"}
                      </button>

                      {renamingId !== item.id && (
                        <button
                          className="dashboard-link-button"
                          onClick={() => startRename(item)}
                        >
                          Rename
                        </button>
                      )}

                      {!item.is_active && (
                        <button
                          className="dashboard-link-button"
                          onClick={() => handleActivate(item.id)}
                        >
                          Set Active
                        </button>
                      )}

                      <button
                        className="dashboard-link-button delete-link"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                  {expandedId === item.id && (

                    <div className="saved-timetable-details">

                      {expandLoading && !expandedEntries[item.id] ? (

                        <p>Loading entries...</p>

                      ) : (

                        <div className="generated-timetable">

                          {Object.entries(
                            groupByDay(expandedEntries[item.id] || [])
                          )
                            .sort(
                              ([dayA], [dayB]) =>
                                DAY_ORDER.indexOf(dayA) -
                                DAY_ORDER.indexOf(dayB)
                            )
                            .map(([day, entries]) => (

                            <div className="timetable-day" key={day}>

                              <h3>{day}</h3>

                              {[...entries]
                                .sort((a, b) =>
                                  a.start_time.localeCompare(b.start_time)
                                )
                                .map((entry) => (

                                <div
                                  className="timetable-slot"
                                  key={entry.id}
                                >
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

                      )}

                    </div>

                  )}

                </div>

              ))}

            </div>

          )}

        </section>

        </PageTransition>

      </main>

    </div>
  );
}

export default SavedTimetables;