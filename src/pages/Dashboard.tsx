import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { MetricCard } from '../components/MetricCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/database';
import {
  TrendingUp,
  CreditCard,
  ArrowRight,
  Sparkles,
  Target,
  PiggyBank,
  Calendar } from
'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid } from
'recharts';
import {
  calculateCategoryBreakdown,
  calculateGoalProgress,
  calculateTotalIncome } from
'../utils/calculations';
import {
  analyzeSpendingTrends,
  checkNonEssentialLimits,
  checkGoalThreats,
  getEmotionalFeedback } from
'../utils/financialIntelligence';
import { SmartWarning } from '../components/SmartWarning';
import { EmotionalFeedback } from '../components/EmotionalFeedback';
import { SmartWarning as SmartWarningType } from '../types';
export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [warnings, setWarnings] = useState<SmartWarningType[]>([]);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  // Fetch real data
  const expenses = user ? db.expenses.getByUserId(user.id) : [];
  const income = user ? db.income.getByUserId(user.id) : [];
  const goals = user ? db.goals.getByUserId(user.id) : [];
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  // Intelligence Logic
  useEffect(() => {
    if (user && profile) {
      const trendWarnings = analyzeSpendingTrends(expenses);
      const limitWarning = checkNonEssentialLimits(expenses, profile);
      const goalWarnings = checkGoalThreats(expenses, goals, profile);
      let allWarnings = [...trendWarnings, ...goalWarnings];
      if (limitWarning) allWarnings.push(limitWarning);
      const dismissed = JSON.parse(
        localStorage.getItem('dismissedWarnings') || '[]'
      );
      allWarnings = allWarnings.filter((w) => !dismissed.includes(w.id));
      setWarnings(allWarnings.slice(0, 3)); // Max 3
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
  // Calculate metrics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExtraIncome = calculateTotalIncome(income);
  let monthlySavings = 0;
  if (profile) {
    if (profile.type === 'student') {
      monthlySavings =
      (profile.weeklyPocketMoney || 0) * 4 + totalExtraIncome - totalExpenses;
    } else {
      const fixed = Object.values(profile.fixedExpenses || {}).reduce(
        (a, b) => a + b,
        0
      );
      monthlySavings =
      (profile.monthlyIncome || 0) + totalExtraIncome - fixed - totalExpenses;
    }
  }
  // Calculate last month's savings for comparison
  const now = new Date();
  const lastMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === (now.getMonth() === 0 ? 11 : now.getMonth() - 1) &&
      d.getFullYear() === (
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()));

  });
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const lastMonthSavings = profile ?
  profile.type === 'student' ?
  (profile.weeklyPocketMoney || 0) * 4 - lastMonthTotal :
  (profile.monthlyIncome || 0) -
  Object.values(profile.fixedExpenses || {}).reduce((a, b) => a + b, 0) -
  lastMonthTotal :
  0;
  const savingsTrend =
  lastMonthSavings > 0 ?
  (monthlySavings - lastMonthSavings) / lastMonthSavings * 100 :
  0;
  const hasPreviousData = lastMonthExpenses.length > 0;
  // Calculate monthly savings capacity
  const monthlySavingsCapacity = profile ?
  profile.type === 'student' ?
  ((profile.weeklyPocketMoney || 0) - (profile.weeklyExpenses || 0)) * 4 :
  (profile.monthlyIncome || 0) -
  Object.values(profile.fixedExpenses || {}).reduce((a, b) => a + b, 0) -
  Object.values(profile.loans || {}).reduce((a, b) => a + b, 0) - (
  profile.sipCommitments || 0) -
  totalExpenses :
  0;
  // Emotional Feedback
  const emotionalFeedback = profile ?
  getEmotionalFeedback(expenses, profile) :
  null;
  // Chart Data
  const expenseData = calculateCategoryBreakdown(expenses).map(
    (item, index) => ({
      ...item,
      color: ['#1e3a8a', '#057a55', '#d97706', '#581c87', '#dc2626'][index % 5]
    })
  );
  // Savings trend data (mocked for demo)
  const savingsTrendData = [
  {
    month: 'Jan',
    amount: 15000
  },
  {
    month: 'Feb',
    amount: 18000
  },
  {
    month: 'Mar',
    amount: 22000
  },
  {
    month: 'Apr',
    amount: 25000
  },
  {
    month: 'May',
    amount: 28000
  },
  {
    month: 'Jun',
    amount: Math.max(0, monthlySavings)
  }];

  return (
    <Layout>
      {/* Welcome Section */}
      <div className={`mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-royal-600 via-midnight-600 to-royal-700 p-8 shadow-royal">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-gold-400" />
              <span className="text-gold-400 text-sm font-semibold">
                AI-Powered Insights
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-white/80 text-lg mb-1">
              Here's your financial overview for today
            </p>
            <p className="text-white/60 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      <div className="space-y-2 mb-8">
        {warnings.map((warning) =>
        <SmartWarning
          key={warning.id}
          warning={warning}
          onDismiss={handleDismissWarning} />

        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* Metrics Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isLoaded ? 'animate-fade-in-delay-1' : 'opacity-0'}`}>

            <MetricCard
              title="Net Savings"
              value={`₹${Math.max(0, monthlySavings).toLocaleString()}`}
              trend={hasPreviousData ? Math.round(savingsTrend) : undefined}
              trendLabel={hasPreviousData ? 'vs last month' : 'this month'}
              icon={<PiggyBank className="w-6 h-6 text-emerald-600" />}
              iconBgColor="bg-gradient-to-br from-emerald-50 to-emerald-100" />

            <MetricCard
              title="Total Expenses"
              value={`₹${totalExpenses.toLocaleString()}`}
              trend={-3}
              trendLabel="reduced spending"
              icon={<CreditCard className="w-6 h-6 text-gold-600" />}
              iconBgColor="bg-gradient-to-br from-gold-50 to-gold-100" />

          </div>
        </div>

        <div className="lg:col-span-1">
          {emotionalFeedback &&
          <EmotionalFeedback
            type={emotionalFeedback.type}
            message={emotionalFeedback.message}
            emoji={emotionalFeedback.emoji} />

          }
        </div>
      </div>

      {/* Widgets Grid */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isLoaded ? 'animate-fade-in-delay-2' : 'opacity-0'}`}>

        {/* Financial Goals Widget */}
        <Card className="p-7 flex flex-col group hover:shadow-royal" gradient>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-royal-600 to-midnight-600 rounded-xl flex items-center justify-center shadow-soft">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Financial Goals
              </h3>
            </div>
            <button
              onClick={() => navigate('/goals')}
              className="cursor-pointer">

              <ArrowRight className="w-5 h-5 text-royal-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="space-y-5 flex-1">
            {goals.length > 0 ?
            goals.slice(0, 3).map((goal, index) => {
              const progress = calculateGoalProgress(goal);
              return (
                <div
                  key={goal.id}
                  className={`animate-fade-in`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}>

                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-slate-900">{goal.name}</span>
                      <span className="text-royal-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                      className="bg-gradient-to-r from-royal-600 to-midnight-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{
                        width: `${progress}%`
                      }}>
                    </div>
                    </div>
                  </div>);

            }) :

            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-medium">No goals set yet</p>
                <p className="text-sm">Start planning your financial future!</p>
              </div>
            }
          </div>

          <Button
            variant="royal"
            className="w-full mt-6"
            size="md"
            onClick={() => navigate('/goals')}>

            View All Goals
          </Button>
        </Card>

        {/* Expense Tracking Widget */}
        <Card className="p-7 flex flex-col group hover:shadow-royal" gradient>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-600 to-gold-700 rounded-xl flex items-center justify-center shadow-soft">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Expense Breakdown
              </h3>
            </div>
            <button
              onClick={() => navigate('/expenses')}
              className="cursor-pointer">

              <ArrowRight className="w-5 h-5 text-gold-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex-1 min-h-[200px] relative">
            {expenseData.length > 0 ?
            <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value">

                      {expenseData.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                    </Pie>
                    <Tooltip
                    formatter={(value) => `₹${value}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }} />

                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2.5 max-h-32 overflow-y-auto">
                  {expenseData.map((item, index) =>
                <div
                  key={item.name}
                  className={`flex justify-between items-center text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors animate-fade-in`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}>

                      <div className="flex items-center gap-2">
                        <span
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{
                        backgroundColor: item.color
                      }}>
                    </span>
                        <span className="text-slate-700 font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₹{item.value.toLocaleString()}
                      </span>
                    </div>
                )}
                </div>
              </> :

            <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium">No expenses yet</p>
                  <p className="text-sm">Start tracking your spending</p>
                </div>
              </div>
            }
          </div>

          <Button
            variant="gold"
            className="w-full mt-6"
            size="md"
            onClick={() => navigate('/expenses')}>

            View Details
          </Button>
        </Card>
      </div>

      {/* Savings Trend Chart */}
      {monthlySavings > 0 &&
      <Card
        className={`p-7 mt-6 ${isLoaded ? 'animate-fade-in-delay-3' : 'opacity-0'}`}
        gradient>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-soft">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Savings Trend
              </h3>
              <p className="text-sm text-slate-600">
                Your financial progress over time
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={savingsTrendData}>
              <defs>
                <linearGradient
                id="savingsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1">

                  <stop offset="5%" stopColor="#057a55" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#057a55" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
              dataKey="month"
              stroke="#64748b"
              fontSize={12}
              fontWeight={600} />

              <YAxis stroke="#64748b" fontSize={12} fontWeight={600} />
              <Tooltip
              formatter={(value) => [`₹${value}`, 'Savings']}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }} />

              <Line
              type="monotone"
              dataKey="amount"
              stroke="#057a55"
              strokeWidth={3}
              dot={{
                fill: '#057a55',
                r: 5,
                strokeWidth: 2,
                stroke: '#fff'
              }}
              activeDot={{
                r: 7
              }}
              fill="url(#savingsGradient)" />

            </LineChart>
          </ResponsiveContainer>
        </Card>
      }
    </Layout>);

}