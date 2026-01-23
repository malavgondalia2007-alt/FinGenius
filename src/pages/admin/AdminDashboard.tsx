import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import {
  Users,
  CreditCard,
  Target,
  TrendingUp,
  Database,
  Activity } from
'lucide-react';
import { db } from '../../services/database';
import { User, Expense, Goal, Investment } from '../../types';
export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  useEffect(() => {
    // Load all data from database
    setUsers(db.users.getAll());
    setExpenses(db.expenses.getAll());
    setGoals(db.goals.getAll());
    setInvestments(db.investments.getAll());
  }, []);
  // Calculate metrics
  const totalUsers = users.length;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const activeGoals = goals.length;
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);
  // Get recent signups (sorted by creation date, most recent first)
  const recentSignups = [...users].
  sort(
    (a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).
  slice(0, 5).
  map((user) => ({
    name: user.name,
    email: user.email,
    date: new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }));
  const systemHealth = [
  {
    label: 'Database',
    value: 'Operational',
    status: 'success',
    icon: Database
  },
  {
    label: 'Total Users',
    value: totalUsers.toString(),
    status: 'success',
    icon: Users
  },
  {
    label: 'Active Goals',
    value: activeGoals.toString(),
    status: 'success',
    icon: Target
  },
  {
    label: 'Total Records',
    value: (expenses.length + goals.length + investments.length).toString(),
    status: 'success',
    icon: Activity
  }];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            System Overview
          </h1>
          <p className="text-slate-500">
            Monitor platform metrics and user activity
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Total Users"
            value={totalUsers.toLocaleString()}
            icon={Users}
            iconBgColor="bg-blue-100" />

          <AdminMetricCard
            title="Total Expenses"
            value={`₹${(totalExpenses / 1000).toFixed(1)}K`}
            icon={CreditCard}
            iconBgColor="bg-orange-100" />

          <AdminMetricCard
            title="Active Goals"
            value={activeGoals.toLocaleString()}
            icon={Target}
            iconBgColor="bg-emerald-100" />

          <AdminMetricCard
            title="Invested Assets"
            value={`₹${(totalInvestments / 1000).toFixed(1)}K`}
            icon={TrendingUp}
            iconBgColor="bg-purple-100" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Recent Signups
            </h2>
            {recentSignups.length === 0 ?
            <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No users yet</p>
              </div> :

            <div className="space-y-3">
                {recentSignups.map((user, index) =>
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-slate-700 font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{user.date}</span>
                  </div>
              )}
              </div>
            }
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              System Health
            </h2>
            <div className="space-y-4">
              {systemHealth.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {item.value}
                      </span>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    </div>
                  </div>);

              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}