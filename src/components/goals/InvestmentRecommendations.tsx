import React from 'react';
import { InvestmentRecommendation } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  TrendingUp,
  Shield,
  Info,
  ArrowRight,
  AlertTriangle } from
'lucide-react';
import { motion } from 'framer-motion';
interface InvestmentRecommendationsProps {
  recommendations: InvestmentRecommendation[];
  riskProfile: 'Low' | 'Moderate' | 'High';
  onSelect?: (fundId: string) => void;
}
export function InvestmentRecommendations({
  recommendations,
  riskProfile,
  onSelect
}: InvestmentRecommendationsProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-100 text-emerald-800';
      case 'Moderate':
        return 'bg-blue-100 text-blue-800';
      case 'High':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low':
        return <Shield className="w-4 h-4" />;
      case 'Moderate':
        return <Info className="w-4 h-4" />;
      case 'High':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-900">Recommended for You</h4>
            <p className="text-sm text-indigo-700 mt-1">
              Based on your goal timeline and risk profile ({riskProfile} Risk),
              these India-focused options can help grow your savings.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {recommendations.map((rec, index) =>
        <motion.div
          key={rec.fundId}
          initial={{
            opacity: 0,
            y: 10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: index * 0.1
          }}>

            <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                    className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${getRiskColor(rec.risk)}`}>

                      {getRiskIcon(rec.risk)}
                      {rec.risk} Risk
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {rec.category}
                    </span>
                  </div>
                  <h5 className="font-bold text-gray-900">{rec.fundName}</h5>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">3Y Returns</p>
                  <p className="text-lg font-bold text-emerald-600">
                    +{rec.returns3Yr}%
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                💡 {rec.reason}
              </p>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Min SIP:{' '}
                  <span className="font-medium text-gray-900">
                    ₹{rec.minSip}
                  </span>
                </p>
                <Button
                variant="outline"
                className="text-xs h-8 px-3"
                onClick={() => onSelect?.(rec.fundId)}>

                  Details <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-100">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Disclaimer: These are educational suggestions based on historical
          data. Mutual fund investments are subject to market risks. Please read
          all scheme related documents carefully.
        </p>
      </div>
    </div>);

}