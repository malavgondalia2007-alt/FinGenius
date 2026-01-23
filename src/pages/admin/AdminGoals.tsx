import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { User as UserIcon } from 'lucide-react';
import { db } from '../../services/database';
import { Goal, User } from '../../types';
export function AdminGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    setGoals(db.goals.getAll());
    setUsers(db.users.getAll());
  }, []);
  // Create a map of userId to user name for quick lookup
  const userMap = users.reduce(
    (map, user) => {
      map[user.id] = user.name;
      return map;
    },
    {} as Record<string, string>
  );
  // Prepare goals with user names and progress
  const goalsWithDetails = goals.map((goal) => ({
    ...goal,
    userName: userMap[goal.userId] || 'Unknown User',
    progress: Math.round(goal.savedAmount / goal.targetAmount * 100)
  }));
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">User Goals</h1>
          <p className="text-slate-500">Financial goals across all users</p>
        </div>

        {/* Goals Grid */}
        {goalsWithDetails.length === 0 ?
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No goals yet
            </h3>
            <p className="text-slate-500">
              User goals will appear here once they are created
            </p>
          </div> :

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goalsWithDetails.map((goal) =>
          <div
            key={goal.id}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">

                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <UserIcon className="w-4 h-4" />
                      {goal.userName}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {goal.category}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-900">
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                  className="bg-gradient-to-r from-purple-600 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(goal.progress, 100)}%`
                  }}>
                </div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Saved</p>
                    <p className="text-sm font-bold text-slate-900">
                      ₹{goal.savedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Target</p>
                    <p className="text-sm font-bold text-slate-900">
                      ₹{goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Deadline */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
          )}
          </div>
        }
      </div>
    </AdminLayout>);

}