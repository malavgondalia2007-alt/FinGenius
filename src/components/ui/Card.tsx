import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  onClick?: () => void;
  style?: React.CSSProperties;
  noBg?: boolean;
}
export function Card({
  children,
  className = '',
  variant = 'default',
  onClick,
  style,
  noBg = false
}: CardProps) {
  const baseStyles = `rounded-2xl transition-all duration-300 ${noBg ? '' : 'bg-white'}`;
  const variants = {
    default: 'border border-gray-100 shadow-warm-sm',
    elevated: 'border-none shadow-warm-lg',
    outlined: 'border border-gray-200 shadow-none'
  };
  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      style={style}>

      {children}
    </div>);

}