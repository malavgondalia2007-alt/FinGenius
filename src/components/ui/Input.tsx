import React from 'react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}
export function Input({
  label,
  error,
  icon,
  helperText,
  className = '',
  ...props
}: InputProps) {
  return <div className="w-full">
      {label && <label className="block text-sm font-medium text-charcoal-600 mb-1.5 font-sans">
          {label}
        </label>}
      <div className="relative group">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-coral transition-colors duration-300">
            {icon}
          </div>}
        <input className={`
            w-full rounded-lg border border-gray-200 bg-white px-4 py-3
            ${icon ? 'pl-11' : ''}
            text-charcoal placeholder:text-gray-400
            transition-all duration-300
            focus:border-coral focus:outline-none focus:ring-4 focus:ring-coral-50 focus:bg-white
            hover:border-gray-300
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : ''}
            ${className}
          `} {...props} />
      </div>
      {helperText && !error && <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>}
      {error && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1 animate-fade-in">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
          {error}
        </p>}
    </div>;
}