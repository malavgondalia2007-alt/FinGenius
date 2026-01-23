import React from 'react';
import { FinancialReport as FinancialReportType } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Download, Share2, Award, TrendingUp, TrendingDown } from 'lucide-react';
interface FinancialReportProps {
  report: FinancialReportType;
  onClose: () => void;
}
export function FinancialReport({ report, onClose }: FinancialReportProps) {
  const handleDownload = () => {
    window.print();
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-royal-600 to-midnight-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                Monthly Financial Health
              </h2>
              <p className="opacity-80 text-lg">
                {report.month} {report.year}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 mb-2">
                <span className="text-2xl font-bold">{report.score}</span>
              </div>
              <p className="text-xs uppercase tracking-wider font-bold opacity-80">
                FinScore
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Income
              </p>
              <p className="text-lg font-bold text-gray-900">
                ₹{report.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Expenses
              </p>
              <p className="text-lg font-bold text-gray-900">
                ₹{report.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Savings Rate
              </p>
              <p
                className={`text-lg font-bold ${report.savingsRate >= 20 ? 'text-green-600' : 'text-amber-600'}`}>

                {Math.round(report.savingsRate)}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Goal Progress
              </p>
              <p className="text-lg font-bold text-blue-600">
                {Math.round(report.goalProgress)}%
              </p>
            </div>
          </div>

          {/* Insights */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-gold-500" />
              AI Insights
            </h3>
            <div className="space-y-3">
              {report.insights.map((insight, idx) =>
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg text-blue-900 text-sm">

                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  {insight}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Top Expense
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {report.topExpenseCategory}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Consider reviewing this category next month.
              </p>
            </div>
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-gray-500">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Portfolio Growth
                </span>
              </div>
              <p className="text-xl font-bold text-green-600">
                +{report.investmentGrowth}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Your investments are performing well.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>);

}