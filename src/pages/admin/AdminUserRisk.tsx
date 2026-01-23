import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Ban,
  Eye } from
'lucide-react';
import { db } from '../../services/database';
import { User, UserProfile, Expense, Goal } from '../../types';
// Mock disposable domains
const DISPOSABLE_DOMAINS = [
'tempmail.com',
'guerrillamail.com',
'10minutemail.com',
'mailinator.com',
'throwawaymail.com'];

interface UserRiskData {
  id: string;
  name: string;
  email: string;
  emailType: 'Valid' | 'Disposable' | 'Suspicious';
  incomeExpenseRatio: number;
  goalCompletion: number;
  trustScore: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Restricted' | 'Flagged';
}
export function AdminUserRisk() {
  const [riskData, setRiskData] = useState<UserRiskData[]>([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    // Load and process data
    const users = db.users.getAll();
    const profiles = db.profiles.getAll ? db.profiles.getAll() : []; // Fallback if getAll not implemented
    const expenses = db.expenses.getAll();
    const goals = db.goals.getAll();
    // Since db.profiles.getAll might not exist in the mock service, we'll iterate users
    const processedData: UserRiskData[] = users.map((user) => {
      const profile = db.profiles.getByUserId(user.id);
      const userExpenses = expenses.filter((e) => e.userId === user.id);
      const userGoals = goals.filter((g) => g.userId === user.id);
      // 1. Email Analysis
      const domain = user.email.split('@')[1];
      let emailType: 'Valid' | 'Disposable' | 'Suspicious' = 'Valid';
      if (DISPOSABLE_DOMAINS.includes(domain)) emailType = 'Disposable';else
      if (domain.length < 5) emailType = 'Suspicious';
      // 2. Income/Expense Ratio
      const monthlyIncome = profile?.monthlyIncome || 0;
      const totalExpenses = userExpenses.reduce((sum, e) => sum + e.amount, 0);
      // Estimate monthly expenses (simple average for demo)
      const monthlyExpenses =
      totalExpenses > 0 ?
      totalExpenses :
      profile?.fixedExpenses ?
      Object.values(profile.fixedExpenses).reduce((a, b) => a + b, 0) :
      0;
      const ratio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 0;
      // 3. Goal Completion
      const completedGoals = userGoals.filter(
        (g) => g.savedAmount >= g.targetAmount
      ).length;
      const goalCompletion =
      userGoals.length > 0 ? completedGoals / userGoals.length * 100 : 0;
      // 4. Trust Score Calculation
      let trustScore: 'Low' | 'Medium' | 'High' = 'High';
      if (emailType === 'Disposable' || ratio > 1.2) trustScore = 'Low';else
      if (emailType === 'Suspicious' || ratio > 0.9) trustScore = 'Medium';
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailType,
        incomeExpenseRatio: ratio,
        goalCompletion,
        trustScore,
        status: trustScore === 'Low' ? 'Flagged' : 'Active'
      };
    });
    setRiskData(processedData);
  }, []);
  const columns = [
  {
    key: 'user',
    label: 'User Details',
    render: (_: any, row: UserRiskData) =>
    <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-500">{row.email}</span>
            {row.emailType === 'Disposable' &&
        <Badge variant="danger" className="text-[10px] px-1 py-0">
                Disposable
              </Badge>
        }
            {row.emailType === 'Suspicious' &&
        <Badge variant="warning" className="text-[10px] px-1 py-0">
                Suspicious
              </Badge>
        }
          </div>
        </div>

  },
  {
    key: 'trustScore',
    label: 'Trust Score',
    render: (value: string) =>
    <Badge
      variant={
      value === 'High' ?
      'success' :
      value === 'Medium' ?
      'warning' :
      'danger'
      }>

          {value} Trust
        </Badge>

  },
  {
    key: 'incomeExpenseRatio',
    label: 'Inc/Exp Ratio',
    render: (value: number) => {
      const percentage = Math.round(value * 100);
      const isHighRisk = percentage > 90;
      return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
              className={`h-full rounded-full ${isHighRisk ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{
                width: `${Math.min(percentage, 100)}%`
              }}>
            </div>
            </div>
            <span
            className={`text-xs font-medium ${isHighRisk ? 'text-red-600' : 'text-slate-600'}`}>

              {percentage}%
            </span>
          </div>);

    }
  },
  {
    key: 'goalCompletion',
    label: 'Goal Success',
    render: (value: number) =>
    <span className="text-sm font-medium text-slate-700">
          {Math.round(value)}%
        </span>

  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_: any, row: UserRiskData) =>
    <div className="flex items-center gap-2">
          <button
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Monitor User">

            <Eye className="w-4 h-4" />
          </button>
          <button
        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        title="Flag Account">

            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Restrict Access">

            <Ban className="w-4 h-4" />
          </button>
        </div>

  }];

  const highRiskCount = riskData.filter((u) => u.trustScore === 'Low').length;
  const disposableCount = riskData.filter(
    (u) => u.emailType === 'Disposable'
  ).length;
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              User Risk & Trust
            </h1>
            <p className="text-slate-500">
              Monitor user behavior, detect fraud, and manage trust scores
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-64" />

            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  High Risk Users
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {highRiskCount}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Disposable Emails
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {disposableCount}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Verified Trust
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {riskData.length - highRiskCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">
              User Risk Analysis
            </h2>
          </div>
          <AdminTable
            columns={columns}
            data={riskData}
            emptyMessage="No user data available for analysis" />

        </div>
      </div>
    </AdminLayout>);

}