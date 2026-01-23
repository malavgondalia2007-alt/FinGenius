import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Cpu,
  Zap,
  Sliders,
  AlertTriangle,
  CheckCircle,
  ArrowRight } from
'lucide-react';
export function AdminAIRules() {
  const insights = [
  {
    id: 1,
    type: 'Spending Anomaly',
    message:
    'Unusual spike in "Entertainment" category across 15% of users this weekend.',
    cause: 'Likely due to long weekend holiday.',
    action: 'Adjust anomaly threshold temporarily',
    status: 'Pending'
  },
  {
    id: 2,
    type: 'Goal Failure Pattern',
    message:
    'Users with >40% income in rent are failing "Emergency Fund" goals at 2x rate.',
    cause: 'Disposable income calculation might be too optimistic.',
    action: 'Update savings recommendation logic',
    status: 'Pending'
  }];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              AI Rules & Governance
            </h1>
            <p className="text-slate-500">
              Manage system-wide AI behavior and actionable insights
            </p>
          </div>
          <Button variant="royal" className="gap-2">
            <Cpu className="w-4 h-4" />
            Retrain Models
          </Button>
        </div>

        {/* Actionable Insights Engine */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Actionable Insights Engine
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              System-generated recommendations requiring admin attention
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {insights.map((insight) =>
            <div
              key={insight.id}
              className="p-6 hover:bg-slate-50 transition-colors">

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mt-1">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900">
                        {insight.type}
                      </h3>
                      <Badge variant="warning">Action Required</Badge>
                    </div>
                    <p className="text-slate-700 mb-2">{insight.message}</p>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                      <p className="text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">
                          AI Analysis:
                        </span>{' '}
                        {insight.cause}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="sm" className="gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Apply Fix: {insight.action}
                      </Button>
                      <Button variant="ghost" size="sm">
                        Ignore
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-slate-500" />
              Global Thresholds
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Risk Tolerance Sensitivity
                  </label>
                  <span className="text-sm font-bold text-purple-600">
                    High
                  </span>
                </div>
                <input
                  type="range"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />

              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Expense Anomaly Detection
                  </label>
                  <span className="text-sm font-bold text-purple-600">
                    Strict (&gt;20% deviation)
                  </span>
                </div>
                <input
                  type="range"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />

              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">
                    Goal Nudge Frequency
                  </label>
                  <span className="text-sm font-bold text-purple-600">
                    Weekly
                  </span>
                </div>
                <input
                  type="range"
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />

              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-slate-500" />
              Safety Overrides
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">Halt All Trades</p>
                  <p className="text-xs text-slate-500">
                    Emergency stop for investment API
                  </p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer transition-colors hover:bg-slate-300">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">
                    Disable User Signups
                  </p>
                  <p className="text-xs text-slate-500">
                    Prevent new registrations
                  </p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer transition-colors hover:bg-slate-300">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">
                    Show maintenance page to users
                  </p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer transition-colors hover:bg-slate-300">
                  <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}