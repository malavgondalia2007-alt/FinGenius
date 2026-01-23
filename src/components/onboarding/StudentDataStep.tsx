import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
interface StudentDataStepProps {
  onNext: (data: {weeklyPocketMoney: number;weeklyExpenses: number;}) => void;
  onBack: () => void;
}
export function StudentDataStep({ onNext, onBack }: StudentDataStepProps) {
  const [pocketMoney, setPocketMoney] = useState('');
  const [expenses, setExpenses] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      weeklyPocketMoney: parseFloat(pocketMoney),
      weeklyExpenses: parseFloat(expenses)
    });
  };
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Student Finances
      </h2>
      <p className="text-gray-500 mb-8 text-center">
        Let's understand your weekly budget.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="number"
          label="Weekly Pocket Money (₹)"
          placeholder="e.g. 2000"
          value={pocketMoney}
          onChange={(e) => setPocketMoney(e.target.value)}
          required />


        <Input
          type="number"
          label="Estimated Weekly Expenses (₹)"
          placeholder="e.g. 1500"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          required />


        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
          <p>
            Based on this, your potential weekly savings:{' '}
            <span className="font-bold">
              ₹
              {Math.max(
                0,
                (parseFloat(pocketMoney) || 0) - (parseFloat(expenses) || 0)
              )}
            </span>
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} fullWidth>
            Back
          </Button>
          <Button type="submit" fullWidth disabled={!pocketMoney || !expenses}>
            Complete Setup
          </Button>
        </div>
      </form>
    </div>);

}