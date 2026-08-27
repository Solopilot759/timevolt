import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [code, setCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  // VERIFY EMAIL
  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/verify-email", {
        email: email,
        code: verificationCode,
      });

      const data = response.data;
      const accessToken = data.access_token || data.token;

      if (accessToken) {
        // Save token immediately to both keys
        localStorage.setItem("token", accessToken);
        localStorage.setItem("timevolt_token", accessToken);

        // Attach default header for active session requests
        API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        setSuccess("Email verified successfully! Redirecting to dashboard...");

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1200);
      } else {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to connect to TimeVolt. Make sure the backend is running.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // RESEND VERIFICATION CODE
  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email address is missing. Please register again.");
      return;
    }

    if (resendCooldown > 0) {
      return;
    }

    setResendLoading(true);

    try {
      await API.post(
        `/auth/resend-verification?email=${encodeURIComponent(email)}`
      );

      setSuccess("A new verification code has been sent to your email.");

      // Start 60-second cooldown
      setResendCooldown(60);

      const timer = setInterval(() => {
        setResendCooldown((previous) => {
          if (previous <= 1) {
            clearInterval(timer);
            return 0;
          }
          return previous - 1;
        });
      }, 1000);
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.detail ||
        "Unable to connect to TimeVolt. Make sure the backend is running.";
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verify-form-container">
      <div className="verify-header">
        <div className="verify-icon">✉</div>
        <h1>Verify your email</h1>
        <p>
          We've sent a 6-digit verification code to your email address.
        </p>
        {email && <p className="verify-email-address">{email}</p>}
      </div>

      <form onSubmit={handleVerify}>
        <div className="otp-container">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="otp-input"
            />
          ))}
        </div>

        {error && <p className="verify-error">{error}</p>}
        {success && <p className="verify-success">{success}</p>}

        <button
          type="submit"
          className="verify-button"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <div className="resend-section">
        <p>Didn't receive the code?</p>
        <button
          type="button"
          className="resend-button"
          onClick={handleResend}
          disabled={resendLoading || resendCooldown > 0}
        >
          {resendLoading
            ? "Sending..."
            : resendCooldown > 0
            ? `Resend code (${resendCooldown}s)`
            : "Resend code"}
        </button>
      </div>

      <button
        type="button"
        className="back-login-button"
        onClick={() => navigate("/login")}
      >
        ← Back to login
      </button>
    </div>
  );
}

export default VerifyEmail;