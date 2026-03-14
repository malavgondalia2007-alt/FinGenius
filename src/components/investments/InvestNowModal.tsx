import React from 'react';
import { X, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
interface Stock {
  symbol: string;
  name: string;
  price: number;
  exchange?: string;
}
interface InvestNowModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
}
export function InvestNowModal({
  stock,
  isOpen,
  onClose
}: InvestNowModalProps) {
  if (!isOpen || !stock) return null;
  const brokers = [
  {
    name: 'Groww',
    url: `https://groww.in/search?q=${stock.symbol}`,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: 'G',
    description: 'Zero Demat AMC & fast account opening'
  },
  {
    name: 'Zerodha (Kite)',
    url: 'https://kite.zerodha.com/',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: 'Z',
    description: '#1 Broker in India, robust platform'
  },
  {
    name: 'Angel One',
    url: 'https://trade.angelone.in/',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: 'A',
    description: 'Full-service broker with flat fees'
  },
  {
    name: 'Upstox',
    url: 'https://pro.upstox.com/',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: 'U',
    description: 'Fast & reliable trading platform'
  },
  {
    name: 'Paytm Money',
    url: `https://www.paytmmoney.com/stocks`,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-700',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    icon: 'P',
    description: 'Simple interface for beginners'
  }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <Card className="w-full max-w-md bg-white shadow-2xl relative z-10 overflow-hidden border-none animate-slide-up">
        {/* Header */}
        <div className="bg-[#000926] p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="currentColor">

              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">

            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <span className="text-xs font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded">
                {stock.exchange || 'NSE'}
              </span>
              <span className="text-xs font-medium">Invest in</span>
            </div>
            <h2 className="text-2xl font-bold mb-1">{stock.name}</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ₹
                {stock.price.toLocaleString('en-IN', {
                  minimumFractionDigits: 2
                })}
              </span>
              <span className="text-sm opacity-70">{stock.symbol}</span>
            </div>
          </div>
        </div>

        {/* Broker List */}
        <div className="p-6 bg-white max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Select your preferred broker to continue</span>
          </div>

          <div className="space-y-3">
            {brokers.map((broker) =>
            <a
              key={broker.name}
              href={broker.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md group ${broker.bgColor} ${broker.borderColor} hover:border-opacity-100 border-opacity-50`}
              onClick={onClose}>

                <div
                className={`w-12 h-12 rounded-full ${broker.color} flex items-center justify-center text-white font-bold text-xl shadow-sm shrink-0`}>

                  {broker.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-bold text-[#000926]">{broker.name}</h3>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0F52BA] transition-colors" />
                  </div>
                  <p
                  className={`text-xs ${broker.textColor} font-medium truncate`}>

                    {broker.description}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-gray-100 group-hover:border-[#0F52BA] group-hover:text-[#0F52BA] transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            You will be redirected to the broker's platform to complete your
            transaction.
          </p>
        </div>
      </Card>
    </div>);

}