import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { TrendingUp, Sparkles, Flame } from 'lucide-react';
import { Expense, Income, UserProfile } from '../types';
interface MoneyHealthSectionProps {
  expenses: Expense[];
  income: Income[];
  profile: UserProfile;
}
export function MoneyHealthSection({
  expenses,
  income,
  profile
}: MoneyHealthSectionProps) {
  // Calculate monthly data for the last 6 months
  const monthlyData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Generate last 6 months (including current)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      const monthName = date.
      toLocaleString('default', {
        month: 'short'
      }).
      toUpperCase();
      const isCurrentMonth = i === 0;
      // Calculate Income
      let monthlyIncome = 0;
      if (profile.type === 'student') {
        monthlyIncome = (profile.weeklyPocketMoney || 0) * 4;
      } else {
        monthlyIncome = profile.monthlyIncome || 0;
      }
      // Add extra income for this specific month
      const extraIncome = income.
      filter((inc) => {
        const d = new Date(inc.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }).
      reduce((sum, inc) => sum + inc.amount, 0);
      const totalIncome = monthlyIncome + extraIncome;
      // Calculate Expenses
      let fixedExpenses = 0;
      if (profile.type === 'employee') {
        const fixed = Object.values(profile.fixedExpenses || {}).reduce(
          (a, b) => a + b,
          0
        );
        const loans = Object.values(profile.loans || {}).reduce(
          (a, b) => a + b,
          0
        );
        const sip = profile.sipCommitments || 0;
        fixedExpenses = fixed + loans + sip;
      } else {
        fixedExpenses = (profile.weeklyExpenses || 0) * 4;
      }
      const trackedExpenses = expenses.
      filter((exp) => {
        const d = new Date(exp.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }).
      reduce((sum, exp) => sum + exp.amount, 0);
      const totalExpenses = fixedExpenses + trackedExpenses;
      const savings = totalIncome - totalExpenses;
      const savingsRatio = totalIncome > 0 ? savings / totalIncome : 0;
      // Determine status and emoji
      let status: 'great' | 'good' | 'tight' | 'overspent' = 'good';
      let emoji = '😊';
      if (savings < 0) {
        status = 'overspent';
        emoji = '😰';
      } else if (savingsRatio < 0.1) {
        status = 'tight';
        emoji = '🥴';
      } else if (savingsRatio < 0.3) {
        status = 'good';
        emoji = '😊';
      } else {
        status = 'great';
        emoji = '🌟';
      }
      // If no tracked expenses and it's not current month, might be "No data"
      const hasData = trackedExpenses > 0 || isCurrentMonth;
      data.push({
        month: monthName,
        year,
        savings,
        savingsRatio,
        status,
        emoji,
        isCurrentMonth,
        hasData
      });
    }
    return data;
  }, [expenses, income, profile]);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const lastMonth = monthlyData[monthlyData.length - 2];
  const isBetterThanLastMonth = currentMonth.savings > lastMonth.savings;
  return (
    <Card className="p-6 md:p-8 bg-white border-none shadow-warm-lg">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-charcoal-900 mb-1">
            Your Money Health
          </h2>
          <p className="text-charcoal-500 text-sm">
            How you did each month - simple and clear
          </p>
        </div>
      </div>

      {/* Summary Banner */}
      <div
        className={`rounded-2xl p-6 mb-8 flex items-start gap-4 ${currentMonth.savings >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>

        <div className="text-2xl mt-1">
          {currentMonth.savings >= 0 ? '🎉' : '⚠️'}
        </div>
        <div>
          <h3
            className={`text-lg font-bold mb-1 ${currentMonth.savings >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>

            {currentMonth.savings >= 0 ?
            `Great! You saved ₹${currentMonth.savings.toLocaleString()} this month` :
            `Alert! You overspent by ₹${Math.abs(currentMonth.savings).toLocaleString()} this month`}
          </h3>
          <div className="flex items-center gap-2 text-sm font-medium opacity-80">
            {isBetterThanLastMonth ?
            <>
                <TrendingUp className="w-4 h-4" />
                <span>You're doing better than last month!</span>
              </> :

            <span>Keep tracking to improve your savings!</span>
            }
          </div>
        </div>
      </div>

      {/* Monthly Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 overflow-x-auto pb-2">
        {monthlyData.map((data, index) =>
        <div
          key={`${data.month}-${data.year}`}
          className={`
              relative flex flex-col items-center p-4 rounded-2xl border min-w-[120px] transition-all duration-300
              ${data.isCurrentMonth ? 'border-indigo-200 bg-indigo-50/30 shadow-sm scale-105 z-10' : 'border-gray-100 bg-white hover:border-gray-200'}
            `}>

            {/* Month Label */}
            <span className="text-xs font-bold text-indigo-900 mb-1 tracking-wider">
              {data.month}
            </span>
            <div className="w-6 h-1 bg-indigo-100 rounded-full mb-4"></div>

            {/* Content */}
            {data.hasData ?
          <>
                <div
              className="text-3xl mb-4 filter drop-shadow-sm transform hover:scale-110 transition-transform cursor-default"
              title={`${data.status} month`}>

                  {data.emoji}
                </div>

                {/* Mini Bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
                  <div
                className={`h-full rounded-full ${data.savings >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                style={{
                  width: `${Math.min(100, Math.abs(data.savingsRatio * 100))}%`
                }}>
              </div>
                </div>

                <div
              className={`text-xs font-bold ${data.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                  {data.savings >= 0 ? '+' : '-'}₹
                  {Math.abs(data.savings).toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                  {data.savings >= 0 ? 'saved' : 'deficit'}
                </div>
              </> :

          <div className="flex flex-col items-center justify-center h-full py-4 opacity-50">
                <div className="w-12 h-12 rounded-full bg-gray-50 mb-2"></div>
                <span className="text-xs text-gray-400">No data</span>
                <span className="text-xs text-gray-300 mt-1">-</span>
              </div>
          }
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 py-4 border-t border-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="text-lg">🌟</span> Great month
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="text-lg">😊</span> Good savings
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="text-lg">🥴</span> Tight month
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="text-lg">😰</span> Overspent
        </div>
      </div>

      {/* Quick Tip */}
      <div className="bg-orange-50 rounded-xl p-5 border border-orange-100 flex items-start gap-3">
        <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600 mt-0.5">
          <Flame className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-orange-900 mb-1">Quick Tip</h4>
          <p className="text-sm text-orange-800/80 leading-relaxed">
            {currentMonth.savingsRatio > 0.2 ?
            "You're on track! Try to save a little more each month to reach your goals faster." :
            'Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Small changes add up!'}
          </p>
        </div>
      </div>
    </Card>);

}