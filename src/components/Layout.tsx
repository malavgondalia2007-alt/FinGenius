import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  CreditCard,
  Target,
  TrendingUp,
  Settings,
  Sparkles,
  Map } from
'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { HelpChatbot } from './HelpChatbot';
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const navItems = [
  {
    path: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard'
  },
  {
    path: '/expenses',
    icon: CreditCard,
    label: 'Expenses'
  },
  {
    path: '/goals',
    icon: Target,
    label: 'Goals'
  },
  {
    path: '/investments',
    icon: TrendingUp,
    label: 'Investments'
  },
  {
    path: '/planning',
    icon: Map,
    label: 'Planning'
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/20 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-royal-600 to-midnight-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-royal-600 to-midnight-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-royal">
                    F
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold gradient-text-royal">
                    FinGenius
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Sparkles className="w-3 h-3" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </Link>

              {/* Navigation Tabs - Desktop */}
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
                        transition-all duration-300
                        ${active ? 'bg-gradient-to-r from-royal-600 to-midnight-600 text-white shadow-royal' : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'}
                      `}>

                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>);

                })}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <NotificationCenter />

              <Link
                to="/settings"
                className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-white/50 rounded-xl transition-all duration-300 relative group">

                <Settings className="w-5 h-5" />
                <span className="absolute inset-0 rounded-xl bg-royal-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </Link>

              {/* User Profile Link */}
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-xl transition-all duration-300 group">

                <div className="w-9 h-9 bg-gradient-to-br from-royal-600 to-midnight-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-soft group-hover:shadow-royal transition-shadow">
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                  {user?.name || 'User'}
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex gap-2 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap
                    transition-all duration-300
                    ${active ? 'bg-gradient-to-r from-royal-600 to-midnight-600 text-white shadow-royal' : 'text-slate-600 hover:bg-white/50'}
                  `}>

                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>);

            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>);

}