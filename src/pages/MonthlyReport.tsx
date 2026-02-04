import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { generateMonthlyReport } from '../utils/financialIntelligence';
import {
  Download,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar } from
'lucide-react';
export function MonthlyReport() {
  const { user } = useAuth();
  const expenses = user ? db.expenses.getByUserId(user.id) : [];
  const goals = user ? db.goals.getByUserId(user.id) : [];
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  const report = profile ?
  generateMonthlyReport(expenses, goals, profile) :
  null;
  const handleDownload = () => {
    window.print();
  };
  if (!report) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-500">Loading report data...</p>
        </div>
      </Layout>);

  }
  return (
    <Layout>
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Report</h1>
          <p className="text-gray-500">
            Financial summary for {report.month} {report.year}
          </p>
        </div>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 print:space-y-4">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-royal-600 to-midnight-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-royal">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  Financial Health Check
                </span>
              </div>
              <h2 className="text-4xl font-bold mb-2">
                {report.month} Overview
              </h2>
              <p className="opacity-90">
                A comprehensive look at your income, spending, and goals.
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 mb-2 shadow-lg">
                <span className="text-3xl font-bold">{report.score}</span>
              </div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-80">
                FinScore
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-blue-50 border-blue-100">
            <p className="text-xs text-blue-600 uppercase tracking-wider mb-2 font-bold">
              Total Income
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{report.totalIncome.toLocaleString()}
            </p>
          </Card>
          <Card className="p-6 bg-orange-50 border-orange-100">
            <p className="text-xs text-orange-600 uppercase tracking-wider mb-2 font-bold">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{report.totalExpenses.toLocaleString()}
            </p>
          </Card>
          <Card className="p-6 bg-emerald-50 border-emerald-100">
            <p className="text-xs text-emerald-600 uppercase tracking-wider mb-2 font-bold">
              Savings Rate
            </p>
            <p
              className={`text-2xl font-bold ${report.savingsRate >= 20 ? 'text-emerald-700' : 'text-amber-600'}`}>

              {Math.round(report.savingsRate)}%
            </p>
          </Card>
          <Card className="p-6 bg-purple-50 border-purple-100">
            <p className="text-xs text-purple-600 uppercase tracking-wider mb-2 font-bold">
              Goal Progress
            </p>
            <p className="text-2xl font-bold text-purple-700">
              {Math.round(report.goalProgress)}%
            </p>
          </Card>
        </div>

        {/* Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              AI Insights
            </h3>
            <div className="space-y-3">
              {report.insights.map((insight, idx) =>
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg text-slate-700 text-sm border border-slate-100">

                  <div className="w-1.5 h-1.5 bg-royal-500 rounded-full mt-2 flex-shrink-0"></div>
                  {insight}
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4 text-gray-500">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Top Expense Category
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {report.topExpenseCategory}
              </p>
              <p className="text-sm text-gray-600">
                This was your highest spending area this month. Consider setting
                a budget limit here.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
              <div className="flex items-center gap-2 mb-4 text-emerald-700">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Savings Status
                </span>
              </div>
              <p className="text-lg font-medium text-emerald-900">
                {report.savingsRate > 0 ?
                "You're building wealth! Keep maintaining this positive cash flow." :
                'Expenses exceeded income. Review non-essential spending.'}
              </p>
            </Card>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm py-8">
          Generated by FinGenius • {new Date().toLocaleDateString()}
        </div>
      </div>
    </>);

}