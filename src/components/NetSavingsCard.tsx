import React from 'react';
import { Card } from './ui/Card';
import { UserProfile, Expense, Income } from '../types';
import { calculateNetSavings } from '../utils/savingsCalculations';
import {
  PiggyBank,
  Wallet,
  TrendingDown,
  Minus,
  Equal,
  TrendingUp,
  AlertCircle } from
'lucide-react';
interface NetSavingsCardProps {
  profile: UserProfile;
  expenses: Expense[];
  income: Income[];
}
export function NetSavingsCard({
  profile,
  expenses,
  income
}: NetSavingsCardProps) {
  const {
    monthlyIncome,
    totalFixedCommitments,
    trackedExpenses,
    extraIncome,
    netSavings
  } = calculateNetSavings(profile, expenses, income);
  const isPositive = netSavings >= 0;
  const totalIncome = monthlyIncome + extraIncome;
  const totalExpenses = totalFixedCommitments + trackedExpenses;
  return (
    <Card className="p-0 overflow-hidden border-none shadow-warm-lg relative h-full bg-white">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl shadow-sm ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>

            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-charcoal-700">
              Net Monthly Savings
            </h3>
            <p className="text-xs text-charcoal-500 font-medium">
              Cash Flow Equation
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Equation Visualizer */}
        <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-3">
          {/* Income Section */}
          <div className="flex-1 w-full">
            <div className="bg-emerald-50/50 rounded-2xl p-4 md:p-5 border border-emerald-100 text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-emerald-600">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Income
                </span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-emerald-700">
                ₹{totalIncome.toLocaleString()}
              </p>
              <p className="text-[10px] text-emerald-600/70 mt-1 font-medium">
                Total Earnings
              </p>
            </div>
          </div>

          {/* Minus Operator */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
              <Minus className="w-4 h-4" />
            </div>
          </div>

          {/* Expenses Section */}
          <div className="flex-1 w-full">
            <div className="bg-red-50/50 rounded-2xl p-4 md:p-5 border border-red-100 text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-red-600">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  Expenses
                </span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-red-600">
                ₹{totalExpenses.toLocaleString()}
              </p>
              <p className="text-[10px] text-red-600/70 mt-1 font-medium">
                Total Spending
              </p>
            </div>
          </div>

          {/* Equals Operator */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
              <Equal className="w-4 h-4" />
            </div>
          </div>

          {/* Result Section (Prominent) */}
          <div className="flex-[1.2] w-full">
            <div
              className={`relative overflow-hidden rounded-2xl p-5 md:p-6 border-2 text-center shadow-lg ${isPositive ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500 text-white' : 'bg-white border-red-200'}`}>

              {isPositive &&
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              }

              <div className="relative z-10">
                <p
                  className={`text-xs font-bold uppercase tracking-widest mb-1 ${isPositive ? 'text-blue-100' : 'text-red-500'}`}>

                  Net Savings
                </p>
                <p
                  className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-1.5 ${isPositive ? 'text-white' : 'text-red-600'}`}>

                  ₹{netSavings.toLocaleString()}
                </p>
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isPositive ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-red-50 text-red-600'}`}>

                  {isPositive ?
                  <>
                      <TrendingUp className="w-3 h-3" /> Surplus
                    </> :

                  <>
                      <AlertCircle className="w-3 h-3" /> Deficit
                    </>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-3 bg-gray-50/80 rounded-xl p-4">
            <div className="mt-0.5">
              {isPositive ?
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> :

              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              }
            </div>
            <p className="text-sm text-charcoal-600 leading-relaxed">
              {isPositive ?
              <>
                  <span className="font-semibold text-emerald-700">
                    Excellent work!
                  </span>{' '}
                  You're saving{' '}
                  <span className="font-semibold">
                    {Math.round(netSavings / totalIncome * 100)}%
                  </span>{' '}
                  of your income. Consider allocating this surplus to your goals
                  or investments.
                </> :

              <>
                  <span className="font-semibold text-red-700">
                    Attention needed.
                  </span>{' '}
                  Your expenses are exceeding your income by{' '}
                  <span className="font-semibold">
                    ₹{Math.abs(netSavings).toLocaleString()}
                  </span>
                  . Review your non-essential spending to get back on track.
                </>
              }
            </p>
          </div>
        </div>
      </div>
    </Card>);

}