import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Target,
  TrendingUp,
  GitBranch,
  Sparkles,
  BoxIcon } from
'lucide-react';
interface FeatureItemProps {
  icon: BoxIcon;
  title: string;
  description: string;
  accentColor: string;
  iconBgColor: string;
}
function FeatureItem({
  icon: Icon,
  title,
  description,
  accentColor,
  iconBgColor
}: FeatureItemProps) {
  return (
    <div className="group relative bg-white rounded-xl p-5 border border-[#A6C5D7] shadow-sm hover:border-[#0F52BA] hover:shadow-lg hover:shadow-[#0F52BA]/10 transition-all duration-300">
      {/* Accent line */}
      <div
        className={`absolute left-0 top-4 bottom-4 w-1 rounded-full ${accentColor} opacity-80`} />


      <div className="flex items-start gap-4 pl-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-11 h-11 ${iconBgColor} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>

          <Icon className="w-5 h-5 text-charcoal-700" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#000926] text-[15px] mb-1">
            {title}
          </h3>
          <p className="text-[#000926]/60 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>);

}
export function CoreFeaturesSection() {
  const features = [
  {
    icon: LayoutDashboard,
    title: 'Smart Dashboard',
    description: 'Real-time metrics and AI-powered insights at a glance',
    accentColor: 'bg-blue-500',
    iconBgColor: 'bg-blue-50'
  },
  {
    icon: Receipt,
    title: 'Expense Intelligence',
    description: 'Track, categorize, and analyze your spending patterns',
    accentColor: 'bg-amber-500',
    iconBgColor: 'bg-amber-50'
  },
  {
    icon: Target,
    title: 'Goal-Based Savings',
    description: 'AI-powered goal planning with feasibility analysis',
    accentColor: 'bg-emerald-500',
    iconBgColor: 'bg-emerald-50'
  },
  {
    icon: TrendingUp,
    title: 'Investment Guidance',
    description: 'SIP calculator and personalized fund recommendations',
    accentColor: 'bg-purple-500',
    iconBgColor: 'bg-purple-50'
  },
  {
    icon: GitBranch,
    title: 'Scenario Planning',
    description: 'What-if analysis for major financial decisions',
    accentColor: 'bg-cyan-500',
    iconBgColor: 'bg-cyan-50'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Smart alerts, feedback, and personalized savings tips',
    accentColor: 'bg-coral',
    iconBgColor: 'bg-coral-50'
  }];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-serif font-bold text-charcoal">
          Core Features
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) =>
        <FeatureItem
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          accentColor={feature.accentColor}
          iconBgColor={feature.iconBgColor} />

        )}
      </div>
    </div>);

}