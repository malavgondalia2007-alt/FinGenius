import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminMetricCard } from '../../components/admin/AdminMetricCard';
import { AdminTable } from '../../components/admin/AdminTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Database, CreditCard, Target, TrendingUp, Filter } from 'lucide-react';
import { db } from '../../services/database';
import { Expense, Goal, Investment, User } from '../../types';
type TabType = 'expenses' | 'goals' | 'investments';
export function AdminData() {
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  useEffect(() => {
    setUsers(db.users.getAll());
    setExpenses(db.expenses.getAll());
    setGoals(db.goals.getAll());
    setInvestments(db.investments.getAll());
  }, []);
  // Helper to get user name
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Unknown User';
  };
  // Data with user names
  const expensesData = expenses.map((e) => ({
    ...e,
    userName: getUserName(e.userId)
  }));
  const goalsData = goals.map((g) => ({
    ...g,
    userName: getUserName(g.userId)
  }));
  const investmentsData = investments.map((i) => ({
    ...i,
    userName: getUserName(i.userId)
  }));
  const expenseColumns = [
  {
    key: 'date',
    label: 'Date',
    render: (date: string) => new Date(date).toLocaleDateString()
  },
  {
    key: 'userName',
    label: 'User'
  },
  {
    key: 'category',
    label: 'Category'
  },
  {
    key: 'description',
    label: 'Description'
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (amount: number) => `₹${amount.toLocaleString()}`
  },
  {
    key: 'type',
    label: 'Type',
    render: (type: string) =>
    <Badge variant={type === 'essential' ? 'info' : 'warning'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>

  }];

  const goalColumns = [
  {
    key: 'createdAt',
    label: 'Created',
    render: (date: string) => new Date(date).toLocaleDateString()
  },
  {
    key: 'userName',
    label: 'User'
  },
  {
    key: 'name',
    label: 'Goal Name'
  },
  {
    key: 'category',
    label: 'Category'
  },
  {
    key: 'targetAmount',
    label: 'Target',
    render: (amount: number) => `₹${amount.toLocaleString()}`
  },
  {
    key: 'savedAmount',
    label: 'Saved',
    render: (amount: number) => `₹${amount.toLocaleString()}`
  },
  {
    key: 'deadline',
    label: 'Deadline',
    render: (date: string) => new Date(date).toLocaleDateString()
  }];

  const investmentColumns = [
  {
    key: 'date',
    label: 'Date',
    render: (date: string) => new Date(date).toLocaleDateString()
  },
  {
    key: 'userName',
    label: 'User'
  },
  {
    key: 'fundName',
    label: 'Fund / Asset'
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (amount: number) => `₹${amount.toLocaleString()}`
  },
  {
    key: 'type',
    label: 'Type',
    render: (type: string) =>
    <Badge variant="info">{type.toUpperCase()}</Badge>

  },
  {
    key: 'risk',
    label: 'Risk',
    render: (risk: string) =>
    <Badge
      variant={
      risk === 'High' ?
      'danger' :
      risk === 'Moderate' ?
      'warning' :
      'success'
      }>

          {risk}
        </Badge>

  }];

  const totalExpensesAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestmentsAmount = investments.reduce(
    (sum, i) => sum + i.amount,
    0
  );
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Data Management
          </h1>
          <p className="text-slate-500">
            View and manage user-generated financial data
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminMetricCard
            title="Total Expenses Logged"
            value={`₹${(totalExpensesAmount / 1000).toFixed(1)}K`}
            icon={CreditCard}
            iconBgColor="bg-red-100" />

          <AdminMetricCard
            title="Active Goals"
            value={goals.length}
            icon={Target}
            iconBgColor="bg-emerald-100" />

          <AdminMetricCard
            title="Total Investments"
            value={`₹${(totalInvestmentsAmount / 1000).toFixed(1)}K`}
            icon={TrendingUp}
            iconBgColor="bg-blue-100" />

        </div>

        {/* Tabs & Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'expenses' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>

                Expenses ({expenses.length})
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'goals' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>

                Goals ({goals.length})
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'investments' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>

                Investments ({investments.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter Data
              </Button>
            </div>

            {activeTab === 'expenses' &&
            <AdminTable
              columns={expenseColumns}
              data={expensesData}
              emptyMessage="No expenses recorded yet." />

            }
            {activeTab === 'goals' &&
            <AdminTable
              columns={goalColumns}
              data={goalsData}
              emptyMessage="No goals created yet." />

            }
            {activeTab === 'investments' &&
            <AdminTable
              columns={investmentColumns}
              data={investmentsData}
              emptyMessage="No investments recorded yet." />

            }
          </div>
        </div>
      </div>
    </AdminLayout>);

}