import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
interface FundCardProps {
  name: string;
  returns: string;
  minSip: string;
  risk: 'High Risk' | 'Moderate Risk' | 'Low Risk';
}
export function FundCard({ name, returns, minSip, risk }: FundCardProps) {
  const getRiskVariant = (risk: string) => {
    switch (risk) {
      case 'High Risk':
        return 'danger';
      case 'Moderate Risk':
        return 'warning';
      case 'Low Risk':
        return 'success';
      default:
        return 'neutral';
    }
  };
  return (
    <Card className="p-6 flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-6">{name}</h3>

        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">5Y Returns:</span>
          <span className="font-bold text-gray-900">{returns}</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <span className="text-sm text-gray-500">Min SIP:</span>
          <span className="font-bold text-gray-900">{minSip}</span>
        </div>

        <div className="mb-6">
          <Badge variant={getRiskVariant(risk)}>{risk}</Badge>
        </div>
      </div>

      <Button fullWidth>Invest Now</Button>
    </Card>);

}