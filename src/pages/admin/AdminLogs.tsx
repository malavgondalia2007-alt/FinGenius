import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { FileText } from 'lucide-react';
export function AdminLogs() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            System Activity Logs
          </h1>
          <p className="text-slate-500">
            Monitor system events and admin actions
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No logs available yet
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            System activity logs will appear here once events are recorded. This
            includes user actions, system events, and admin operations.
          </p>
        </div>
      </div>
    </AdminLayout>);

}