
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");

    // Check passwords
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }


    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Registration successful:", response.data);

      // Move to email verification
      navigate("/verify-email", {
        state: {
          email: formData.email,
        },
      });

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

  return (
    <div className="register-form-container">

      <div className="register-header">
        <h1>Create your account</h1>

        <p>
          Join TimeVolt and simplify your academic scheduling.
        </p>
      </div>

      <form
        className="register-form"
        onSubmit={handleRegister}
      >

        {/* FULL NAME */}

        <div className="form-group">

          <label htmlFor="fullName">
            Full Name
          </label>

          <input
            id="fullName"
            name="full_name"
            type="text"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />

        </div>


        {/* EMAIL */}

        <div className="form-group">

          <label htmlFor="email">
            Email Address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

        </div>


        {/* PASSWORD */}

        <div className="form-group">

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            minLength={8}
            required
          />

          <small className="password-hint">
            Password must be at least 8 characters.
          </small>

        </div>


        {/* CONFIRM PASSWORD */}

        <div className="form-group">

          <label htmlFor="confirmPassword">
            Confirm Password
          </label>

          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            minLength={8}
            required
          />

        </div>

        {/* ERROR */}

        {error && (
          <p className="register-error">
            {error}
          </p>
        )}


        {/* BUTTON */}

        <button
          type="submit"
          className="register-button"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

      </form>


      {/* LOGIN */}

      <p className="login-text">

        Already have an account?

        <button
          type="button"
          onClick={() => navigate("/")}
        >
          Sign in
        </button>

      </p>

    </div>
  );
}

export default Register;