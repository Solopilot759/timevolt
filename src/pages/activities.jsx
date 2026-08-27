import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../components/sidebar";
import "../styles/activities.css";

import PageTransition from "../components/PageTransitions";
import API from "../services/api";

function Activities() {
  const [activities, setActivities] = useState([]);

  const [name, setName] = useState("");
  const [activityType, setActivityType] = useState("course");
  const [hoursPerWeek, setHoursPerWeek] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ============================================================
  // LOAD ACTIVITIES
  // ============================================================

  const loadActivities = async () => {
    try {
      setError("");

      const response = await API.get("/activities/");

      setActivities(response.data);
    } catch (error) {
      console.error("Activities error:", error);
      setError(
        error.response?.data?.detail || "Failed to load courses and activities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // ============================================================
  // ADD ACTIVITY
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter a course or activity name.");
      return;
    }

    if (!hoursPerWeek || Number(hoursPerWeek) <= 0) {
      setError("Please enter valid weekly hours.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.post("/activities/", {
        name: name.trim(),
        activity_type: activityType,
        hours_per_week: Number(hoursPerWeek),
      });

      setActivities((current) => [
        response.data,
        ...current,
      ]);

      setName("");
      setActivityType("course");
      setHoursPerWeek("");

      setSuccess("Course or activity added successfully.");
    } catch (error) {
      console.error("Create activity error:", error);
      setError(
        error.response?.data?.detail || "Failed to add course or activity."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE ACTIVITY
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course or activity?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await API.delete(`/activities/${id}`);

      setActivities((current) =>
        current.filter(
          (activity) => activity.id !== id
        )
      );

      setSuccess("Course or activity deleted successfully.");
    } catch (error) {
      console.error("Delete activity error:", error);
      setError(
        error.response?.data?.detail || "Failed to delete course or activity."
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="activities-layout">
        <Sidebar />

        <main className="activities-content">
          <PageTransition>
            <h2>Loading courses and activities...</h2>
          </PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div className="activities-layout">

      <Sidebar />

      <main className="activities-content">

        <PageTransition>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="activities-header">

          <div>
            <p className="activities-label">
              PLANNER
            </p>

            <h1>
              Courses / Activities
            </h1>

            <p>
              Add the courses or activities you want
              TimeVolt to organize for you.
            </p>
          </div>

          <Link
            to="/generate"
            className="generate-link"
          >
            Generate timetable
          </Link>

        </div>


        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {error && (
          <div className="activity-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="activity-message success">
            {success}
          </div>
        )}


        {/* ====================================================
            ADD FORM
        ==================================================== */}

        <section className="activity-panel">

          <div className="panel-header">

            <div>
              <h2>
                Add Course or Activity
              </h2>

              <p>
                Tell TimeVolt what you need to schedule.
              </p>
            </div>

          </div>


          <form
            className="activity-form"
            onSubmit={handleSubmit}
          >

            <div className="form-field">

              <label htmlFor="activity-name">
                Name
              </label>

              <input
                id="activity-name"
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. Mathematics or Gym"
              />

            </div>


            <div className="form-field">

              <label htmlFor="activity-type">
                Type
              </label>

              <select
                id="activity-type"
                value={activityType}
                onChange={(e) =>
                  setActivityType(e.target.value)
                }
              >
                <option value="course">
                  Course
                </option>

                <option value="activity">
                  Activity
                </option>
              </select>

            </div>


            <div className="form-field">

              <label htmlFor="hours">
                Hours per week
              </label>

              <input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={hoursPerWeek}
                onChange={(e) =>
                  setHoursPerWeek(e.target.value)
                }
                placeholder="e.g. 4"
              />

            </div>


            <button
              type="submit"
              className="add-activity-button"
              disabled={saving}
            >
              {saving
                ? "Adding..."
                : "Add course / activity"}
            </button>

          </form>

        </section>


        {/* ====================================================
            LIST
        ==================================================== */}

        <section className="activity-panel">

          <div className="panel-header">

            <div>
              <h2>
                Your Courses / Activities
              </h2>

              <p>
                {activities.length} currently planned
              </p>
            </div>

          </div>


          {activities.length === 0 ? (

            <div className="activity-empty">

              <h3>
                Nothing planned yet
              </h3>

              <p>
                Add your first course or activity
                above and it will appear here.
              </p>

            </div>

          ) : (

            <div className="activity-list">

              {activities.map((activity) => (

                <div
                  className="activity-row"
                  key={activity.id}
                >

                  <div className="activity-type-mark">
                    {activity.activity_type === "course"
                      ? "C"
                      : "A"}
                  </div>


                  <div className="activity-details">

                    <h3>
                      {activity.name}
                    </h3>

                    <p>
                      {activity.activity_type === "course"
                        ? "Course"
                        : "Activity"}
                    </p>

                  </div>


                  <div className="activity-hours">

                    <strong>
                      {activity.hours_per_week}
                    </strong>

                    <span>
                      hours/week
                    </span>

                  </div>


                  <button
                    type="button"
                    className="delete-activity"
                    onClick={() =>
                      handleDelete(activity.id)
                    }
                  >
                    Delete
                  </button>

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

export default Activities;