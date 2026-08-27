import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Register from "../pages/register.jsx";
import VerifyEmail from "../pages/VerifyEmail.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import GoogleCallback from "../pages/GoogleCallback.jsx";

import Dashboard from "../pages/dashboard.jsx";
import Activities from "../pages/activities.jsx";
import GenerateTimetable from "../pages/generate.jsx";
import SavedTimetables from "../pages/saved-timetables.jsx";
import MySchedule from "../pages/schedule.jsx";
import Settings from "../pages/settings.jsx";
import Profile from "../pages/profile.jsx";
import PageTransition from "../components/PageTransitions.jsx";

import AuthLayout from "../layouts/AuthLayout.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { SettingsProvider } from "../components/settings-context.jsx";


function AppRoutes() {
  return (
    <SettingsProvider>
    <BrowserRouter>

      <Routes>

        {/* ================= AUTHENTICATION ================= */}

        <Route element={<AuthLayout />}>

          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/auth/google/callback"
            element={<GoogleCallback />}
          />

        </Route>


        {/* ================= PROTECTED APPLICATION ================= */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/activities"
            element={<Activities />}
          />

          <Route
            path="/generate"
            element={<GenerateTimetable />}
          />

          <Route
            path="/timetables"
            element={<SavedTimetables />}
          />

          <Route
            path="/schedule"
            element={<MySchedule />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
          <Route
            path="/page-transition"
            element={<PageTransition />}
          />

          {/* Future pages will go here */}

        </Route>

      </Routes>

    </BrowserRouter>
    </SettingsProvider>
  );
}

export default AppRoutes;