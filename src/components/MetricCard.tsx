import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  trendLabel?: string;
  icon: React.ReactNode;
  iconBgColor: string;
}
export function MetricCard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  iconBgColor
}: MetricCardProps) {
  const isPositive = trend >= 0;
  const [displayValue, setDisplayValue] = useState('0');
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
    // Animate number count-up for numeric values
    if (value.includes('₹') || !isNaN(Number(value))) {
      const numericValue = value.replace(/[^0-9]/g, '');
      const target = parseInt(numericValue) || 0;
      const duration = 1000;
      const steps = 30;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(
            value.replace(numericValue, Math.floor(current).toString())
          );
        }
      }, duration / steps);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);
  return (
    <Card
      className={`p-6 group hover:shadow-royal transition-all duration-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
      gradient>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {title}
          </p>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent animate-count-up">
            {displayValue}
          </h3>
        </div>
        <div
          className={`p-3 rounded-xl ${iconBgColor} group-hover:scale-110 transition-transform duration-300 shadow-soft`}>

          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>

          {isPositive ?
          <ArrowUpRight className="w-3.5 h-3.5" /> :

          <ArrowDownRight className="w-3.5 h-3.5" />
          }
          {Math.abs(trend)}%
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {trendLabel || 'from last month'}
        </span>
      </div>
    </Card>);

}