import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, TrendingUp, X, Target } from 'lucide-react';
import { SmartWarning as SmartWarningType } from '../types';
interface SmartWarningProps {
  warning: SmartWarningType;
  onDismiss: (id: string) => void;
}
export function SmartWarning({ warning, onDismiss }: SmartWarningProps) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    // Small delay for animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(warning.id), 300); // Wait for animation
  };
  const getIcon = () => {
    switch (warning.icon) {
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'Target':
        return <Target className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };
  const getStyles = () => {
    switch (warning.type) {
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };
  const getIconColor = () => {
    switch (warning.type) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border p-4 shadow-sm mb-4 transition-all duration-300 ease-in-out
        ${getStyles()}
        ${isVisible ? 'opacity-100 translate-y-0 max-h-40' : 'opacity-0 -translate-y-4 max-h-0 mb-0'}
      `}>

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white/60 ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1">{warning.title}</h4>
          <p className="text-sm opacity-90 leading-relaxed">
            {warning.message}
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-black/5 rounded-full transition-colors">

          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-current opacity-5 blur-2xl pointer-events-none"></div>
    </div>);

}