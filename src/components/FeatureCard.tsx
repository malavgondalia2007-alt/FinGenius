import React from 'react';
import { Card } from './ui/Card';
interface FeatureCardProps {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  colorClass: string; // e.g., "bg-blue-600"
}
export function FeatureCard({
  title,
  description,
  features,
  icon,
  colorClass
}: FeatureCardProps) {
  return (
    <Card
      className={`overflow-hidden border-none h-full flex flex-col ${colorClass} text-white`}>

      <div className="p-8 flex flex-col h-full">
        <div className="mb-6">{icon}</div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-white/90 mb-6 leading-relaxed">{description}</p>
        <ul className="space-y-3 mt-auto">
          {features.map((feature, index) =>
          <li key={index} className="flex items-center text-white/90">
              <span className="w-1.5 h-1.5 bg-white rounded-full mr-3 flex-shrink-0"></span>
              <span className="text-sm font-medium">{feature}</span>
            </li>
          )}
        </ul>
      </div>
    </Card>);

}