import React from 'react';
import { Button } from '../ui/Button';
import { GraduationCap, Briefcase } from 'lucide-react';
interface TypeStepProps {
  onNext: (type: 'student' | 'employee') => void;
  onBack: () => void;
}
export function TypeStep({ onNext, onBack }: TypeStepProps) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Which describes you best?
      </h2>
      <p className="text-gray-500 mb-8 text-center">
        We'll customize your dashboard based on your profile.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => onNext('student')}
          className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">

          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Student</h3>
          <p className="text-gray-500 text-center text-sm">
            I manage pocket money and want to save for small goals.
          </p>
        </button>

        <button
          onClick={() => onNext('employee')}
          className="flex flex-col items-center p-8 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">

          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Employee</h3>
          <p className="text-gray-500 text-center text-sm">
            I earn a salary and want to manage expenses, savings & investments.
          </p>
        </button>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack} className="w-32">
          Back
        </Button>
      </div>
    </div>);

}