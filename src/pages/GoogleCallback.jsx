import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

function GoogleCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");

    useEffect(() => {
        const processGoogleCallback = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get("code");
            const token = searchParams.get("token") || searchParams.get("access_token");

            // 1. Direct Token handling from URL parameter
            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("timevolt_token", token); // Secondary fallback
                navigate("/dashboard", { replace: true });
                return;
            }

            // 2. Exchange Google OAuth code with backend endpoint
            if (code) {
                try {
                    const response = await API.get(`/auth/google/callback?code=${encodeURIComponent(code)}`);
                    const accessToken = response.data?.access_token || response.data?.token;

                    if (accessToken) {
                        localStorage.setItem("token", accessToken);
                        localStorage.setItem("timevolt_token", accessToken);
                        navigate("/dashboard", { replace: true });
                        return;
                    } else {
                        setError("Token not received from server.");
                        return;
                    }
                } catch (err) {
                    console.error("Google callback authentication error:", err);
                    setError(err.response?.data?.detail || "Google authentication failed.");
                    return;
                }
            }

            // 3. Fallback check for existing session
            const existingToken = localStorage.getItem("token") || localStorage.getItem("timevolt_token");
            if (existingToken) {
                navigate("/dashboard", { replace: true });
            } else {
                setError("No authorization token or code provided.");
            }
        };

        processGoogleCallback();
    }, [navigate, location]);

    return (
        <div className="google-callback">
            <div className="google-loading">
                <div className="loading-spinner"></div>
                <h2>Signing you in...</h2>

                {error ? (
                    <div>
                        <p style={{ color: "#ef4444" }}>{error}</p>
                        <button onClick={() => navigate("/login")} style={{ marginTop: "10px" }}>
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <p>Please wait while we complete your Google authentication.</p>
                )}
            </div>
        </div>
    );
}

export default GoogleCallback;