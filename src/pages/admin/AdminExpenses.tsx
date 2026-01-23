import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminTable } from '../../components/admin/AdminTable';
import { db } from '../../services/database';
import { Expense, User } from '../../types';
export function AdminExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    setExpenses(db.expenses.getAll());
    setUsers(db.users.getAll());
  }, []);
  // Create a map of userId to user name for quick lookup
  const userMap = users.reduce(
    (map, user) => {
      map[user.id] = user.name;
      return map;
    },
    {} as Record<string, string>
  );
  // Prepare data for table with user names
  const expensesWithUserNames = expenses.
  map((expense) => ({
    ...expense,
    userName: userMap[expense.userId] || 'Unknown User'
  })).
  sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const columns = [
  {
    key: 'date',
    label: 'Date',
    render: (value: string) => new Date(value).toLocaleDateString()
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
    key: 'type',
    label: 'Type',
    render: (value: string) =>
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'essential' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>

          {value === 'essential' ? 'Essential' : 'Non-Essential'}
        </span>

  },
  {
    key: 'amount',
    label: 'Amount',
    render: (value: number) =>
    <span className="font-semibold text-slate-900">
          ₹{value.toLocaleString()}
        </span>

  }];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Global Expenses
            </h1>
            <p className="text-slate-500">
              All user expenses across the platform
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Expenses</p>
            <p className="text-2xl font-bold text-slate-900">
              ₹{totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Table */}
        <AdminTable
          columns={columns}
          data={expensesWithUserNames}
          emptyMessage="No expenses recorded yet" />

      </div>
    </AdminLayout>);

}