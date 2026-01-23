import React, { useState, createElement } from 'react';
import {
  X,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  File as FileIcon } from
'lucide-react';
import { Button } from './ui/Button';
import { Expense } from '../types';
import { parseFile } from '../utils/fileParser';
interface ExpenseImportModalProps {
  userId: string;
  onClose: () => void;
  onImport: (expenses: Partial<Expense>[]) => void;
}
export function ExpenseImportModal({
  userId,
  onClose,
  onImport
}: ExpenseImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedExpenses, setParsedExpenses] = useState<Partial<Expense>[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setParsedExpenses([]);
    }
  };
  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError('');
    try {
      const expenses = await parseFile(file, userId);
      setParsedExpenses(expenses);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };
  const handleImport = () => {
    onImport(parsedExpenses);
    onClose();
  };
  const downloadTemplate = () => {
    const csvContent =
    'Amount,Category,Date,Description\n1000,Food,2024-01-15,Groceries\n500,Transport,2024-01-16,Fuel\n2000,Entertainment,2024-01-17,Movie tickets\n3000,Rent,2024-01-18,Monthly rent\n800,Utilities,2024-01-19,Electricity bill';
    const blob = new Blob([csvContent], {
      type: 'text/csv'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.csv'))
    return <FileText className="w-12 h-12 text-green-600" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))
    return <FileSpreadsheet className="w-12 h-12 text-emerald-600" />;
    if (fileName.endsWith('.pdf'))
    return <FileIcon className="w-12 h-12 text-red-600" />;
    return <FileText className="w-12 h-12 text-gray-400" />;
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Import Expenses
              </h2>
              <p className="text-sm text-gray-500">
                Upload CSV, Excel, or PDF files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full">

            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              File Format Requirements
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="bg-white/50 p-3 rounded-lg">
                <strong className="block mb-1 text-blue-900">
                  CSV / Excel
                </strong>
                <p>Columns: Amount, Category, Date, Description</p>
              </div>
              <div className="bg-white/50 p-3 rounded-lg">
                <strong className="block mb-1 text-blue-900">PDF</strong>
                <p>Bank statements or lists with clear dates and amounts</p>
              </div>
              <div className="bg-white/50 p-3 rounded-lg">
                <strong className="block mb-1 text-blue-900">Formats</strong>
                <p>
                  Dates: DD/MM/YYYY or YYYY-MM-DD
                  <br />
                  Amounts: Numbers only
                </p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm hover:shadow">

              <Download className="w-4 h-4" />
              Download CSV Template
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select File
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${file ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>

              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="expense-file-input" />

              <label
                htmlFor="expense-file-input"
                className="cursor-pointer flex flex-col items-center gap-3 w-full h-full">

                {file ?
                <div className="animate-in fade-in zoom-in duration-300">
                    {getFileIcon(file.name)}
                    <p className="font-medium text-gray-900 mt-2 text-lg">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    <span className="inline-block mt-3 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-md">
                      Click to change
                    </span>
                  </div> :

                <>
                    <div className="bg-gray-100 p-4 rounded-full">
                      <Upload className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-lg">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Supports CSV, Excel (.xlsx, .xls), and PDF
                      </p>
                    </div>
                  </>
                }
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error &&
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Import Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          }

          {/* Preview */}
          {parsedExpenses.length > 0 &&
          <div className="animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Preview ({parsedExpenses.length} expenses found)
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {parsedExpenses.slice(0, 50).map((expense, index) =>
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors">

                          <td className="px-4 py-2.5 text-sm font-medium text-gray-900">
                            ₹{expense.amount?.toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-700">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-sm text-gray-700 whitespace-nowrap">
                            {expense.date ?
                        new Date(expense.date).toLocaleDateString() :
                        'N/A'}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${expense.type === 'essential' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>

                              {expense.type}
                            </span>
                          </td>
                          <td
                        className="px-4 py-2.5 text-sm text-gray-500 truncate max-w-[150px]"
                        title={expense.description}>

                            {expense.description}
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
                {parsedExpenses.length > 50 &&
              <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center border-t border-gray-200">
                    Showing first 50 of {parsedExpenses.length} expenses
                  </div>
              }
              </div>
            </div>
          }

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {parsedExpenses.length === 0 ?
            <>
                <Button variant="outline" onClick={onClose} fullWidth>
                  Cancel
                </Button>
                <Button
                onClick={handleProcess}
                disabled={!file || isProcessing}
                fullWidth
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">

                  {isProcessing ?
                <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span> :

                'Process File'
                }
                </Button>
              </> :

            <>
                <Button
                variant="outline"
                onClick={() => {
                  setParsedExpenses([]);
                  setFile(null);
                }}
                fullWidth>

                  Choose Different File
                </Button>
                <Button
                onClick={handleImport}
                fullWidth
                className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all">

                  Import {parsedExpenses.length} Expenses
                </Button>
              </>
            }
          </div>
        </div>
      </div>
    </div>);

}