import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export function Input({
  label,
  error,
  icon,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label &&
      <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      }
      <div className="relative">
        {icon &&
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        }
        <input
          className={`
            w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3
            ${icon ? 'pl-12' : ''}
            text-slate-900 placeholder:text-slate-400
            transition-all duration-300
            focus:border-royal-600 focus:outline-none focus:ring-4 focus:ring-royal-600/10
            hover:border-slate-300
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props} />

      </div>
      {error &&
      <p className="mt-2 text-sm text-red-600 animate-fade-in">{error}</p>
      }
    </div>);

}