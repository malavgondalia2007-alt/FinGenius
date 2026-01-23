import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiMonitoringService } from '../../services/apiMonitoring';
import { APIEndpoint } from '../../types';
import {
  CheckCircle,
  XCircle,
  Pause,
  Play,
  RefreshCw,
  Search,
  AlertCircle } from
'lucide-react';
export function AdminAPIStatus() {
  const [apis, setApis] = useState<APIEndpoint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const loadData = () => {
    setApis(apiMonitoringService.getAPIs());
  };
  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };
  const handleToggleAPI = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    apiMonitoringService.updateAPIStatus(id, newStatus);
    loadData();
  };
  const filteredAPIs = apis.filter(
    (api) =>
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const activeCount = apis.filter((api) => api.status === 'active').length;
  const inactiveCount = apis.filter((api) => api.status === 'inactive').length;
  const maintenanceCount = apis.filter(
    (api) => api.status === 'maintenance'
  ).length;
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              API Status Monitor
            </h1>
            <p className="text-slate-500">View and manage all API endpoints</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}>

            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />

            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total APIs</p>
                <p className="text-2xl font-bold text-slate-900">
                  {apis.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Active</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {inactiveCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Maintenance</p>
                <p className="text-2xl font-bold text-amber-600">
                  {maintenanceCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search APIs by name or endpoint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-slate-900" />

          </div>
        </Card>

        {/* API List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    API Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Endpoint
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAPIs.map((api) =>
                <tr
                  key={api.id}
                  className="hover:bg-slate-50 transition-colors">

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {api.status === 'active' ?
                      <>
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-emerald-700">
                              Active
                            </span>
                          </> :
                      api.status === 'inactive' ?
                      <>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-700">
                              Inactive
                            </span>
                          </> :

                      <>
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-sm font-medium text-amber-700">
                              Maintenance
                            </span>
                          </>
                      }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {api.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 px-3 py-1.5 rounded text-slate-700 font-mono">
                        {api.endpoint}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                      className={`px-3 py-1 text-xs font-bold rounded-md ${api.method === 'GET' ? 'bg-blue-100 text-blue-700' : api.method === 'POST' ? 'bg-emerald-100 text-emerald-700' : api.method === 'PUT' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>

                        {api.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {api.category}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredAPIs.length === 0 &&
          <div className="text-center py-12">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                No APIs found matching your search
              </p>
            </div>
          }
        </Card>
      </div>
    </AdminLayout>);

}