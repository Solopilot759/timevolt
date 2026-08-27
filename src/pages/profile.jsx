import { useEffect, useState } from "react";

import Sidebar from "../components/sidebar";
import "../styles/dashboard.css";
import "../styles/profile.css";

import PageTransition from "../components/PageTransitions";
import API from "../services/api";

function Profile() {

  const [loginEmail, setLoginEmail] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const [fullName, setFullName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");


  // ============================================================
  // LOAD PROFILE
  // ============================================================

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const response = await API.get("/users/me");
        const data = response.data;

        setFullName(data.full_name);
        setLoginEmail(data.email);
        setIsVerified(data.is_verified);
        setContactEmail(data.contact_email || "");
        setPhoneNumber(data.phone_number || "");

      } catch (err) {

        console.error("Profile load error:", err);
        setError(
          err.response?.data?.detail || "Failed to load your profile."
        );

      } finally {

        setLoading(false);

      }

    };

    loadProfile();

  }, []);


  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const handleSaveProfile = async (e) => {

    e.preventDefault();

    setSaveError("");
    setSaveSuccess("");

    if (!fullName.trim()) {
      setSaveError("Name cannot be empty.");
      return;
    }

    setSaving(true);

    try {

      const response = await API.patch("/users/me", {
        full_name: fullName.trim(),
        contact_email: contactEmail.trim(),
        phone_number: phoneNumber.trim(),
      });

      const data = response.data;

      setFullName(data.full_name);
      setContactEmail(data.contact_email || "");
      setPhoneNumber(data.phone_number || "");

      setSaveSuccess("Profile updated successfully.");

    } catch (err) {

      console.error("Save profile error:", err);
      setSaveError(
        err.response?.data?.detail || "Failed to update profile."
      );

    } finally {

      setSaving(false);

    }

  };


  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword = async (e) => {

    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all three password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);

    try {

      await API.patch("/users/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err) {

      console.error("Change password error:", err);
      setPasswordError(
        err.response?.data?.detail || "Failed to change password."
      );

    } finally {

      setChangingPassword(false);

    }

  };


  // ============================================================
  // LOADING / ERROR
  // ============================================================

  if (loading) {

    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          <PageTransition>
            <h2>Loading your profile...</h2>
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
            <h2>Unable to load profile</h2>
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
          <h1>Profile</h1>
          <p>Manage your personal details and account security.</p>
        </div>


        {/* ==================================================
            BASIC INFO
        ================================================== */}

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>Basic Information</h2>
              <p>
                Your login email can't be changed here — everything
                else is up to you.
              </p>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSaveProfile}>

            <div className="profile-field">
              <label htmlFor="login-email">Login email</label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                disabled
              />
              {isVerified && (
                <span className="verified-badge">Verified</span>
              )}
            </div>

            <div className="profile-field">
              <label htmlFor="full-name">Full name</label>
              <input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="contact-email">Contact email</label>
              <input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. you@gmail.com"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="phone-number">Phone number</label>
              <input
                id="phone-number"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +234 800 000 0000"
              />
            </div>

            {saveError && (
              <p className="generate-error">{saveError}</p>
            )}

            {saveSuccess && (
              <p className="profile-success">{saveSuccess}</p>
            )}

            <button
              type="submit"
              className="dashboard-primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

          </form>

        </section>


        {/* ==================================================
            CHANGE PASSWORD
        ================================================== */}

        <section className="dashboard-panel">

          <div className="panel-header">
            <div>
              <h2>Change Password</h2>
              <p>Update the password you use to sign in</p>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleChangePassword}>

            <div className="profile-field">
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {passwordError && (
              <p className="generate-error">{passwordError}</p>
            )}

            {passwordSuccess && (
              <p className="profile-success">{passwordSuccess}</p>
            )}

            <button
              type="submit"
              className="dashboard-primary-button"
              disabled={changingPassword}
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>

          </form>

        </section>

        </PageTransition>

      </main>

    </div>
  );
}

export default Profile;