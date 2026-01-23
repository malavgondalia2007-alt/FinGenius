import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { Button } from '../../components/ui/Button';
import {
  Activity,
  ShieldAlert,
  Users,
  Zap,
  RefreshCw,
  PauseCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle } from
'lucide-react';
import { db } from '../../services/database';
import { useNavigate } from 'react-router-dom';
import { AdminLog } from '../../types';
export function AdminControlCenter() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalUsers: 0,
    systemHealth: 100,
    riskScore: 'Low',
    apiCalls: 0
  });
  const [recentActivity, setRecentActivity] = useState<AdminLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadData = () => {
    // Get all users
    const users = db.users.getAll();
    // Calculate active users (logged in within last 24 hours)
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const activeUsers = users.filter((u) => {
      if (!u.lastActive) return false;
      return new Date(u.lastActive).getTime() > oneDayAgo;
    }).length;
    // Calculate system health based on data integrity
    const expenses = db.expenses.getAll();
    const goals = db.goals.getAll();
    const profiles = users.
    map((u) => db.profiles.getByUserId(u.id)).
    filter(Boolean);
    let healthScore = 100;
    // Reduce health if there are issues
    if (users.length > 0 && profiles.length < users.length) {
      healthScore -= 10; // Some users missing profiles
    }
    // Calculate risk score based on user spending patterns
    let totalRiskScore = 0;
    let riskCount = 0;
    users.forEach((user) => {
      const userExpenses = expenses.filter((e) => e.userId === user.id);
      const profile = db.profiles.getByUserId(user.id);
      if (profile && userExpenses.length > 0) {
        const totalExpenses = userExpenses.reduce((sum, e) => sum + e.amount, 0);
        const income =
        profile.type === 'student' ?
        (profile.weeklyPocketMoney || 0) * 4 :
        profile.monthlyIncome || 0;
        if (income > 0) {
          const spendingRatio = totalExpenses / income;
          if (spendingRatio > 0.9)
          totalRiskScore += 3; // High risk
          else if (spendingRatio > 0.7)
          totalRiskScore += 2; // Medium risk
          else totalRiskScore += 1; // Low risk
          riskCount++;
        }
      }
    });
    const avgRisk = riskCount > 0 ? totalRiskScore / riskCount : 1;
    const riskScore = avgRisk > 2.5 ? 'High' : avgRisk > 1.5 ? 'Medium' : 'Low';
    // Calculate API calls (simulated based on recent activity)
    const logs = db.admin.getActivityLogs(100);
    const recentLogs = logs.filter((log) => {
      return new Date(log.timestamp).getTime() > now - 60000; // Last minute
    });
    const apiCalls = Math.max(
      recentLogs.length * 10,
      Math.floor(Math.random() * 50) + 100
    );
    setStats({
      activeUsers,
      totalUsers: users.length,
      systemHealth: healthScore,
      riskScore,
      apiCalls
    });
    // Get recent activity
    setRecentActivity(db.admin.getActivityLogs(5));
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
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'error':
        return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };
  const getTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min ago`;
    return 'Just now';
  };
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              Control Center
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </h1>
            <p className="text-slate-500">
              System monitoring and governance overview • Live data
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

              Refresh Data
            </Button>
            <Button variant="danger" size="sm" className="gap-2">
              <PauseCircle className="w-4 h-4" />
              Emergency Pause
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AdminMetricCard
            title="Active Users"
            value={stats.activeUsers}
            subtitle={`of ${stats.totalUsers} total`}
            icon={Users}
            iconBgColor="bg-blue-100" />

          <AdminMetricCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            subtitle={stats.systemHealth >= 95 ? 'Excellent' : 'Good'}
            icon={Activity}
            iconBgColor="bg-emerald-100" />

          <AdminMetricCard
            title="Global Risk Score"
            value={stats.riskScore}
            subtitle="User spending analysis"
            icon={ShieldAlert}
            iconBgColor={
            stats.riskScore === 'High' ?
            'bg-red-100' :
            stats.riskScore === 'Medium' ?
            'bg-amber-100' :
            'bg-emerald-100'
            } />

          <AdminMetricCard
            title="API Activity"
            value={stats.apiCalls}
            subtitle="requests/min"
            icon={Zap}
            iconBgColor="bg-purple-100" />

        </div>

        {/* Recent Activity Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            Recent Activity
            <span className="ml-auto text-xs font-normal text-slate-500">
              Auto-refreshes every 30s
            </span>
          </h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ?
            recentActivity.map((activity) =>
            <div
              key={activity.id}
              className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">

                  <div className="flex items-center gap-2">
                    {getStatusIcon(activity.status)}
                    <span className="text-xs font-medium text-slate-700">
                      {activity.action}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {activity.target}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>
            ) :

            <div className="text-center py-8 text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No recent activity</p>
              </div>
            }
          </div>
          <button
            onClick={() => navigate('/admin/logs')}
            className="w-full mt-4 pt-4 border-t border-slate-100 text-xs text-purple-600 font-medium hover:text-purple-700 transition-colors">

            View All Activity →
          </button>
        </div>
      </div>
    </AdminLayout>);

}