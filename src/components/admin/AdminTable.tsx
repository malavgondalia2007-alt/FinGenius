import React from 'react';
interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}
interface AdminTableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}
export function AdminTable({
  columns,
  data,
  emptyMessage = 'No data available'
}: AdminTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400">{emptyMessage}</p>
      </div>);

  }
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((column) =>
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">

                  {column.label}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) =>
            <tr key={index} className="hover:bg-slate-50 transition-colors">
                {columns.map((column) =>
              <td
                key={column.key}
                className="px-6 py-4 text-sm text-slate-700">

                    {column.render ?
                column.render(row[column.key], row) :
                row[column.key]}
                  </td>
              )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}