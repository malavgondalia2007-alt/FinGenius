import React, { useState, Component } from 'react';
import { Card } from '../components/ui/Card';
import { SIPCalculator } from '../components/investments/SIPCalculator';
import { LumpSumCalculator } from '../components/calculators/LumpSumCalculator';
import { CompoundInterestCalculator } from '../components/calculators/CompoundInterestCalculator';
import { ROICalculator } from '../components/calculators/ROICalculator';
import { FutureValueCalculator } from '../components/calculators/FutureValueCalculator';
import { InflationCalculator } from '../components/calculators/InflationCalculator';
import { AssetAllocationCalculator } from '../components/calculators/AssetAllocationCalculator';
import { CalculatorAIAssistant } from '../components/calculators/CalculatorAIAssistant';
import {
  Calculator,
  TrendingUp,
  PieChart,
  DollarSign,
  Clock,
  Percent,
  ArrowUpRight,
  ArrowLeft } from
'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
type CalculatorType =
'sip' |
'lumpsum' |
'compound' |
'roi' |
'future' |
'inflation' |
'asset';
export function InvestmentCalculators() {
  const [activeCalc, setActiveCalc] = useState<CalculatorType>('sip');
  const navigate = useNavigate();
  const calculators = [
  {
    id: 'sip',
    name: 'SIP Calculator',
    icon: Clock,
    desc: 'Monthly investment planning'
  },
  {
    id: 'lumpsum',
    name: 'Lump Sum',
    icon: DollarSign,
    desc: 'One-time investment'
  },
  {
    id: 'compound',
    name: 'Compound Interest',
    icon: TrendingUp,
    desc: 'Power of compounding'
  },
  {
    id: 'roi',
    name: 'ROI Calculator',
    icon: Percent,
    desc: 'Return on Investment'
  },
  {
    id: 'future',
    name: 'Future Value',
    icon: ArrowUpRight,
    desc: 'Project future wealth'
  },
  {
    id: 'inflation',
    name: 'Inflation',
    icon: TrendingUp,
    desc: 'Real returns adjusted'
  },
  {
    id: 'asset',
    name: 'Asset Allocation',
    icon: PieChart,
    desc: 'Portfolio mix'
  }];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/investment-guidance')}
              className="flex items-center gap-2">

              <ArrowLeft className="w-4 h-4" />
              Back to Guidance
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Financial Calculators
          </h1>
          <p className="text-gray-500">
            Plan your financial future with our comprehensive suite of tools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Calculator Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Calculator Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                {calculators.map((calc) => {
                  const Icon = calc.icon;
                  return (
                    <button
                      key={calc.id}
                      onClick={() => setActiveCalc(calc.id as CalculatorType)}
                      className={`
                        flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                        ${activeCalc === calc.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                      `}>

                      <Icon className="w-4 h-4" />
                      {calc.name}
                    </button>);

                })}
              </div>
            </div>

            {/* Active Calculator Component */}
            <Card className="p-6 md:p-8 min-h-[500px]">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {calculators.find((c) => c.id === activeCalc)?.name}
                </h2>
                <p className="text-gray-500">
                  {calculators.find((c) => c.id === activeCalc)?.desc}
                </p>
              </div>

              <div className="animate-fade-in">
                {activeCalc === 'sip' && <SIPCalculator />}
                {activeCalc === 'lumpsum' && <LumpSumCalculator />}
                {activeCalc === 'compound' && <CompoundInterestCalculator />}
                {activeCalc === 'roi' && <ROICalculator />}
                {activeCalc === 'future' && <FutureValueCalculator />}
                {activeCalc === 'inflation' && <InflationCalculator />}
                {activeCalc === 'asset' && <AssetAllocationCalculator />}
              </div>
            </Card>
          </div>

          {/* Sidebar - AI Assistant */}
          <div className="lg:col-span-4 space-y-6">
            <CalculatorAIAssistant />

            <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <h3 className="font-bold text-lg mb-2">Need Help?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Not sure which calculator to use? Ask our AI assistant to guide
                you based on your goals.
              </p>
              <div className="text-xs bg-white/10 p-3 rounded-lg">
                <strong>Tip:</strong> Try asking "How much should I save for a
                car in 5 years?"
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>);

}