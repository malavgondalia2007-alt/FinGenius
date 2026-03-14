import React, { useMemo, useState, Component } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  CheckCircle } from
'lucide-react';
export function ProfitLossCalculator() {
  const [tradeType, setTradeType] = useState<'delivery' | 'intraday'>(
    'delivery'
  );
  const [exchange, setExchange] = useState<'NSE' | 'BSE'>('NSE');
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const results = useMemo(() => {
    const buy = parseFloat(buyPrice) || 0;
    const sell = parseFloat(sellPrice) || 0;
    const qty = parseFloat(quantity) || 0;
    if (buy <= 0 || sell <= 0 || qty <= 0) return null;
    const buyValue = buy * qty;
    const sellValue = sell * qty;
    const turnover = buyValue + sellValue;
    const grossPL = sellValue - buyValue;
    const isDelivery = tradeType === 'delivery';
    const isNSE = exchange === 'NSE';
    // Helper to calculate charges for a broker
    const calculateBrokerCharges = (brokerName: string) => {
      let brokerage = 0;
      let dpCharges = 0;
      // Brokerage Logic
      if (brokerName === 'Groww') {
        // Flat ₹20 or 0.05% whichever is lower
        brokerage = Math.min(20, turnover * 0.0005);
        dpCharges = isDelivery ? 15.34 : 0;
      } else if (brokerName === 'Angel One') {
        if (isDelivery) {
          brokerage = 0;
        } else {
          brokerage = Math.min(20, turnover * 0.0005);
        }
        dpCharges = isDelivery ? 20 : 0;
      } else if (brokerName === 'Paytm Money') {
        if (isDelivery) {
          // Free if order value < 500 (assuming turnover represents order value here for simplicity)
          // Actually logic says "order", let's assume buy/sell are separate orders.
          // If buyValue < 500 -> 0, if sellValue < 500 -> 0.
          // But usually brokerage is calculated per leg.
          // Let's stick to the prompt's simplified logic: "delivery brokerage = 0 if order < 500 else min(20, value * 0.0005)"
          // We'll calculate brokerage on buy and sell separately for Paytm to be precise
          const buyBrokerage =
          buyValue < 500 ? 0 : Math.min(20, buyValue * 0.0005);
          const sellBrokerage =
          sellValue < 500 ? 0 : Math.min(20, sellValue * 0.0005);
          brokerage = buyBrokerage + sellBrokerage;
        } else {
          brokerage = Math.min(20, turnover * 0.0005);
        }
        dpCharges = isDelivery ? 15.34 : 0;
      }
      // Common Regulatory Charges
      const stt = isDelivery ? turnover * 0.001 : sellValue * 0.00025;
      const exchangeCharges = turnover * (isNSE ? 0.0000345 : 0.0000375);
      const sebiCharges = turnover * 0.000001;
      const stampDuty = buyValue * (isDelivery ? 0.00015 : 0.00003);
      // GST is 18% on Brokerage + Exchange Charges (SEBI charges often included in base, but prompt said Brokerage + Transaction)
      // Let's include SEBI in GST base as is common practice, though prompt was specific.
      // Prompt: "GST: 18% on (brokerage + transaction charges)"
      // Calculation block: "gst = (brokerage + exchangeCharges) * 0.18" -> I will follow calculation block.
      const gst = (brokerage + exchangeCharges) * 0.18;
      const totalCharges =
      brokerage +
      stt +
      exchangeCharges +
      sebiCharges +
      stampDuty +
      gst +
      dpCharges;
      const netPL = grossPL - totalCharges;
      const effectiveCostPerShare = (buyValue + totalCharges) / qty; // Break-even price effectively
      return {
        brokerage,
        stt,
        exchangeCharges,
        sebiCharges,
        stampDuty,
        gst,
        dpCharges,
        totalCharges,
        netPL,
        grossPL
      };
    };
    const groww = calculateBrokerCharges('Groww');
    const angel = calculateBrokerCharges('Angel One');
    const paytm = calculateBrokerCharges('Paytm Money');
    // Find best broker
    const brokers = [
    {
      name: 'Groww',
      data: groww
    },
    {
      name: 'Angel One',
      data: angel
    },
    {
      name: 'Paytm Money',
      data: paytm
    }];

    // Sort by Net P&L descending (highest profit / lowest loss)
    const sorted = [...brokers].sort((a, b) => b.data.netPL - a.data.netPL);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const savings = best.data.netPL - worst.data.netPL;
    return {
      groww,
      angel,
      paytm,
      bestBroker: best.name,
      savings,
      turnover
    };
  }, [buyPrice, sellPrice, quantity, tradeType, exchange]);
  const formatCurrency = (val: number) => {
    return (
      '₹' +
      val.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }));

  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#000926] mb-2">
          Profit & Loss Calculator
        </h2>
        <p className="text-[#000926]/70">
          See your actual take-home profit after every charge is deducted
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <Card className="p-6 bg-white border-[#A6C5D7] h-fit">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-[#D6E6F3] rounded-lg text-[#0F52BA]">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-[#000926]">Trade Details</h3>
          </div>

          <div className="space-y-5">
            {/* Trade Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-[#000926]/70 mb-2">
                Trade Type
              </label>
              <div className="bg-[#F1F5F9] p-1 rounded-xl flex">
                <button
                  onClick={() => setTradeType('delivery')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tradeType === 'delivery' ? 'bg-white text-[#0F52BA] shadow-sm' : 'text-[#000926]/60 hover:text-[#000926]'}`}>

                  Delivery
                </button>
                <button
                  onClick={() => setTradeType('intraday')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tradeType === 'intraday' ? 'bg-white text-[#0F52BA] shadow-sm' : 'text-[#000926]/60 hover:text-[#000926]'}`}>

                  Intraday
                </button>
              </div>
            </div>

            {/* Inputs */}
            <Input
              label="Buy Price"
              placeholder="e.g. 1000"
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)} />

            <Input
              label="Sell Price"
              placeholder="e.g. 1100"
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)} />

            <Input
              label="Quantity"
              placeholder="e.g. 10"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)} />


            {/* Exchange Toggle */}
            <div>
              <label className="block text-sm font-medium text-[#000926]/70 mb-2">
                Exchange
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={exchange === 'NSE'}
                    onChange={() => setExchange('NSE')}
                    className="text-[#0F52BA] focus:ring-[#0F52BA]" />

                  <span className="text-sm font-medium text-[#000926]">
                    NSE
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={exchange === 'BSE'}
                    onChange={() => setExchange('BSE')}
                    className="text-[#0F52BA] focus:ring-[#0F52BA]" />

                  <span className="text-sm font-medium text-[#000926]">
                    BSE
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!results ?
          <div className="h-full flex flex-col items-center justify-center p-12 bg-white/50 border-2 border-dashed border-[#A6C5D7] rounded-2xl text-center">
              <div className="w-16 h-16 bg-[#D6E6F3] rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-[#0F52BA]/50" />
              </div>
              <h3 className="text-lg font-bold text-[#000926]/60">
                Enter trade details
              </h3>
              <p className="text-[#000926]/40 max-w-xs mx-auto mt-2">
                Fill in the buy/sell price and quantity to see the detailed fee
                breakdown.
              </p>
            </div> :

          <>
              {/* Best Broker Summary */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4 animate-in slide-in-from-top-4">
                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900">
                    Best Broker: {results.bestBroker}
                  </h4>
                  <p className="text-sm text-emerald-700">
                    You save{' '}
                    <span className="font-bold">
                      {formatCurrency(results.savings)}
                    </span>{' '}
                    compared to the most expensive broker for this trade.
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <Card className="overflow-hidden border-[#A6C5D7]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#D6E6F3]/30 border-b border-[#A6C5D7]">
                        <th className="p-3 text-left font-bold text-[#000926]">
                          Component
                        </th>
                        <th
                        className={`p-3 text-right font-bold ${results.bestBroker === 'Groww' ? 'text-emerald-700 bg-emerald-50' : 'text-[#000926]'}`}>

                          Groww
                        </th>
                        <th
                        className={`p-3 text-right font-bold ${results.bestBroker === 'Angel One' ? 'text-emerald-700 bg-emerald-50' : 'text-[#000926]'}`}>

                          Angel One
                        </th>
                        <th
                        className={`p-3 text-right font-bold ${results.bestBroker === 'Paytm Money' ? 'text-emerald-700 bg-emerald-50' : 'text-[#000926]'}`}>

                          Paytm Money
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-3 font-medium text-[#000926]/70">
                          Turnover
                        </td>
                        <td className="p-3 text-right text-[#000926]">
                          {formatCurrency(results.turnover)}
                        </td>
                        <td className="p-3 text-right text-[#000926]">
                          {formatCurrency(results.turnover)}
                        </td>
                        <td className="p-3 text-right text-[#000926]">
                          {formatCurrency(results.turnover)}
                        </td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-3 font-medium text-[#000926]">
                          Gross P&L
                        </td>
                        <td
                        className={`p-3 text-right font-bold ${results.groww.grossPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                          {formatCurrency(results.groww.grossPL)}
                        </td>
                        <td
                        className={`p-3 text-right font-bold ${results.angel.grossPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                          {formatCurrency(results.angel.grossPL)}
                        </td>
                        <td
                        className={`p-3 text-right font-bold ${results.paytm.grossPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>

                          {formatCurrency(results.paytm.grossPL)}
                        </td>
                      </tr>
                      {/* Charges */}
                      <tr>
                        <td className="p-3 text-[#000926]/70 pl-6">
                          Brokerage
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.groww.brokerage)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.angel.brokerage)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.paytm.brokerage)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-[#000926]/70 pl-6">STT</td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.groww.stt)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.angel.stt)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.paytm.stt)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-[#000926]/70 pl-6">
                          Exchange Txn
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.groww.exchangeCharges)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.angel.exchangeCharges)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.paytm.exchangeCharges)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-[#000926]/70 pl-6">
                          GST (18%)
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.groww.gst)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.angel.gst)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.paytm.gst)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-[#000926]/70 pl-6">
                          Stamp Duty
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.groww.stampDuty)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.angel.stampDuty)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.paytm.stampDuty)}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 text-[#000926]/70 pl-6">
                          SEBI Charges
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.groww.sebiCharges)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.angel.sebiCharges)}
                        </td>
                        <td className="p-3 text-right text-red-500">
                          -{formatCurrency(results.paytm.sebiCharges)}
                        </td>
                      </tr>
                      {tradeType === 'delivery' &&
                    <tr>
                          <td className="p-3 text-[#000926]/70 pl-6">
                            DP Charges
                          </td>
                          <td className="p-3 text-right text-red-500">
                            -{formatCurrency(results.groww.dpCharges)}
                          </td>
                          <td className="p-3 text-right text-red-500">
                            -{formatCurrency(results.angel.dpCharges)}
                          </td>
                          <td className="p-3 text-right text-red-500">
                            -{formatCurrency(results.paytm.dpCharges)}
                          </td>
                        </tr>
                    }

                      <tr className="bg-gray-50 font-semibold">
                        <td className="p-3 text-[#000926]">Total Charges</td>
                        <td className="p-3 text-right text-red-600">
                          -{formatCurrency(results.groww.totalCharges)}
                        </td>
                        <td className="p-3 text-right text-red-600">
                          -{formatCurrency(results.angel.totalCharges)}
                        </td>
                        <td className="p-3 text-right text-red-600">
                          -{formatCurrency(results.paytm.totalCharges)}
                        </td>
                      </tr>

                      <tr className="bg-[#D6E6F3]/20 border-t-2 border-[#A6C5D7]">
                        <td className="p-4 font-bold text-lg text-[#000926]">
                          Net P&L
                        </td>
                        <td
                        className={`p-4 text-right font-bold text-lg ${results.groww.netPL >= 0 ? 'text-emerald-600' : 'text-red-600'} ${results.bestBroker === 'Groww' ? 'bg-emerald-50' : ''}`}>

                          {formatCurrency(results.groww.netPL)}
                        </td>
                        <td
                        className={`p-4 text-right font-bold text-lg ${results.angel.netPL >= 0 ? 'text-emerald-600' : 'text-red-600'} ${results.bestBroker === 'Angel One' ? 'bg-emerald-50' : ''}`}>

                          {formatCurrency(results.angel.netPL)}
                        </td>
                        <td
                        className={`p-4 text-right font-bold text-lg ${results.paytm.netPL >= 0 ? 'text-emerald-600' : 'text-red-600'} ${results.bestBroker === 'Paytm Money' ? 'bg-emerald-50' : ''}`}>

                          {formatCurrency(results.paytm.netPL)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          }
        </div>
      </div>
    </div>);

}