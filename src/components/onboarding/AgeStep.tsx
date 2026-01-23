import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Info } from 'lucide-react';
interface AgeStepProps {
  onNext: (age: number) => void;
  onBack: () => void;
}
export function AgeStep({ onNext, onBack }: AgeStepProps) {
  const [age, setAge] = useState<string>('');
  const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 100) {
      setError('Please enter a valid age between 13 and 100');
      return;
    }
    onNext(ageNum);
  };
  const ageNum = parseInt(age);
  const showAutoAssignMessage = !isNaN(ageNum) && ageNum >= 13 && ageNum < 18;
  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        How old are you?
      </h2>
      <p className="text-gray-500 mb-8 text-center">
        This helps us tailor financial advice for your life stage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="number"
          label="Your Age"
          placeholder="e.g. 24"
          value={age}
          onChange={(e) => {
            setAge(e.target.value);
            setError('');
          }}
          error={error}
          autoFocus />


        {showAutoAssignMessage &&
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Student Profile Selected
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Since you're under 18, we'll set up a student profile for you
                with pocket money tracking and savings goals.
              </p>
            </div>
          </div>
        }

        {!isNaN(ageNum) && ageNum >= 18 && ageNum <= 100 &&
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">
                Choose Your Profile
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Next, you'll choose between Student or Employee profile based on
                your current situation.
              </p>
            </div>
          </div>
        }

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} fullWidth>
            Back
          </Button>
          <Button type="submit" fullWidth disabled={!age}>
            Next
          </Button>
        </div>
      </form>
    </div>);

}