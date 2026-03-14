import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean; // If true, only allow if onboarding is NOT complete (for onboarding page)
}
export function ProtectedRoute({
  children,
  requireOnboarding = false
}: ProtectedRouteProps) {
  const {
    user,
    isLoading,
    isOnboardingComplete
  } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{
      from: location
    }} replace />;
  }
  // Logic for onboarding redirection
  if (requireOnboarding) {
    // We are on the onboarding page
    if (isOnboardingComplete) {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (!isOnboardingComplete) {
    // We are on a regular protected page, but haven't finished onboarding
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}