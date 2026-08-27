import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token/email from navigation state or URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const email = location.state?.email || searchParams.get("email") || "";
  const token = location.state?.token || searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token || !email) {
      setError("Reset token or email is missing. Please request a new link.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/reset-password", {
        email: email,
        token: token,
        new_password: newPassword,
      });

      setSuccess("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err.response?.data?.detail || "Failed to reset password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-form-container">

      <div className="reset-header">
        <div className="reset-icon">
          🔒
        </div>

        <h1>Reset your password</h1>

        <p>
          Create a new password for your TimeVolt account.
        </p>
      </div>

      <form
        className="reset-form"
        onSubmit={handleReset}
      >

        <div className="form-group">
          <label htmlFor="new-password">
            New Password
          </label>

          <input
            id="new-password"
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirm-new-password">
            Confirm New Password
          </label>

          <input
            id="confirm-new-password"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="verify-error">
            {error}
          </p>
        )}

        {success && (
          <p className="verify-success">
            {success}
          </p>
        )}

        <button
          type="submit"
          className="reset-button"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

      </form>

      <button
        type="button"
        className="back-login-button"
        onClick={() => navigate("/")}
      >
        ← Back to login
      </button>

    </div>
  );
}

export default ResetPassword;