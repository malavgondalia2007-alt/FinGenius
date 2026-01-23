import React from 'react';
import { BoxIcon } from 'lucide-react';
interface AdminMetricCardProps {
  title: string;
  value: string | number;
  icon: BoxIcon;
  trend?: {
    value: number;
    label: string;
  };
  subtitle?: string;
  iconBgColor?: string;
}
export function AdminMetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  iconBgColor = 'bg-purple-100'
}: AdminMetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
        {trend &&
        <div
          className={`text-xs font-semibold px-2 py-1 rounded ${trend.value >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>

            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
          </div>
        }
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
      {trend && <p className="text-xs text-slate-400 mt-2">{trend.label}</p>}
    </div>);

}