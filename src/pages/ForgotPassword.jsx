import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/forgot-password", { email });

      setSuccess("Reset link sent! Please check your email inbox.");

      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);

    } catch (err) {
      console.error("Forgot password error:", err);

      const errorMessage =
        err.response?.data?.detail ||
        "Unable to process request. Make sure the backend is running.";

      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-form-container">

      <div className="forgot-header">
        <div className="forgot-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="48px"
            height="48px"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        </div>

        <h1>Forgot your password?</h1>

        <p>
          Enter the email address associated with your
          TimeVolt account and we'll send you a reset link.
        </p>
      </div>

      <form
        className="forgot-form"
        onSubmit={handleSubmit}
      >

        <div className="form-group">
          <label htmlFor="forgot-email">
            Email Address
          </label>

          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          className="forgot-button"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;