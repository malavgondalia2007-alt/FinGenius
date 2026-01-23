import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Layout } from "./Layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({
  children,
  requireOnboarding = false,
}: ProtectedRouteProps) {
  const { user, isLoading, isOnboardingComplete } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOnboarding) {
    if (isOnboardingComplete) {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (!isOnboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  // ✅ THIS IS THE FIX
  return <Layout>{children}</Layout>;
}
