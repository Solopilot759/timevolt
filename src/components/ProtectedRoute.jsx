import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token =
    localStorage.getItem("timevolt_token") ||
    sessionStorage.getItem("timevolt_token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;