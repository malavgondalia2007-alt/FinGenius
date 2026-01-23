import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  TrendingUp,
  Globe,
  ShieldAlert,
  Activity,
  PauseOctagon,
  BarChart3 } from
'lucide-react';
export function AdminInvestmentOversight() {
  const apis = [
  {
    name: 'NSE Market Data',
    status: 'Active',
    latency: '45ms',
    calls: '12.5k',
    limit: '50k'
  },
  {
    name: 'BSE Feed',
    status: 'Active',
    latency: '52ms',
    calls: '8.2k',
    limit: '50k'
  },
  {
    name: 'MF Central API',
    status: 'Active',
    latency: '120ms',
    calls: '3.1k',
    limit: '10k'
  },
  {
    name: 'RBI Rates',
    status: 'Idle',
    latency: '-',
    calls: '120',
    limit: '1k'
  }];

  const recommendations = [
  {
    fund: 'HDFC Mid-Cap Opportunities',
    risk: 'High',
    type: 'Equity',
    acceptance: '68%',
    status: 'Active'
  },
  {
    fund: 'SBI Blue Chip Fund',
    risk: 'Moderate',
    type: 'Large Cap',
    acceptance: '82%',
    status: 'Active'
  },
  {
    fund: 'Parag Parikh Flexi Cap',
    risk: 'Moderate',
    type: 'Flexi Cap',
    acceptance: '75%',
    status: 'Active'
  },
  {
    fund: 'Axis Small Cap Fund',
    risk: 'High',
    type: 'Small Cap',
    acceptance: '45%',
    status: 'Paused'
  }];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              Investment Oversight
              <Badge variant="info" className="ml-2">
                India Market Focus
              </Badge>
            </h1>
            <p className="text-slate-500">
              Monitor AI investment recommendations and API health
            </p>
          </div>
          <Button variant="danger" className="gap-2">
            <PauseOctagon className="w-4 h-4" />
            Pause High-Risk Recs
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Total AUM Tracked"
            value="₹4.2 Cr"
            icon={TrendingUp}
            iconBgColor="bg-emerald-100"
            trend={{
              value: 12,
              label: 'this month'
            }} />

          <AdminMetricCard
            title="Rec. Acceptance Rate"
            value="72%"
            icon={Activity}
            iconBgColor="bg-blue-100" />

          <AdminMetricCard
            title="High Risk Exposure"
            value="18%"
            icon={ShieldAlert}
            iconBgColor="bg-amber-100"
            trend={{
              value: -2,
              label: 'decreasing'
            }} />

          <AdminMetricCard
            title="API Health"
            value="100%"
            icon={Globe}
            iconBgColor="bg-purple-100" />

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* API Monitoring */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                India Market APIs
              </h2>
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                All Systems Operational
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      API Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Latency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apis.map((api, idx) =>
                  <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {api.name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                        variant={
                        api.status === 'Active' ? 'success' : 'neutral'
                        }>

                          {api.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                        {api.latency}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{
                              width: '25%'
                            }}>
                          </div>
                          </div>
                          <span className="text-xs text-slate-500">
                            {api.calls}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-medium text-purple-600 hover:text-purple-700">
                          Configure
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Risk Distribution
            </h2>
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48">
                {/* Mock Donut Chart */}
                <svg
                  viewBox="0 0 36 36"
                  className="w-full h-full transform -rotate-90">

                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3" />

                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 15.9155 15.9155"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray="25, 100" />

                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="45, 100"
                    strokeDashoffset="-25" />

                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 -15.9155 15.9155"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="30, 100"
                    strokeDashoffset="-70" />

                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-slate-900">
                    100%
                  </span>
                  <span className="text-xs text-slate-500">Portfolio</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-600">Low Risk (Debt/Liquid)</span>
                </div>
                <span className="font-bold text-slate-900">30%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-600">Moderate (Large Cap)</span>
                </div>
                <span className="font-bold text-slate-900">45%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-600">High Risk (Small Cap)</span>
                </div>
                <span className="font-bold text-slate-900">25%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Recommendations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              AI Recommendation Engine Status
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Fund Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Risk Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    User Acceptance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendations.map((rec, idx) =>
                <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {rec.fund}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {rec.type}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                      variant={
                      rec.risk === 'High' ?
                      'danger' :
                      rec.risk === 'Moderate' ?
                      'warning' :
                      'success'
                      }>

                        {rec.risk}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                      {rec.acceptance}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                      variant={
                      rec.status === 'Active' ? 'success' : 'neutral'
                      }>

                        {rec.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600">
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>);

}