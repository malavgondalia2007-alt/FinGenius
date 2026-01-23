import React, { useEffect, useState, createElement } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiMonitoringService } from '../../services/apiMonitoring';
import {
  APIEndpoint,
  APIError,
  SecurityAlert,
  APIMetrics,
  RateLimitStatus } from
'../../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Globe,
  Lock,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  XCircle,
  Zap,
  AlertOctagon } from
'lucide-react';
type TabType = 'overview' | 'apis' | 'errors' | 'security' | 'reports';
export function AdminAPIMonitoring() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [metrics, setMetrics] = useState<APIMetrics | null>(null);
  const [apis, setApis] = useState<APIEndpoint[]>([]);
  const [errors, setErrors] = useState<APIError[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [errorFilter, setErrorFilter] = useState<string>('all');
  const loadData = () => {
    setMetrics(apiMonitoringService.getMetrics());
    setApis(apiMonitoringService.getAPIs());
    setErrors(apiMonitoringService.getErrors());
    setSecurityAlerts(apiMonitoringService.getSecurityAlerts());
    setRateLimits(apiMonitoringService.getRateLimitStatus());
  };
  useEffect(() => {
    loadData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      loadData();
    }, 10000);
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
  const handleResolveError = (id: string) => {
    apiMonitoringService.resolveError(id);
    loadData();
  };
  const handleResolveSecurityAlert = (id: string) => {
    const action = prompt('Enter action taken:');
    if (action) {
      apiMonitoringService.resolveSecurityAlert(id, action);
      loadData();
    }
  };
  const handleDownloadReport = (type: 'weekly' | 'monthly') => {
    const csv = apiMonitoringService.generateReport(type);
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-report-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  const handleDownloadErrorReport = () => {
    const csv = apiMonitoringService.generateErrorReport();
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };
  const filteredAPIs = apis.filter((api) => {
    const matchesSearch =
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || api.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filteredErrors = errors.filter((error) => {
    if (errorFilter === 'all') return true;
    if (errorFilter === 'unresolved') return !error.resolved;
    if (errorFilter === '4xx') return error.errorType === '4xx';
    if (errorFilter === '5xx') return error.errorType === '5xx';
    return true;
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inactive':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'maintenance':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };
  const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Activity
  },
  {
    id: 'apis',
    label: 'API List',
    icon: Globe
  },
  {
    id: 'errors',
    label: 'Error Logs',
    icon: AlertTriangle
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: Download
  }];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-purple-600" />
              API Monitoring System
            </h1>
            <p className="text-slate-500">
              Real-time monitoring and control of all API endpoints
            </p>
          </div>
          <div className="flex items-center gap-3">
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
        </div>

        {/* Metrics Overview */}
        {metrics &&
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminMetricCard
            title="Total API Calls"
            value={metrics.totalCalls.toLocaleString()}
            subtitle="All time"
            icon={Activity}
            iconBgColor="bg-blue-100" />

            <AdminMetricCard
            title="Success Rate"
            value={`${(metrics.successfulCalls / metrics.totalCalls * 100).toFixed(1)}%`}
            subtitle={`${metrics.successfulCalls.toLocaleString()} successful`}
            icon={CheckCircle}
            iconBgColor="bg-emerald-100" />

            <AdminMetricCard
            title="Failed Requests"
            value={metrics.failedCalls.toLocaleString()}
            subtitle={`${metrics.errorRate}% error rate`}
            icon={XCircle}
            iconBgColor="bg-red-100" />

            <AdminMetricCard
            title="Avg Response Time"
            value={`${metrics.avgResponseTime}ms`}
            subtitle={`${metrics.callsPerMinute}/min`}
            icon={Clock}
            iconBgColor="bg-purple-100" />

          </div>
        }

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>

                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>);

            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* Overview Tab */}
          {activeTab === 'overview' &&
          <div className="space-y-6">
              {/* Rate Limit Monitoring */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Rate Limit Status
                </h3>
                <div className="space-y-4">
                  {rateLimits.slice(0, 5).map((limit) =>
                <div key={limit.apiId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                          {limit.apiName}
                        </span>
                        <span className="text-sm text-slate-500">
                          {limit.current} / {limit.limit} req/min
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                      className={`h-full rounded-full transition-all ${limit.percentage > 90 ? 'bg-red-500' : limit.percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{
                        width: `${Math.min(limit.percentage, 100)}%`
                      }} />

                      </div>
                      {limit.exceeded &&
                  <p className="text-xs text-red-600 font-medium">
                          ⚠️ Rate limit exceeded!
                        </p>
                  }
                    </div>
                )}
                </div>
              </Card>

              {/* Recent Errors */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Recent Errors
                  <span className="ml-auto text-xs font-normal text-slate-500">
                    Last 24 hours
                  </span>
                </h3>
                <div className="space-y-3">
                  {errors.slice(0, 5).map((error) =>
                <div
                  key={error.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">

                      <div
                    className={`p-1.5 rounded ${error.errorType === '5xx' ? 'bg-red-100' : 'bg-amber-100'}`}>

                        {error.errorType === '5xx' ?
                    <XCircle className="w-4 h-4 text-red-600" /> :

                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-slate-900">
                            {error.apiName}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded">
                            {error.statusCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">
                          {error.errorMessage}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {getTimeAgo(error.timestamp)} • {error.ipAddress}
                        </p>
                      </div>
                    </div>
                )}
                </div>
              </Card>

              {/* Security Alerts */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Active Security Alerts
                </h3>
                <div className="space-y-3">
                  {securityAlerts.
                filter((a) => !a.resolved).
                slice(0, 3).
                map((alert) =>
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${alert.severity === 'critical' ? 'bg-red-50 border-red-200' : alert.severity === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-amber-50 border-amber-200'}`}>

                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertOctagon
                          className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'high' ? 'text-orange-600' : 'text-amber-600'}`} />

                              <span className="font-bold text-slate-900">
                                {alert.type.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span
                          className={`px-2 py-0.5 text-xs font-medium rounded border ${getSeverityColor(alert.severity)}`}>

                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-2">
                              {alert.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              {getTimeAgo(alert.timestamp)} • IP:{' '}
                              {alert.ipAddress}
                            </p>
                          </div>
                          <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveSecurityAlert(alert.id)}>

                            Resolve
                          </Button>
                        </div>
                      </div>
                )}
                  {securityAlerts.filter((a) => !a.resolved).length === 0 &&
                <div className="text-center py-8 text-slate-400">
                      <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No active security alerts</p>
                    </div>
                }
                </div>
              </Card>
            </div>
          }

          {/* API List Tab */}
          {activeTab === 'apis' &&
          <div className="space-y-4">
              {/* Filters */}
              <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                    type="text"
                    placeholder="Search APIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />

                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">

                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* API Table */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          API Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Endpoint
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Success Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Avg Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Last Called
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredAPIs.map((api) =>
                    <tr key={api.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-slate-400" />
                              <span className="font-medium text-sm text-slate-900">
                                {api.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">
                              {api.endpoint}
                            </code>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                          className={`px-2 py-1 text-xs font-medium rounded ${api.method === 'GET' ? 'bg-blue-100 text-blue-700' : api.method === 'POST' ? 'bg-emerald-100 text-emerald-700' : api.method === 'PUT' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>

                              {api.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(api.status)}`}>

                              {api.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                          className={`font-medium ${api.successRate >= 95 ? 'text-emerald-600' : api.successRate >= 90 ? 'text-amber-600' : 'text-red-600'}`}>

                              {api.successRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {api.avgResponseTime}ms
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                            {api.lastCalled ?
                        getTimeAgo(api.lastCalled) :
                        'Never'}
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          }

          {/* Error Logs Tab */}
          {activeTab === 'errors' &&
          <div className="space-y-4">
              {/* Error Filters */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                  value={errorFilter}
                  onChange={(e) => setErrorFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none">

                    <option value="all">All Errors</option>
                    <option value="unresolved">Unresolved Only</option>
                    <option value="4xx">4xx Errors</option>
                    <option value="5xx">5xx Errors</option>
                  </select>
                  <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto gap-2"
                  onClick={handleDownloadErrorReport}>

                    <Download className="w-4 h-4" />
                    Export Errors
                  </Button>
                </div>
              </Card>

              {/* Error List */}
              <div className="space-y-3">
                {filteredErrors.map((error) =>
              <Card key={error.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                    className={`p-2 rounded-lg ${error.errorType === '5xx' ? 'bg-red-100' : 'bg-amber-100'}`}>

                        {error.errorType === '5xx' ?
                    <XCircle className="w-5 h-5 text-red-600" /> :

                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-slate-900">
                            {error.apiName}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded">
                            {error.statusCode}
                          </span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                            {error.errorType}
                          </span>
                          {error.resolved &&
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                              Resolved
                            </span>
                      }
                        </div>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 block mb-2">
                          {error.endpoint}
                        </code>
                        <p className="text-sm text-slate-700 mb-2">
                          {error.errorMessage}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Module: {error.module}</span>
                          <span>•</span>
                          <span>IP: {error.ipAddress}</span>
                          {error.userEmail &&
                      <>
                              <span>•</span>
                              <span>User: {error.userEmail}</span>
                            </>
                      }
                          <span>•</span>
                          <span>
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {!error.resolved &&
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveError(error.id)}>

                          Mark Resolved
                        </Button>
                  }
                    </div>
                  </Card>
              )}
              </div>
            </div>
          }

          {/* Security Tab */}
          {activeTab === 'security' &&
          <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  Security Monitoring
                </h3>
                <div className="space-y-4">
                  {securityAlerts.map((alert) =>
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-2 ${alert.resolved ? 'bg-slate-50 border-slate-200' : alert.severity === 'critical' ? 'bg-red-50 border-red-200' : alert.severity === 'high' ? 'bg-orange-50 border-orange-200' : 'bg-amber-50 border-amber-200'}`}>

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertOctagon
                          className={`w-5 h-5 ${alert.resolved ? 'text-slate-400' : alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'high' ? 'text-orange-600' : 'text-amber-600'}`} />

                            <span className="font-bold text-slate-900">
                              {alert.type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span
                          className={`px-2 py-0.5 text-xs font-medium rounded border ${getSeverityColor(alert.severity)}`}>

                              {alert.severity}
                            </span>
                            {alert.resolved &&
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded border border-emerald-200">
                                Resolved
                              </span>
                        }
                          </div>
                          {alert.apiName &&
                      <p className="text-sm text-slate-600 mb-1">
                              API:{' '}
                              <span className="font-medium">
                                {alert.apiName}
                              </span>
                            </p>
                      }
                          <p className="text-sm text-slate-700 mb-2">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>IP: {alert.ipAddress}</span>
                            {alert.userId &&
                        <>
                                <span>•</span>
                                <span>User ID: {alert.userId}</span>
                              </>
                        }
                            <span>•</span>
                            <span>
                              {new Date(alert.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {alert.actionTaken &&
                      <p className="text-xs text-emerald-700 font-medium mt-2">
                              Action Taken: {alert.actionTaken}
                            </p>
                      }
                        </div>
                        {!alert.resolved &&
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveSecurityAlert(alert.id)}>

                            Resolve
                          </Button>
                    }
                      </div>
                    </div>
                )}
                </div>
              </Card>
            </div>
          }

          {/* Reports Tab */}
          {activeTab === 'reports' &&
          <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-purple-600" />
                  Download Reports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-2">
                      Weekly API Report
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Comprehensive API usage statistics for the past 7 days
                    </p>
                    <Button
                    fullWidth
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDownloadReport('weekly')}>

                      <Download className="w-4 h-4" />
                      Download Weekly Report (CSV)
                    </Button>
                  </div>
                  <div className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-2">
                      Monthly API Report
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Complete API performance data for the past 30 days
                    </p>
                    <Button
                    fullWidth
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleDownloadReport('monthly')}>

                      <Download className="w-4 h-4" />
                      Download Monthly Report (CSV)
                    </Button>
                  </div>
                  <div className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-300 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-2">
                      Error Log Report
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Detailed error logs with status codes and timestamps
                    </p>
                    <Button
                    fullWidth
                    variant="outline"
                    className="gap-2"
                    onClick={handleDownloadErrorReport}>

                      <Download className="w-4 h-4" />
                      Download Error Report (CSV)
                    </Button>
                  </div>
                  <div className="p-4 border-2 border-slate-200 rounded-lg hover:border-slate-300 transition-colors opacity-50">
                    <h4 className="font-bold text-slate-900 mb-2">
                      Security Audit Report
                    </h4>
                    <p className="text-sm text-slate-600 mb-4">
                      Security alerts and incident response logs
                    </p>
                    <Button
                    fullWidth
                    variant="outline"
                    className="gap-2"
                    disabled>

                      <Download className="w-4 h-4" />
                      Coming Soon
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Report Preview */}
              <Card className="p-6">
                <h3 className="font-bold text-slate-900 mb-4">
                  Report Contents
                </h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <p>
                    📊 <strong>API Usage Reports include:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>API name, endpoint, and method</li>
                    <li>Total calls and success rate</li>
                    <li>Average response time</li>
                    <li>Current status (active/inactive/maintenance)</li>
                    <li>Rate limit usage and violations</li>
                  </ul>
                  <p className="mt-4">
                    🚨 <strong>Error Reports include:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Timestamp and error type (4xx/5xx)</li>
                    <li>API endpoint and status code</li>
                    <li>Error message and stack trace</li>
                    <li>User information and IP address</li>
                    <li>Resolution status</li>
                  </ul>
                </div>
              </Card>
            </div>
          }
        </div>
      </div>
    </AdminLayout>);

}