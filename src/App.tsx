import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Expenses } from './pages/Expenses';
import { Goals } from './pages/Goals';
import { Investments } from './pages/Investments';
import { HowItWorks } from './pages/HowItWorks';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Onboarding } from './pages/Onboarding';
import { Support } from './pages/Support';
import { Settings } from './pages/Settings';
import { ScenarioPlanning } from './pages/ScenarioPlanning';
import { MonthlyReport } from './pages/MonthlyReport';
import { InvestmentGuidance } from './pages/InvestmentGuidance';
import { InvestmentCalculators } from './pages/InvestmentCalculators';
import { IndianMarketNews } from './pages/IndianMarketNews';
// Admin imports
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminControlCenter } from './pages/admin/AdminControlCenter';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminData } from './pages/admin/AdminData';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminActivityLogs } from './pages/admin/AdminActivityLogs';
import { AdminAPIMonitoring } from './pages/admin/AdminAPIMonitoring';
import { AdminAPIStatus } from './pages/admin/AdminAPIStatus';
export function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Root path - Redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes - No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Login - No Layout */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes - No Layout (Admin has its own) */}
            <Route
              path="/admin"
              element={
              <AdminProtectedRoute>
                  <AdminControlCenter />
                </AdminProtectedRoute>
              } />

            <Route
              path="/admin/users"
              element={
              <AdminProtectedRoute>
                  <AdminUsers />
                </AdminProtectedRoute>
              } />

            <Route
              path="/admin/data"
              element={
              <AdminProtectedRoute>
                  <AdminData />
                </AdminProtectedRoute>
              } />

            <Route
              path="/admin/reports"
              element={
              <AdminProtectedRoute>
                  <AdminReports />
                </AdminProtectedRoute>
              } />

            <Route
              path="/admin/logs"
              element={
              <AdminProtectedRoute>
                  <AdminActivityLogs />
                </AdminProtectedRoute>
              } />

            <Route
              path="/admin/api-monitoring"
              element={
              <AdminProtectedRoute>
                  <AdminAPIMonitoring />
                </AdminProtectedRoute>
              } />

            <Route
              path="/admin/api-status"
              element={
              <AdminProtectedRoute>
                  <AdminAPIStatus />
                </AdminProtectedRoute>
              } />


            {/* Protected User Routes - Wrapped in Layout */}
            <Route
              path="/onboarding"
              element={
              <ProtectedRoute requireOnboarding={true}>
                  <Onboarding />
                </ProtectedRoute>
              } />


            <Route
              path="/dashboard"
              element={
              <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/expenses"
              element={
              <ProtectedRoute>
                  <Layout>
                    <Expenses />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/goals"
              element={
              <ProtectedRoute>
                  <Layout>
                    <Goals />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/investments"
              element={
              <ProtectedRoute>
                  <Layout>
                    <Investments />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/how-it-works"
              element={
              <ProtectedRoute>
                  <Layout>
                    <HowItWorks />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/support"
              element={
              <ProtectedRoute>
                  <Layout>
                    <Support />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/settings"
              element={
              <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/planning"
              element={
              <ProtectedRoute>
                  <Layout>
                    <ScenarioPlanning />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/report"
              element={
              <ProtectedRoute>
                  <Layout>
                    <MonthlyReport />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/investment-guidance"
              element={
              <ProtectedRoute>
                  <Layout>
                    <InvestmentGuidance />
                  </Layout>
                </ProtectedRoute>
              } />


            <Route
              path="/calculators"
              element={
              <ProtectedRoute>
                  <Layout>
                    <InvestmentCalculators />
                  </Layout>
                </ProtectedRoute>
              } />

          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>);

}