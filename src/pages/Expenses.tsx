import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Upload,
  Save,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet } from
'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { Expense, Income, SmartWarning as SmartWarningType } from '../types';
import {
  analyzeSpendingTrends,
  checkNonEssentialLimits } from
'../utils/financialIntelligence';
import { SmartWarning } from '../components/SmartWarning';
import { ExpenseImportModal } from '../components/ExpenseImportModal';
import {
  calculateTotalExpenses,
  calculateTotalIncome } from
'../utils/calculations';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';
export function Expenses() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');
  const [expenses, setExpenses] = useState<Expense[]>(
    user ? db.expenses.getByUserId(user.id) : []
  );
  const [incomes, setIncomes] = useState<Income[]>(
    user ? db.income.getByUserId(user.id) : []
  );
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  const [warnings, setWarnings] = useState<SmartWarningType[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  // Expense Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'essential' | 'non-essential'>('essential');
  const [description, setDescription] = useState('');
  // Income Form State
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [incomeDate, setIncomeDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [incomeDescription, setIncomeDescription] = useState('');
  // Success Message
  const [successMsg, setSuccessMsg] = useState('');
  useEffect(() => {
    if (user && profile) {
      const trendWarnings = analyzeSpendingTrends(expenses);
      const limitWarning = checkNonEssentialLimits(expenses, profile);
      let allWarnings = [...trendWarnings];
      if (limitWarning) allWarnings.push(limitWarning);
      const dismissed = JSON.parse(
        localStorage.getItem('dismissedWarnings') || '[]'
      );
      allWarnings = allWarnings.filter((w) => !dismissed.includes(w.id));
      setWarnings(allWarnings);
    }
  }, [user, expenses.length]);
  const handleDismissWarning = (id: string) => {
    setWarnings((prev) => prev.filter((w) => w.id !== id));
    const dismissed = JSON.parse(
      localStorage.getItem('dismissedWarnings') || '[]'
    );
    dismissed.push(id);
    localStorage.setItem('dismissedWarnings', JSON.stringify(dismissed));
  };
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      userId: user.id,
      amount: parseFloat(amount),
      category,
      date,
      type,
      description,
      createdAt: new Date().toISOString()
    };
    db.expenses.create(newExpense);
    setExpenses(db.expenses.getByUserId(user.id));
    setAmount('');
    setDescription('');
    showSuccess('Expense logged successfully!');
  };
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newIncome: Income = {
      id: crypto.randomUUID(),
      userId: user.id,
      amount: parseFloat(incomeAmount),
      source: incomeSource,
      date: incomeDate,
      description: incomeDescription,
      createdAt: new Date().toISOString()
    };
    db.income.create(newIncome);
    setIncomes(db.income.getByUserId(user.id));
    setIncomeAmount('');
    setIncomeSource('');
    setIncomeDescription('');
    showSuccess('Income added successfully!');
  };
  const handleDeleteExpense = (id: string) => {
    db.expenses.delete(id);
    if (user) setExpenses(db.expenses.getByUserId(user.id));
  };
  const handleDeleteIncome = (id: string) => {
    db.income.delete(id);
    if (user) setIncomes(db.income.getByUserId(user.id));
  };
  const handleDeleteAllExpenses = () => {
    if (!user) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete all ${expenses.length} expenses? This action cannot be undone.`
    );
    if (confirmed) {
      expenses.forEach((expense) => db.expenses.delete(expense.id));
      setExpenses([]);
      showSuccess('All expenses deleted successfully!');
    }
  };
  const handleImportExpenses = (importedExpenses: Partial<Expense>[]) => {
    if (!user) return;
    importedExpenses.forEach((exp) => {
      db.expenses.create({
        ...exp,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString()
      } as Expense);
    });
    setExpenses(db.expenses.getByUserId(user.id));
    showSuccess(`Imported ${importedExpenses.length} expenses successfully!`);
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const parsed = parseExpenseCSV(content, user.id);
        parsed.forEach((exp) => {
          db.expenses.create({
            ...exp,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString()
          } as Expense);
        });
        setExpenses(db.expenses.getByUserId(user.id));
        showSuccess(`Imported ${parsed.length} expenses successfully!`);
      };
      reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      showSuccess(
        'Excel file upload coming soon! Please use CSV format for now.'
      );
    } else if (fileExtension === 'pdf') {
      showSuccess('PDF file upload coming soon! Please use CSV format for now.');
    } else {
      alert(
        'Unsupported file format. Please upload CSV, Excel (.xlsx, .xls), or PDF files.'
      );
    }
  };
  const totalExpenses = calculateTotalExpenses(expenses);
  const totalIncome = calculateTotalIncome(incomes);
  // Prepare chart data
  const categoryData = expenses.reduce(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    },
    {} as Record<string, number>
  );
  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value
  }));
  const COLORS = [
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899'];

  return (
    <Layout>
      {/* Success Notification */}
      {successMsg &&
      <div className="fixed top-24 right-8 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in z-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          {successMsg}
        </div>
      }

      {/* Warnings Section */}
      <div className="space-y-2 mb-8">
        {warnings.map((warning) =>
        <SmartWarning
          key={warning.id}
          warning={warning}
          onDismiss={handleDismissWarning} />

        )}
      </div>

      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">Manage your cash flow and expenses</p>
        </div>

        <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'expenses' ? 'bg-red-50 text-red-600 shadow-sm ring-1 ring-red-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>

            <ArrowUpCircle className="w-4 h-4" />
            Money Out
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'income' ? 'bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>

            <ArrowDownCircle className="w-4 h-4" />
            Money In
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-red-50 to-white border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-red-800">
              Total Expenses
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totalExpenses.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-emerald-800">
              Total Received
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{totalIncome.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-blue-800">
              Net Cash Flow
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

            {totalIncome - totalExpenses >= 0 ? '+' : ''}₹
            {(totalIncome - totalExpenses).toLocaleString()}
          </p>
        </Card>
      </div>

      {activeTab === 'expenses' ?
      <>
          {/* Upload Section */}
          <div className="mb-8 animate-fade-in">
            <div
            onClick={() => setShowImportModal(true)}
            className="border-2 border-dashed border-red-200 bg-red-50/50 rounded-lg p-8 text-center hover:bg-red-50 transition-colors cursor-pointer group">

              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Upload External Expenses
                </h3>
                <p className="text-gray-500 text-sm">
                  Import expenses from CSV, Excel (.xlsx, .xls), or PDF files
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Click to open import wizard
                </p>
              </div>
            </div>
          </div>

          {/* Import Modal */}
          {showImportModal && user &&
        <ExpenseImportModal
          userId={user.id}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportExpenses} />

        }

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Log Expense Form */}
            <div className="lg:col-span-1">
              <Card className="p-8 sticky top-24 border-t-4 border-t-red-500">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ArrowUpCircle className="w-5 h-5 text-red-500" />
                  Log Expense
                </h2>

                <form className="space-y-6" onSubmit={handleAddExpense}>
                  <Input
                  label="Amount (₹)"
                  placeholder="₹500"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required />


                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required>

                      <option value="">Select a category</option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Housing">Housing</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>

                  <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min="2000-01-01"
                  max="3000-12-31"
                  required />


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Type
                    </label>
                    <div className="flex items-center space-x-6 mt-2">
                      <label className="flex items-center cursor-pointer group">
                        <input
                        type="radio"
                        name="expenseType"
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        checked={type === 'essential'}
                        onChange={() => setType('essential')} />

                        <span className="ml-2 text-sm text-gray-700 group-hover:text-red-600 transition-colors">
                          Essential
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                        type="radio"
                        name="expenseType"
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        checked={type === 'non-essential'}
                        onChange={() => setType('non-essential')} />

                        <span className="ml-2 text-sm text-gray-700 group-hover:text-red-600 transition-colors">
                          Non-Essential
                        </span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Weekly grocery shopping"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}>
                  </textarea>
                  </div>

                  <Button
                  type="submit"
                  fullWidth
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                  disabled={!amount || !category}>

                    <Save className="w-4 h-4" />
                    Save Expense
                  </Button>
                </form>
              </Card>
            </div>

            {/* Expense List and Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Expense Chart */}
              {expenses.length > 0 &&
            <Card className="p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Expense Breakdown
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value">

                        {chartData.map((entry, index) =>
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} />

                    )}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
            }

              {/* Expense List */}
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Expenses
                  </h2>
                  {expenses.length > 0 &&
                <Button
                  onClick={handleDeleteAllExpenses}
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 border-red-200">

                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All
                    </Button>
                }
                </div>

                {expenses.length === 0 ?
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ArrowUpCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No expenses logged yet.
                    </p>
                  </div> :

              <div className="space-y-4">
                    {expenses.
                slice().
                reverse().
                map((expense, index) => {
                  const expenseDate = new Date(expense.date);
                  const isValidDate = !isNaN(expenseDate.getTime());
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-red-50/30 hover:border-red-100 transition-all group animate-fade-in"
                      style={{
                        animationDelay: `${index * 0.05}s`
                      }}>

                            <div className="flex items-center gap-4">
                              <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${expense.type === 'essential' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>

                                {expense.category.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {expense.category}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {expense.description} •{' '}
                                  {isValidDate ?
                            expenseDate.toLocaleDateString() :
                            'Date not available'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-red-600">
                                -₹{expense.amount.toLocaleString()}
                              </span>
                              <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">

                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>);

                })}
                  </div>
              }
              </Card>
            </div>
          </div>
        </> :

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Log Income Form */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-24 border-t-4 border-t-emerald-500">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                Add Money Received
              </h2>

              <form className="space-y-6" onSubmit={handleAddIncome}>
                <Input
                label="Amount (₹)"
                placeholder="₹5000"
                type="number"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                required />


                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  required>

                    <option value="">Select source</option>
                    <option value="Salary">Salary</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Gift">Gift</option>
                    <option value="Refund">Refund</option>
                    <option value="Family Support">Family Support</option>
                    <option value="Investment Return">Investment Return</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <Input
                label="Date"
                type="date"
                value={incomeDate}
                onChange={(e) => setIncomeDate(e.target.value)}
                min="2000-01-01"
                max="3000-12-31"
                required />


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Birthday gift from grandma"
                  value={incomeDescription}
                  onChange={(e) => setIncomeDescription(e.target.value)}>
                </textarea>
                </div>

                <Button
                type="submit"
                fullWidth
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={!incomeAmount || !incomeSource}>

                  <Save className="w-4 h-4" />
                  Add Income
                </Button>
              </form>
            </Card>
          </div>

          {/* Income List */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Recent Inflow
              </h2>

              {incomes.length === 0 ?
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArrowDownCircle className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No income recorded yet.
                  </p>
                </div> :

            <div className="space-y-4">
                  {incomes.
              slice().
              reverse().
              map((income, index) =>
              <div
                key={income.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-emerald-50/30 hover:border-emerald-100 transition-all group animate-fade-in"
                style={{
                  animationDelay: `${index * 0.05}s`
                }}>

                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-emerald-100 text-emerald-600">
                            {income.source.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {income.source}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {income.description} •{' '}
                              {new Date(income.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-emerald-600">
                            +₹{income.amount.toLocaleString()}
                          </span>
                          <button
                    onClick={() => handleDeleteIncome(income.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">

                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
              )}
                </div>
            }
            </Card>
          </div>
        </div>
      }
    </Layout>);

}