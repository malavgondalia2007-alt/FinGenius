import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties; // ✅ ADD THIS
}

export function Card({
  children,
  className = "",
  onClick,
  style,
}: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white border border-gray-200 p-6 ${className}`}
      onClick={onClick}
      style={style} // ✅ PASS IT HERE
    >
      {children}
    </div>
  );
}
