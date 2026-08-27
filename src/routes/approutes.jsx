import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import GoogleCallback from "../pages/GoogleCallback";

import Dashboard from "../pages/dashboard";
import Activities from "../pages/activities";
import GenerateTimetable from "../pages/generate";
import SavedTimetables from "../pages/saved-timetables";
import MySchedule from "../pages/schedule";
import Settings from "../pages/settings";
import Profile from "../pages/profile";
import PageTransition from "../components/PageTransitions";

import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { SettingsProvider } from "../components/settings-context";


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