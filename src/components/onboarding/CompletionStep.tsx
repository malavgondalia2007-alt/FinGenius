import React from 'react';
import { Button } from '../ui/Button';
import { CheckCircle } from 'lucide-react';
interface CompletionStepProps {
  onFinish: () => void;
}
export function CompletionStep({ onFinish }: CompletionStepProps) {
  return (
    <div className="text-center animate-fade-in py-12">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
        <CheckCircle className="w-10 h-10" />
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-4">All Set!</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Your profile is ready. FinGenius has analyzed your data and prepared
        your personalized dashboard.
      </p>

      <Button
        onClick={onFinish}
        size="lg"
        className="px-12 bg-green-600 hover:bg-green-700">

        Go to Dashboard
      </Button>
    </div>);

}