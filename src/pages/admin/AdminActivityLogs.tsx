import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { Badge } from '../../components/ui/Badge';
import { Activity, Search, Filter, ShieldCheck, RefreshCw } from 'lucide-react';
import { db } from '../../services/database';
import { AdminLog } from '../../types';
export function AdminActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadLogs = () => {
    const allLogs = db.admin.getActivityLogs();
    setLogs(allLogs);
  };
  useEffect(() => {
    loadLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadLogs();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLogs();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  const filteredLogs = logs.filter(
    (log) =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const columns = [
  {
    key: 'timestamp',
    label: 'Time',
    render: (timestamp: string) => {
      const date = new Date(timestamp);
      return (
        <div className="text-xs">
            <div className="font-medium text-slate-900">
              {date.toLocaleDateString()}
            </div>
            <div className="text-slate-500">{date.toLocaleTimeString()}</div>
          </div>);

    }
  },
  {
    key: 'adminId',
    label: 'Actor',
    render: (adminId: string) =>
    <span className="font-medium text-slate-900 capitalize">{adminId}</span>

  },
  {
    key: 'action',
    label: 'Action',
    render: (action: string) =>
    <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-slate-400" />
          <span className="font-medium">{action}</span>
        </div>

  },
  {
    key: 'target',
    label: 'Target',
    render: (target: string) =>
    <span className="text-sm text-slate-600">{target}</span>

  },
  {
    key: 'status',
    label: 'Status',
    render: (status: string) =>
    <Badge
      variant={
      status === 'success' ?
      'success' :
      status === 'warning' ?
      'warning' :
      'danger'
      }>

          {status}
        </Badge>

  },
  {
    key: 'details',
    label: 'Details',
    render: (details: string) =>
    <span
      className="text-sm text-slate-600 max-w-xs truncate block"
      title={details}>

          {details}
        </span>

  }];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Activity Logs
            </h1>
            <p className="text-slate-500">
              Audit trail of all system events • {filteredLogs.length} total
              logs
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} />

            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">

              <RefreshCw
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />

            </button>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            <strong>Security Status:</strong> All systems operational.
            Monitoring {logs.length} activity entries.
          </p>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredLogs.length > 0 ?
          <AdminTable
            columns={columns}
            data={filteredLogs}
            emptyMessage="No activity logs found." /> :


          <div className="p-12 text-center text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No logs match your search</p>
              <p className="text-sm mt-1">Try adjusting your search terms</p>
            </div>
          }
        </div>
      </div>
    </AdminLayout>);

}