import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/database';
import {
  CreditCard,
  ArrowRight,
  Sparkles,
  Target,
  Calendar
} from
  'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  calculateCategoryBreakdown,
  calculateGoalProgress
} from
  '../utils/calculations';
import {
  analyzeSpendingTrends,
  checkNonEssentialLimits,
  checkGoalThreats,
  getEmotionalFeedback
} from
  '../utils/financialIntelligence';
import { SmartWarning } from '../components/SmartWarning';
import { EmotionalFeedback } from '../components/EmotionalFeedback';
import { NetSavingsCard } from '../components/NetSavingsCard';
import { MoneyHealthSection } from '../components/MoneyHealthSection';
import { MarketNewsCard } from '../components/MarketNewsCard';
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
  // Emotional Feedback
  const emotionalFeedback = profile ?
    getEmotionalFeedback(expenses, profile) :
    null;
  // Chart Data
  const expenseData = calculateCategoryBreakdown(expenses).map(
    (item, index) => ({
      ...item,
      color: ['#1a1a2e', '#ff6b6b', '#7eb09b', '#f4a261', '#6b7280'][index % 5]
    })
  );
  return (
    <>
      {/* Welcome Section */}
      <div className={`mb-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="relative overflow-hidden rounded-3xl bg-charcoal p-8 shadow-warm-lg">
          <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sage/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Clean header, removed refresh and label */}
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${localStorage.getItem('fingenius_token')?.startsWith('W1') || !localStorage.getItem('fingenius_token') ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'}`}>
                {localStorage.getItem('fingenius_token')?.length && !localStorage.getItem('fingenius_token')?.startsWith('W1') ? '● Database Connected' : '○ Local Sandbox mode'}
              </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-white/80 text-lg mb-1 font-sans">
              Here's your financial overview for today
            </p>
            <p className="text-white/60 text-sm flex items-center gap-2 font-sans">
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
      {warnings.length > 0 &&
        <div className="space-y-2 mb-8">
          {warnings.map((warning) =>
            <SmartWarning
              key={warning.id}
              warning={warning}
              onDismiss={handleDismissWarning} />

          )}
        </div>
      }

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Net Savings Card */}
          {profile &&
            <div className={isLoaded ? 'animate-fade-in-delay-1' : 'opacity-0'}>
              <NetSavingsCard
                profile={profile}
                expenses={expenses}
                income={income} />

            </div>
          }

          {/* Metrics Grid */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isLoaded ? 'animate-fade-in-delay-1' : 'opacity-0'}`}>

            <MetricCard
              title="Total Expenses"
              value={`₹${totalExpenses.toLocaleString()}`}
              icon={<CreditCard className="w-6 h-6 text-amber-800" />}
              iconBgColor="bg-amber-100" />

            <MetricCard
              title="Active Goals"
              value={goals.
                filter((g) => g.savedAmount < g.targetAmount).
                length.toString()}
              icon={<Target className="w-6 h-6 text-blue-800" />}
              iconBgColor="bg-blue-100" />

          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {emotionalFeedback &&
            <EmotionalFeedback
              type={emotionalFeedback.type}
              message={emotionalFeedback.message}
              emoji={emotionalFeedback.emoji} />

          }

          {/* New Market News Card */}
          <div className={isLoaded ? 'animate-fade-in-delay-2' : 'opacity-0'}>
            <MarketNewsCard />
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isLoaded ? 'animate-fade-in-delay-2' : 'opacity-0'}`}>

        {/* Financial Goals Widget */}
        <Card className="p-7 flex flex-col group hover:shadow-warm-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center shadow-warm-md">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-serif font-bold text-charcoal">
                Financial Goals
              </h3>
            </div>
            <button
              onClick={() => navigate('/goals')}
              className="cursor-pointer">

              <ArrowRight className="w-5 h-5 text-coral group-hover:translate-x-1 transition-transform" />
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

                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span className="text-charcoal">{goal.name}</span>
                      <span className="text-coral">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-coral h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{
                          width: `${progress}%`
                        }}>
                      </div>
                    </div>
                  </div>);

              }) :

              <div className="text-center text-charcoal-400 py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">No goals set yet</p>
                <p className="text-sm">Start planning your financial future!</p>
              </div>
            }
          </div>

          <Button
            variant="primary"
            className="w-full mt-6"
            size="md"
            onClick={() => navigate('/goals')}>

            View All Goals
          </Button>
        </Card>

        {/* Expense Tracking Widget */}
        <Card className="p-7 flex flex-col group hover:shadow-warm-lg transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber rounded-xl flex items-center justify-center shadow-warm-md">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-serif font-bold text-charcoal">
                Expense Breakdown
              </h3>
            </div>
            <button
              onClick={() => navigate('/expenses')}
              className="cursor-pointer">

              <ArrowRight className="w-5 h-5 text-amber group-hover:translate-x-1 transition-transform" />
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
                      formatter={(value: number) => `₹${value}`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        color: '#1a1a2e'
                      }} />

                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2.5 max-h-32 overflow-y-auto">
                  {expenseData.map((item, index) =>
                    <div
                      key={item.name}
                      className={`flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors animate-fade-in`}
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
                        <span className="text-charcoal-600 font-medium">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-bold text-charcoal">
                        ₹{item.value.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </> :

              <div className="flex items-center justify-center h-full text-charcoal-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No expenses yet</p>
                  <p className="text-sm">Start tracking your spending</p>
                </div>
              </div>
            }
          </div>

          <Button
            variant="secondary"
            className="w-full mt-6"
            size="md"
            onClick={() => navigate('/expenses')}>

            View Details
          </Button>
        </Card>
      </div>

      {/* Money Health Section */}
      {profile &&
        <div
          className={`mt-8 ${isLoaded ? 'animate-fade-in-delay-3' : 'opacity-0'}`}>

          <MoneyHealthSection
            expenses={expenses}
            income={income}
            profile={profile} />

        </div>
      }
    </>);

}