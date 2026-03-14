import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle, Info, Star, Smartphone, Shield, Zap } from 'lucide-react';
export function BrokerageComparison() {
  const brokers = [
  {
    name: 'Groww',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    tagline: 'Simple & Free',
    rating: 4.5,
    activeUsers: '10M+'
  },
  {
    name: 'Angel One',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    tagline: 'Full Service',
    rating: 4.3,
    activeUsers: '8M+'
  },
  {
    name: 'Paytm Money',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    tagline: 'Low Cost',
    rating: 4.0,
    activeUsers: '6M+'
  },
  {
    name: 'Zerodha',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    tagline: 'Market Leader',
    rating: 4.6,
    activeUsers: '12M+'
  }];

  const feeRows = [
  {
    category: 'Account Opening',
    values: ['₹0 (Free)', '₹0 (Free)', '₹0 (Free)', '₹200'],
    bestIndices: [0, 1, 2]
  },
  {
    category: 'Annual Maintenance (AMC)',
    values: [
    '₹0 (Lifetime Free)',
    '₹240/yr (1st yr Free)',
    '₹300/yr',
    '₹300/yr'],

    bestIndices: [0]
  },
  {
    category: 'Equity Delivery',
    values: ['₹20 or 0.05%', '₹0 (Free)', '₹0 (orders < ₹500)', '₹0 (Free)'],
    bestIndices: [1, 3],
    note: 'Paytm charges ₹20 if order > ₹500'
  },
  {
    category: 'Equity Intraday',
    values: ['₹20 or 0.05%', '₹20 or 0.05%', '₹20 or 0.05%', '₹20 or 0.03%'],
    bestIndices: [0, 1, 2, 3]
  },
  {
    category: 'F&O Brokerage',
    values: ['₹20/order', '₹20/order', '₹20/order', '₹20/order'],
    bestIndices: [0, 1, 2, 3]
  },
  {
    category: 'DP Charges (per sell)',
    values: ['₹15.34', '₹20', '₹15.34', '₹13.5 + GST'],
    bestIndices: [3]
  }];

  const featureRows = [
  {
    category: 'Mobile App Rating',
    values: ['4.5 ★', '4.3 ★', '4.0 ★', '4.6 ★'],
    icons: [Smartphone, Smartphone, Smartphone, Smartphone]
  },
  {
    category: 'Research & Tips',
    values: ['Basic', 'Advanced', 'Basic', 'None (DIY)'],
    icons: [Zap, Zap, Zap, Zap]
  },
  {
    category: 'Margin Funding',
    values: ['Yes', 'Yes', 'No', 'No'],
    icons: [Shield, Shield, Shield, Shield]
  }];

  const regulatoryCharges = [
  {
    name: 'STT (Securities Transaction Tax)',
    value: '0.1% (Delivery) / 0.025% (Intraday Sell)'
  },
  {
    name: 'Exchange Transaction Charges',
    value: 'NSE: 0.00345% | BSE: 0.00375%'
  },
  {
    name: 'SEBI Turnover Fees',
    value: '₹10 per crore (0.0001%)'
  },
  {
    name: 'Stamp Duty',
    value: '0.015% (Delivery Buy) / 0.003% (Intraday Buy)'
  },
  {
    name: 'GST',
    value: '18% on (Brokerage + Transaction Charges)'
  }];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-[#000926] mb-2">
          Brokerage & Fee Comparison
        </h2>
        <p className="text-[#000926]/70">
          Compare hidden charges and features across India's top brokers
        </p>
      </div>

      {/* Comparison Table */}
      <Card className="overflow-hidden border-[#A6C5D7]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="bg-[#D6E6F3]/30 border-b border-[#A6C5D7]">
                <th className="p-4 text-left text-sm font-bold text-[#000926] w-1/5 sticky left-0 bg-[#F0F7FF] z-10 shadow-sm">
                  Feature / Fee
                </th>
                {brokers.map((broker) =>
                <th key={broker.name} className="p-4 text-left w-1/5">
                    <div className="flex items-center gap-3">
                      <div
                      className={`w-10 h-10 rounded-full ${broker.color} flex items-center justify-center text-white font-bold text-lg shadow-sm`}>

                        {broker.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#000926]">
                          {broker.name}
                        </div>
                        <div
                        className={`text-xs ${broker.textColor} font-medium`}>

                          {broker.tagline}
                        </div>
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Fees Section */}
              <tr className="bg-gray-50/80">
                <td
                  colSpan={5}
                  className="p-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">

                  Charges & Fees
                </td>
              </tr>
              {feeRows.map((row, idx) =>
              <tr
                key={row.category}
                className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>

                  <td className="p-4 text-sm font-medium text-[#000926]/80 sticky left-0 bg-white z-10 shadow-sm border-r border-gray-100">
                    {row.category}
                    {row.note &&
                  <div className="text-xs text-[#000926]/50 mt-1 font-normal flex items-center gap-1">
                        <Info className="w-3 h-3" /> {row.note}
                      </div>
                  }
                  </td>
                  {row.values.map((val, i) =>
                <td key={i} className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#000926]">
                          {val}
                        </span>
                        {row.bestIndices.includes(i) &&
                    <Badge
                      variant="success"
                      className="h-5 text-[10px] px-1.5">

                            Best
                          </Badge>
                    }
                      </div>
                    </td>
                )}
                </tr>
              )}

              {/* Features Section */}
              <tr className="bg-gray-50/80">
                <td
                  colSpan={5}
                  className="p-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-t border-gray-200">

                  Trade Details & Features
                </td>
              </tr>
              {featureRows.map((row, idx) =>
              <tr
                key={row.category}
                className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>

                  <td className="p-4 text-sm font-medium text-[#000926]/80 sticky left-0 bg-white z-10 shadow-sm border-r border-gray-100">
                    {row.category}
                  </td>
                  {row.values.map((val, i) =>
                <td key={i} className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#000926]">
                          {val}
                        </span>
                      </div>
                    </td>
                )}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Regulatory Charges Section */}
      <Card className="p-6 bg-white border-[#A6C5D7]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#D6E6F3] rounded-xl text-[#0F52BA]">
            <Info className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#000926] mb-4">
              Regulatory & Hidden Charges (Same for All Brokers)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regulatoryCharges.map((charge, idx) =>
              <div
                key={idx}
                className="p-3 rounded-lg border border-[#A6C5D7]/30 bg-[#F8FAFC]">

                  <p className="text-xs font-bold text-[#000926]/60 uppercase tracking-wider mb-1">
                    {charge.name}
                  </p>
                  <p className="text-sm font-semibold text-[#000926]">
                    {charge.value}
                  </p>
                </div>
              )}
            </div>
            <p className="text-xs text-[#000926]/50 mt-4">
              * Note: These charges are mandated by the government and
              exchanges. No broker can waive them.
            </p>
          </div>
        </div>
      </Card>
    </div>);

}