import React, { useState, createElement } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FileText, Download, Calendar, FileSpreadsheet } from 'lucide-react';
import { db } from '../../services/database';
export function AdminReports() {
  const [reportType, setReportType] = useState('summary');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const handleDownload = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      generateCSV(reportType);
      setIsGenerating(false);
    }, 1500);
  };
  const generateCSV = (type: string) => {
    let data: any[] = [];
    let filename = `fingenius_report_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    // Fetch data based on report type
    if (type === 'users') {
      data = db.users.getAll().map((u) => ({
        ID: u.id,
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Joined: u.createdAt
      }));
    } else if (type === 'financial') {
      const expenses = db.expenses.getAll().map((e) => ({
        Type: 'Expense',
        Category: e.category,
        Amount: e.amount,
        Date: e.date,
        Description: e.description
      }));
      const investments = db.investments.getAll().map((i) => ({
        Type: 'Investment',
        Category: i.fundName,
        Amount: i.amount,
        Date: i.date,
        Description: i.type
      }));
      data = [...expenses, ...investments];
    } else {
      // Summary report
      const users = db.users.getAll();
      const expenses = db.expenses.getAll();
      const goals = db.goals.getAll();
      data = [
      {
        Metric: 'Total Users',
        Value: users.length
      },
      {
        Metric: 'Total Expenses',
        Value: expenses.reduce((s, e) => s + e.amount, 0)
      },
      {
        Metric: 'Active Goals',
        Value: goals.length
      },
      {
        Metric: 'Generated At',
        Value: new Date().toLocaleString()
      }];

    }
    // Convert to CSV
    if (data.length === 0) {
      alert('No data available for this report type');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvContent = [
    headers.join(','),
    ...data.map((row) =>
    headers.
    map((header) =>
    JSON.stringify(row[header as keyof typeof row] || '')
    ).
    join(',')
    )].
    join('\n');
    // Trigger download
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Reports & Exports
          </h1>
          <p className="text-slate-500">
            Generate and download system reports for review
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Report Configuration
              </h2>

              <div className="space-y-6">
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Report Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setReportType('summary')}
                      className={`p-4 rounded-xl border text-left transition-all ${reportType === 'summary' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'}`}>

                      <div className="font-semibold text-slate-900 mb-1">
                        Weekly Summary
                      </div>
                      <div className="text-xs text-slate-500">
                        Overview of key metrics and growth
                      </div>
                    </button>
                    <button
                      onClick={() => setReportType('users')}
                      className={`p-4 rounded-xl border text-left transition-all ${reportType === 'users' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'}`}>

                      <div className="font-semibold text-slate-900 mb-1">
                        User Data
                      </div>
                      <div className="text-xs text-slate-500">
                        Detailed user list and status
                      </div>
                    </button>
                    <button
                      onClick={() => setReportType('financial')}
                      className={`p-4 rounded-xl border text-left transition-all ${reportType === 'financial' ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'}`}>

                      <div className="font-semibold text-slate-900 mb-1">
                        Financial Data
                      </div>
                      <div className="text-xs text-slate-500">
                        All expenses and investments
                      </div>
                    </button>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Date Range (Optional)
                  </label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={dateRange.start}
                          onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            start: e.target.value
                          })
                          } />

                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="date"
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          value={dateRange.end}
                          onChange={(e) =>
                          setDateRange({
                            ...dateRange,
                            end: e.target.value
                          })
                          } />

                      </div>
                    </div>
                  </div>
                </div>

                {/* Format - CSV only */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Export Format
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={format === 'csv'}
                        onChange={() => setFormat('csv')}
                        className="text-purple-600 focus:ring-purple-500" />

                      <span className="text-slate-700">CSV (Excel)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">

                    {isGenerating ?
                    <>Generating...</> :

                    <>
                        <Download className="w-4 h-4" />
                        Download Report
                      </>
                    }
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 text-white rounded-xl p-6 h-full">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Report Preview
              </h3>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="p-3 bg-slate-800 rounded-lg">
                  <span className="block text-xs text-slate-500 uppercase mb-1">
                    Selected Report
                  </span>
                  <span className="font-medium text-white capitalize">
                    {reportType} Report
                  </span>
                </div>

                <div className="p-3 bg-slate-800 rounded-lg">
                  <span className="block text-xs text-slate-500 uppercase mb-1">
                    Format
                  </span>
                  <span className="font-medium text-white uppercase">
                    {format}
                  </span>
                </div>

                <div className="p-3 bg-slate-800 rounded-lg">
                  <span className="block text-xs text-slate-500 uppercase mb-1">
                    Includes
                  </span>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {reportType === 'summary' &&
                    <>
                        <li>Total User Count</li>
                        <li>Expense Aggregates</li>
                        <li>Goal Progress Stats</li>
                        <li>System Health Status</li>
                      </>
                    }
                    {reportType === 'users' &&
                    <>
                        <li>User Profiles</li>
                        <li>Account Status</li>
                        <li>Registration Dates</li>
                        <li>Role Information</li>
                      </>
                    }
                    {reportType === 'financial' &&
                    <>
                        <li>All Expense Records</li>
                        <li>Investment Portfolio Data</li>
                        <li>Transaction Dates</li>
                        <li>Category Breakdowns</li>
                      </>
                    }
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">
                    Generated reports are for internal use only.
                    <br />
                    Contains sensitive user data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>);

}