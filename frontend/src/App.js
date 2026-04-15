import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import JobListingsPage from "@/pages/JobListingsPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import CreateJobPage from "@/pages/CreateJobPage";
import ApplicationTrackerPage from "@/pages/ApplicationTrackerPage";
import SkillGapPage from "@/pages/SkillGapPage";
import ReferralPage from "@/pages/ReferralPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import AnalyticsPage from "@/pages/AnalyticsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/jobs" element={<JobListingsPage />} />
          <Route path="/jobs/create" element={<ProtectedRoute allowedRoles={["recruiter", "admin"]}><CreateJobPage /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/applications" element={<ProtectedRoute allowedRoles={["seeker"]}><ApplicationTrackerPage /></ProtectedRoute>} />
          <Route path="/skills" element={<ProtectedRoute allowedRoles={["seeker"]}><SkillGapPage /></ProtectedRoute>} />
          <Route path="/referrals" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
