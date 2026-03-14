import React, { useEffect, useState, useRef } from 'react';
import { Card } from './ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
interface MetricCardProps {
  title: string;
  value: string;
  trend?: number;
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
  const isPositive = (trend ?? 0) >= 0;
  const hasTrend = trend !== undefined && !isNaN(trend);
  const [displayValue, setDisplayValue] = useState(value);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);
  const previousValue = useRef(value);
  useEffect(() => {
    setIsVisible(true);
    // Only animate on initial mount OR when value actually changes
    const valueChanged = previousValue.current !== value;
    previousValue.current = value;
    // Skip animation if already animated and value hasn't changed
    if (hasAnimated.current && !valueChanged) {
      setDisplayValue(value);
      return;
    }
    // Animate number count-up for numeric values
    if (value.includes('₹') || !isNaN(Number(value.replace(/[^0-9.]/g, '')))) {
      const numericString = value.replace(/[^0-9.]/g, '');
      const target = parseFloat(numericString) || 0;
      const duration = 1000;
      const frameRate = 60;
      const totalFrames = (duration / 1000) * frameRate;
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const current = progress * target;

        if (frame >= totalFrames) {
          setDisplayValue(value);
          clearInterval(timer);
          hasAnimated.current = true;
        } else {
          const prefix = value.startsWith('₹') ? '₹' : '';
          setDisplayValue(prefix + Math.round(current).toLocaleString());
        }
      }, 1000 / frameRate);
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
      hasAnimated.current = true;
    }
  }, [value]);
  return (
    <Card
      className={`p-6 group hover:shadow-warm-lg transition-all duration-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <p className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-3 font-sans">
            {title}
          </p>
          <h3 className="text-3xl font-serif font-bold text-charcoal animate-count-up">
            {displayValue}
          </h3>
        </div>
        <div
          className={`p-3 rounded-xl ${iconBgColor} group-hover:scale-110 transition-transform duration-300 shadow-warm-sm`}>

          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {hasTrend ?
          <>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${isPositive ? 'bg-sage-50 text-sage-800' : 'bg-red-50 text-red-700'}`}>

              {isPositive ?
                <ArrowUpRight className="w-3.5 h-3.5" /> :

                <ArrowDownRight className="w-3.5 h-3.5" />
              }
              {Math.abs(trend)}%
            </div>
            <span className="text-xs text-charcoal-500 font-medium">
              {trendLabel || 'from last month'}
            </span>
          </> :

          <span className="text-xs text-charcoal-500 font-medium">
            {trendLabel || 'this month'}
          </span>
        }
      </div>
    </Card>);

}