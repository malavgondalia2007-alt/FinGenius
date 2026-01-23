import React from 'react';
import { Card } from './ui/Card';
interface SupportCardProps {
  title: string;
  description: string;
  contact: string;
  icon: React.ReactNode;
  bgColor: string;
}
export function SupportCard({
  title,
  description,
  contact,
  icon,
  bgColor
}: SupportCardProps) {
  return (
    <Card className={`p-6 text-white ${bgColor} border-none`}>
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/80 text-sm mb-4">{description}</p>
      <p className="font-bold">{contact}</p>
    </Card>);

}