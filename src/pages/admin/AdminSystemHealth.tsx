import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Badge } from '../../components/ui/Badge';
import {
  Server,
  Database,
  Shield,
  Activity,
  Clock,
  HardDrive } from
'lucide-react';
export function AdminSystemHealth() {
  const services = [
  {
    name: 'API Gateway',
    status: 'Operational',
    uptime: '99.99%',
    latency: '45ms',
    version: 'v2.4.1'
  },
  {
    name: 'Auth Service',
    status: 'Operational',
    uptime: '99.95%',
    latency: '120ms',
    version: 'v1.2.0'
  },
  {
    name: 'Database Primary',
    status: 'Operational',
    uptime: '100%',
    latency: '15ms',
    version: 'PostgreSQL 14'
  },
  {
    name: 'AI Inference Engine',
    status: 'Degraded',
    uptime: '98.50%',
    latency: '850ms',
    version: 'v3.0.0-beta'
  },
  {
    name: 'Notification Worker',
    status: 'Operational',
    uptime: '99.90%',
    latency: 'N/A',
    version: 'v1.1.5'
  },
  {
    name: 'Investment Sync',
    status: 'Operational',
    uptime: '99.80%',
    latency: '210ms',
    version: 'v2.1.0'
  }];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            System & API Health
          </h1>
          <p className="text-slate-500">
            Detailed infrastructure monitoring and status
          </p>
        </div>

        {/* Global Status */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-emerald-900">
              All Systems Operational
            </h2>
            <p className="text-emerald-700">
              No major incidents reported in the last 24 hours.
            </p>
          </div>
        </div>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) =>
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Server className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{service.name}</h3>
                    <p className="text-xs text-slate-500">{service.version}</p>
                  </div>
                </div>
                <div
                className={`w-3 h-3 rounded-full ${service.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
              </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <Badge
                  variant={
                  service.status === 'Operational' ? 'success' : 'warning'
                  }>

                    {service.status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Uptime</span>
                  <span className="font-mono font-medium text-slate-900">
                    {service.uptime}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Latency</span>
                  <span
                  className={`font-mono font-medium ${service.latency !== 'N/A' && parseInt(service.latency) > 500 ? 'text-amber-600' : 'text-slate-900'}`}>

                    {service.latency}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Database Metrics */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-500" />
            Database Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Active Connections</p>
              <p className="text-2xl font-bold text-slate-900">482</p>
              <p className="text-xs text-emerald-600 mt-1">Within limits</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">
                Query Duration (Avg)
              </p>
              <p className="text-2xl font-bold text-slate-900">12ms</p>
              <p className="text-xs text-emerald-600 mt-1">Optimal</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500 mb-1">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-slate-900">94.2%</p>
              <p className="text-xs text-emerald-600 mt-1">Excellent</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}
// Helper component for icon
function CheckCircle2({ className }: {className?: string;}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>

      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>);

}