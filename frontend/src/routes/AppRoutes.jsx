import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Badges from "../pages/Badges";
import Leaderboard from "../pages/Leaderboard";
import Tournament from "../pages/Tournament";
import Profile from "../pages/Profile";
import ProgressionPage from "../pages/progression/ProgressionPage";
import SetupPage from "../pages/setup/SetupPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import PracticePage from "../pages/practice/PracticePage";
import PracticeReviewPage from "../pages/practice/PracticeReviewPage";
import ReviewSessionPage from "../pages/practice/ReviewSessionPage";
import SubjectPracticePage from "../pages/practice/SubjectPracticePage";
import PracticeSessionPage from "../pages/practice/PracticeSessionPage";
import PracticeResultPage from "../pages/practice/PracticeResultPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/badges"
        element={
          <ProtectedRoute>
            <Badges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tournament"
        element={
          <ProtectedRoute>
            <Tournament />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progression"
        element={
          <ProtectedRoute>
            <ProgressionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/review"
        element={
          <ProtectedRoute>
            <PracticeReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/review/session/:questionId"
        element={
          <ProtectedRoute>
            <ReviewSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/:subjectId"
        element={
          <ProtectedRoute>
            <SubjectPracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/:subjectId/session"
        element={
          <ProtectedRoute>
            <PracticeSessionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/:subjectId/result"
        element={
          <ProtectedRoute>
            <PracticeResultPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
