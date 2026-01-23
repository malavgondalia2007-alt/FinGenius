import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Target,
  TrendingDown,
  AlertCircle,
  Settings,
  BrainCircuit } from
'lucide-react';
import { db } from '../../services/database';
import { Goal } from '../../types';
export function AdminGoalsIntelligence() {
  const [goals, setGoals] = useState<Goal[]>([]);
  useEffect(() => {
    setGoals(db.goals.getAll());
  }, []);
  // Analysis Logic
  const totalGoals = goals.length;
  const activeGoals = goals.filter((g) => g.savedAmount > 0).length;
  const zeroContributionGoals = goals.filter((g) => g.savedAmount === 0);
  const abandonmentRate =
  totalGoals > 0 ? zeroContributionGoals.length / totalGoals * 100 : 0;
  // Category Breakdown
  const categories = goals.reduce(
    (acc, goal) => {
      acc[goal.category] = (acc[goal.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const sortedCategories = Object.entries(categories).
  sort(([, a], [, b]) => b - a).
  slice(0, 5);
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Goals Intelligence
            </h1>
            <p className="text-slate-500">
              Analyze goal performance, failure patterns, and AI logic
            </p>
          </div>
          <Button variant="royal" className="gap-2">
            <BrainCircuit className="w-4 h-4" />
            Adjust AI Goal Logic
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminMetricCard
            title="Total Active Goals"
            value={totalGoals}
            icon={Target}
            iconBgColor="bg-blue-100" />

          <AdminMetricCard
            title="Abandonment Rate"
            value={`${abandonmentRate.toFixed(1)}%`}
            icon={TrendingDown}
            iconBgColor="bg-red-100"
            trend={{
              value: 2.5,
              label: 'increase'
            }} />

          <AdminMetricCard
            title="Zero-Contribution Goals"
            value={zeroContributionGoals.length}
            icon={AlertCircle}
            iconBgColor="bg-amber-100" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Analysis */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Goal Category Performance
            </h2>
            <div className="space-y-6">
              {sortedCategories.map(([category, count], idx) => {
                const percentage = count / totalGoals * 100;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {category}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {count} goals
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{
                          width: `${percentage}%`
                        }}>
                      </div>
                    </div>
                  </div>);

              })}
            </div>
          </div>

          {/* Zero Contribution Watchlist */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                At-Risk Goals (Zero Contribution)
              </h2>
              <Badge variant="warning">
                {zeroContributionGoals.length} Goals
              </Badge>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {zeroContributionGoals.length === 0 ?
              <p className="text-slate-500 text-center py-8">
                  No at-risk goals detected.
                </p> :

              zeroContributionGoals.map((goal, idx) =>
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {goal.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Target: ₹{goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="danger">Stalled</Badge>
                      <button className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
              )
              }
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Button variant="outline" fullWidth size="sm">
                Run AI Nudge Campaign
              </Button>
            </div>
          </div>
        </div>

        {/* AI Logic Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            AI Goal Logic Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-2">Smart Nudges</h3>
              <p className="text-sm text-slate-500 mb-4">
                Frequency of reminders for stalled goals.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Moderate
                </span>
                <div className="w-10 h-5 bg-purple-600 rounded-full relative cursor-pointer">
                  <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-2">
                Inflation Adjustment
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                Auto-adjust targets based on CPI data.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Enabled (6%)
                </span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                  <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1"></div>
                </div>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-900 mb-2">Risk Tolerance</h3>
              <p className="text-sm text-slate-500 mb-4">
                Aggressiveness of timeline suggestions.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  Conservative
                </span>
                <div className="w-10 h-5 bg-slate-300 rounded-full relative cursor-pointer">
                  <div className="w-3 h-3 bg-white rounded-full absolute left-1 top-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}