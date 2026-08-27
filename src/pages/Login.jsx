import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const storeToken = (token) => {
    // Write to both keys in localStorage so Axios interceptors and pages locate it instantly
    localStorage.setItem("token", token);
    localStorage.setItem("timevolt_token", token);

    // Explicitly set authorization header for immediate subsequent API calls
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    if (!rememberMe) {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("timevolt_token", token);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email: email,
        password: password,
      });

      const data = response.data;
      const accessToken = data.access_token || data.token;

      if (accessToken) {
        storeToken(accessToken);
        navigate("/dashboard", { replace: true });
      } else {
        setError("Login succeeded, but no session token was returned.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");

    try {
      const response = await API.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const data = response.data;
      const accessToken = data.access_token || data.token;

      if (accessToken) {
        storeToken(accessToken);
        navigate("/dashboard", { replace: true });
      } else {
        setError("Google authentication succeeded, but no token was returned.");
      }
    } catch (error) {
      console.error("Google authentication error:", error);
      const errorMessage =
        error.response?.data?.detail || "Google login failed.";
      setError(errorMessage);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  return (
    <div className="login-form-container">
      <div className="login-header">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to TimeVolt</p>
      </div>

      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="password-label">
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="forgot-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="remember-row">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
        </div>

        {error && <p className="login-error">{error}</p>}

        <button
          type="submit"
          className="login-button"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="divider">
        <span>OR</span>
      </div>

      <div className="google-login-container">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="100%"
        />
      </div>

      <p className="register-text">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="create-account-button"
        >
          Create an account
        </button>
      </p>
    </div>
  );
}

export default Login;