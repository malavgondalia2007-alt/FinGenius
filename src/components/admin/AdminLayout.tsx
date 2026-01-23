import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Database,
  FileText,
  Activity,
  Shield,
  LogOut,
  Zap } from
'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
interface AdminLayoutProps {
  children: React.ReactNode;
}
export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();
  const navItems = [
  {
    path: '/admin',
    icon: LayoutDashboard,
    label: 'Control Center',
    exact: true
  },
  {
    path: '/admin/users',
    icon: Users,
    label: 'User Management'
  },
  {
    path: '/admin/data',
    icon: Database,
    label: 'Data Management'
  },
  {
    path: '/admin/api-status',
    icon: Zap,
    label: 'API Status'
  },
  {
    path: '/admin/reports',
    icon: FileText,
    label: 'Reports & Exports'
  },
  {
    path: '/admin/logs',
    icon: Activity,
    label: 'Activity Logs'
  }];

  const handleSignOut = () => {
    if (confirm('Sign out of admin panel?')) {
      adminLogout();
      navigate('/admin/login');
    }
  };
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Dark Sidebar */}
      <aside className="w-72 bg-slate-900 flex flex-col border-r border-slate-800 flex-shrink-0 transition-all duration-300">
        {/* Branding */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">
                FinGenius
              </h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact ?
            location.pathname === item.path :
            location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative overflow-hidden
                  ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                `}>

                {active &&
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
                }
                <Icon
                  className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />

                <span className="relative z-10">{item.label}</span>
                {active &&
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-glow" />
                }
              </Link>);

          })}
        </nav>

        {/* Admin Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl flex items-center justify-center text-white font-bold border border-slate-600">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                Admin User
              </p>
              <p className="text-slate-400 text-xs truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-300 rounded-xl text-sm font-medium transition-all duration-200 border border-slate-700 hover:border-red-900/50">

            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-[1600px] mx-auto p-8">{children}</div>
      </main>
    </div>);

}