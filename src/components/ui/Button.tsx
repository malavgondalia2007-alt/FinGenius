import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  'primary' |
  'secondary' |
  'outline' |
  'ghost' |
  'danger' |
  'royal' |
  'emerald' |
  'gold';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-[1.02] active:scale-[0.98]';
  const variants = {
    primary:
    'bg-gradient-to-r from-royal-600 to-midnight-600 text-white hover:shadow-royal focus:ring-royal-500',
    secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500',
    outline:
    'border-2 border-royal-600 bg-transparent text-royal-600 hover:bg-royal-50 focus:ring-royal-500',
    ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500',
    danger:
    'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-large focus:ring-red-500',
    royal:
    'bg-gradient-to-r from-royal-600 to-royal-700 text-white hover:shadow-royal focus:ring-royal-500',
    emerald:
    'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-glow-emerald focus:ring-emerald-500',
    gold: 'bg-gradient-to-r from-gold-600 to-gold-700 text-white hover:shadow-glow-gold focus:ring-gold-500'
  };
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 py-2.5',
    lg: 'h-14 px-8 text-lg'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}>

      {children}
    </button>);

}