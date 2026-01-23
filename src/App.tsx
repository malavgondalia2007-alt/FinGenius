
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
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
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Routes */}
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


            {/* Protected User Routes */}
            <Route
              path="/onboarding"
              element={
              <ProtectedRoute requireOnboarding={true}>
                  <Onboarding />
                </ProtectedRoute>
              } />


            <Route 
              path="/" element={<Dashboard />} />


            <Route
              path="/dashboard"
              element={
              <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />


            <Route
              path="/expenses"
              element={
              <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              } />


            <Route
              path="/goals"
              element={
              <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } />


            <Route
              path="/investments"
              element={
              <ProtectedRoute>
                  <Investments />
                </ProtectedRoute>
              } />


            <Route
              path="/how-it-works"
              element={
              <ProtectedRoute>
                  <HowItWorks />
                </ProtectedRoute>
              } />


            <Route
              path="/support"
              element={
              <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } />


            <Route
              path="/settings"
              element={
              <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />


            <Route
              path="/planning"
              element={
              <ProtectedRoute>
                  <ScenarioPlanning />
                </ProtectedRoute>
              } />


            <Route
              path="/report"
              element={
              <ProtectedRoute>
                  <MonthlyReport />
                </ProtectedRoute>
              } />

          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>);

}