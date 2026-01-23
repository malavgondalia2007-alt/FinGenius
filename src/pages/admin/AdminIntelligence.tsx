import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Lightbulb, TrendingUp, AlertTriangle, Users } from 'lucide-react';
export function AdminIntelligence() {
  const insights = [
  {
    type: 'trend',
    title: 'Spending Spike in Entertainment',
    description:
    'Non-essential spending increased by 23% this week across all users.',
    impact: 'medium',
    icon: TrendingUp
  },
  {
    type: 'alert',
    title: 'High Goal Abandonment Rate',
    description:
    '15% of goals created last month have not received any contributions.',
    impact: 'high',
    icon: AlertTriangle
  },
  {
    type: 'insight',
    title: 'Student Users Growing Fast',
    description:
    'Student profile signups increased 45% compared to last month.',
    impact: 'low',
    icon: Users
  }];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Platform Intelligence
          </h1>
          <p className="text-slate-500">
            AI-powered insights and behavioral patterns
          </p>
        </div>

        {/* Insights Grid */}
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl border-2 p-6 transition-colors ${insight.impact === 'high' ? 'border-red-200 hover:border-red-300' : insight.impact === 'medium' ? 'border-amber-200 hover:border-amber-300' : 'border-blue-200 hover:border-blue-300'}`}>

                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${insight.impact === 'high' ? 'bg-red-100' : insight.impact === 'medium' ? 'bg-amber-100' : 'bg-blue-100'}`}>

                    <Icon
                      className={`w-6 h-6 ${insight.impact === 'high' ? 'text-red-600' : insight.impact === 'medium' ? 'text-amber-600' : 'text-blue-600'}`} />

                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {insight.title}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${insight.impact === 'high' ? 'bg-red-100 text-red-700' : insight.impact === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>

                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                    </div>
                    <p className="text-slate-600">{insight.description}</p>
                  </div>
                </div>
              </div>);

          })}
        </div>
      </div>
    </AdminLayout>);

}