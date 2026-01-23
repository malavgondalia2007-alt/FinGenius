import React from 'react';
import { Card } from './ui/Card';
interface EmotionalFeedbackProps {
  type: 'positive' | 'neutral' | 'caution';
  message: string;
  emoji: string;
}
export function EmotionalFeedback({
  type,
  message,
  emoji
}: EmotionalFeedbackProps) {
  const getGradient = () => {
    switch (type) {
      case 'positive':
        return 'from-emerald-500 to-teal-500';
      case 'caution':
        return 'from-orange-500 to-red-500';
      case 'neutral':
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };
  return (
    <Card className="p-0 overflow-hidden border-none shadow-lg transform hover:scale-[1.02] transition-transform duration-300">
      <div className={`bg-gradient-to-r ${getGradient()} p-1`}></div>
      <div className="p-6 flex items-center gap-4 bg-white">
        <div className="text-4xl animate-bounce shadow-sm rounded-full p-2 bg-gray-50">
          {emoji}
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            Financial Wellness Check
          </p>
          <p className="font-medium text-gray-800 leading-snug">{message}</p>
        </div>
      </div>
    </Card>);

}