import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white border border-gray-200 p-6 ${className}`}
      onClick={onClick}>

      {children}
    </div>);

}