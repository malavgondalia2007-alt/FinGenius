import React from 'react';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  CreditCard,
  Target,
  TrendingUp,
  Lightbulb } from
'lucide-react';
interface WelcomeStepProps {
  onNext: () => void;
}
export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    desc: 'Your financial command center with real-time overview.',
    color: 'text-blue-600 bg-blue-100'
  },
  {
    icon: CreditCard,
    title: 'Expenses',
    desc: 'Track every rupee. Categorize spending automatically.',
    color: 'text-orange-600 bg-orange-100'
  },
  {
    icon: Target,
    title: 'Goals',
    desc: 'Set targets and let us help you reach them faster.',
    color: 'text-green-600 bg-green-100'
  },
  {
    icon: TrendingUp,
    title: 'Investments',
    desc: 'Grow your wealth with smart SIP and stock suggestions.',
    color: 'text-purple-600 bg-purple-100'
  },
  {
    icon: Lightbulb,
    title: 'Smart Insights',
    desc: 'AI-driven advice tailored to your spending habits.',
    color: 'text-yellow-600 bg-yellow-100'
  }];

  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to FinGenius!
      </h2>
      <p className="text-gray-600 mb-8 max-w-lg mx-auto">
        We're excited to help you master your finances. Here's a quick tour of
        what you can do.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
        {features.map((feature, idx) =>
        <div
          key={idx}
          className="flex items-start p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">

            <div className={`p-3 rounded-lg mr-4 ${feature.color}`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{feature.desc}</p>
            </div>
          </div>
        )}
      </div>

      <Button onClick={onNext} size="lg" className="px-12">
        Let's Get Started
      </Button>
    </div>);

}