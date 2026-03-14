import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  style,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-[1.02] active:scale-[0.98] select-none';
  const variants = {
    primary: 'bg-coral text-white hover:bg-coral-600 hover:shadow-coral focus:ring-coral-500 border border-transparent',
    secondary: 'bg-white text-charcoal border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-charcoal-500 shadow-warm-sm',
    outline: 'bg-transparent border border-charcoal text-charcoal hover:bg-charcoal hover:text-white focus:ring-charcoal-500',
    ghost: 'bg-transparent text-charcoal-600 hover:bg-gray-100 hover:text-charcoal focus:ring-gray-500',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-500',
    success: 'bg-sage text-white hover:bg-sage-600 hover:shadow-lg focus:ring-sage-500'
  };
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  return <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`} style={{
    WebkitTapHighlightColor: 'transparent',
    ...style
  }} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </div> : children}
    </button>;
}