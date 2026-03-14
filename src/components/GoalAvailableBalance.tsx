import React from 'react';
import { Card } from './ui/Card';
import { UserProfile, Expense, Income, Goal } from '../types';
import { calculateAvailableForGoals } from '../utils/savingsCalculations';
import {
  Wallet,
  Target,
  AlertCircle,
  CheckCircle,
  PieChart } from
'lucide-react';
interface GoalAvailableBalanceProps {
  profile: UserProfile;
  expenses: Expense[];
  income: Income[];
  goals: Goal[];
}
export function GoalAvailableBalance({
  profile,
  expenses,
  income,
  goals
}: GoalAvailableBalanceProps) {
  const {
    netSavings,
    totalAllocatedToGoals,
    availableForNewGoals,
    allocationPercentage,
    isOverAllocated
  } = calculateAvailableForGoals(profile, expenses, income, goals);
  // Determine status color
  let statusColor = 'bg-emerald-500';
  let statusBg = 'bg-emerald-50';
  let statusText = 'text-emerald-700';
  let statusBorder = 'border-emerald-200';
  if (allocationPercentage > 100) {
    statusColor = 'bg-red-500';
    statusBg = 'bg-red-50';
    statusText = 'text-red-700';
    statusBorder = 'border-red-200';
  } else if (allocationPercentage > 80) {
    statusColor = 'bg-amber-500';
    statusBg = 'bg-amber-50';
    statusText = 'text-amber-700';
    statusBorder = 'border-amber-200';
  }
  return (
    <Card className="mb-8 overflow-hidden border-none shadow-warm-md">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Header Section */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-charcoal-900 flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Goal Allocation Budget
            </h2>
            <p className="text-sm text-charcoal-500">
              Based on your monthly net savings of{' '}
              <span className="font-bold text-charcoal-700">
                ₹{netSavings.toLocaleString()}
              </span>
            </p>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 w-full md:w-auto">
            <div className="grid grid-cols-3 gap-4 text-center divide-x divide-gray-100">
              <div className="px-2">
                <p className="text-xs text-charcoal-400 uppercase tracking-wider font-bold mb-1">
                  Net Savings
                </p>
                <p className="text-lg font-bold text-charcoal-900">
                  ₹{netSavings.toLocaleString()}
                </p>
              </div>

              <div className="px-2">
                <p className="text-xs text-charcoal-400 uppercase tracking-wider font-bold mb-1">
                  Allocated
                </p>
                <p className="text-lg font-bold text-blue-600">
                  ₹{Math.round(totalAllocatedToGoals).toLocaleString()}
                </p>
              </div>

              <div className="px-2">
                <p className="text-xs text-charcoal-400 uppercase tracking-wider font-bold mb-1">
                  Available
                </p>
                <p
                  className={`text-lg font-bold ${availableForNewGoals >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                  ₹
                  {Math.max(
                    0,
                    Math.round(availableForNewGoals)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs mb-2 font-medium">
            <span className={statusText}>
              {allocationPercentage > 100 ?
              'Over Allocated!' :
              `${Math.round(allocationPercentage)}% Utilized`}
            </span>
            <span className="text-charcoal-400">
              {availableForNewGoals < 0 ?
              `Deficit: ₹${Math.abs(Math.round(availableForNewGoals)).toLocaleString()}` :
              `Remaining: ₹${Math.round(availableForNewGoals).toLocaleString()}`}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${statusColor}`}
              style={{
                width: `${Math.min(100, allocationPercentage)}%`
              }} />

          </div>
        </div>

        {/* Status Message */}
        <div
          className={`mt-4 p-3 rounded-xl flex items-start gap-3 text-sm ${statusBg} ${statusBorder} border`}>

          {isOverAllocated ?
          <>
              <AlertCircle className={`w-5 h-5 ${statusText} flex-shrink-0`} />
              <div>
                <p className={`font-bold ${statusText}`}>Budget Exceeded</p>
                <p className={`${statusText} opacity-90`}>
                  You've allocated more to goals than you save. Consider
                  extending goal timelines or reducing expenses.
                </p>
              </div>
            </> :
          allocationPercentage < 60 ?
          <>
              <CheckCircle className={`w-5 h-5 ${statusText} flex-shrink-0`} />
              <div>
                <p className={`font-bold ${statusText}`}>Healthy Balance! 🎉</p>
                <p className={`${statusText} opacity-90`}>
                  You have room for more goals! You're using less than 60% of
                  your savings capacity.
                </p>
              </div>
            </> :

          <>
              <PieChart className={`w-5 h-5 ${statusText} flex-shrink-0`} />
              <div>
                <p className={`font-bold ${statusText}`}>Balanced Allocation</p>
                <p className={`${statusText} opacity-90`}>
                  You're making good use of your savings. Keep an eye on
                  expenses to maintain this balance.
                </p>
              </div>
            </>
          }
        </div>
      </div>
    </Card>);

}