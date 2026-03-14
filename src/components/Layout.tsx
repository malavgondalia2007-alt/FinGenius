import React from 'react';
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
    <div className="min-h-screen font-sans relative overflow-hidden color-cycle-bg">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl color-cycle-orb1" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-3xl color-cycle-orb2" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full blur-3xl color-cycle-orb3 opacity-50" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full blur-3xl color-cycle-orb1 opacity-40" />

        {/* Subtle dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1a1a2e 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="relative color-cycle-logo">
                  <div className="absolute -inset-1 rounded-xl blur-md color-cycle-glow opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative w-10 h-10 bg-charcoal rounded-xl flex items-center justify-center text-white font-serif font-bold text-lg shadow-warm-md">
                    F
                  </div>
                </div>
                <div>
                  <span className="text-xl font-serif font-bold text-charcoal">
                    FinGenius
                  </span>
                  <div className="flex items-center gap-1 text-xs text-charcoal-500">
                    <Sparkles className="w-3 h-3 color-cycle-sparkle" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </Link>

              {/* Navigation Tabs - Desktop */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-300
                        ${active ? 'bg-charcoal text-white shadow-warm-md' : 'text-charcoal-600 hover:bg-white/60 hover:text-charcoal'}
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
                className="p-2.5 text-charcoal-600 hover:text-charcoal hover:bg-white/60 rounded-lg transition-all duration-300 relative group">

                <Settings className="w-5 h-5" />
              </Link>

              {/* User Profile Link */}
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/60 rounded-lg transition-all duration-300 group">

                <div className="w-9 h-9 bg-charcoal rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-warm-sm group-hover:shadow-warm-md transition-shadow">
                  {user?.name.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm font-medium text-charcoal hidden sm:block">
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
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap
                    transition-all duration-300
                    ${active ? 'bg-charcoal text-white shadow-warm-md' : 'text-charcoal-600 hover:bg-white/60'}
                  `}>

                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>);

            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>);

}