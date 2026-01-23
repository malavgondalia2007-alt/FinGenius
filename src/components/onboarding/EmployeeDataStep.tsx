import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Calculator, Info, ChevronDown, ChevronUp } from 'lucide-react';
interface EmployeeDataStepProps {
  onNext: (data: {
    monthlyIncome: number;
    fixedExpenses: {
      rent: number;
      groceries: number;
      utilities: number;
    };
    loans: {
      homeLoan: number;
      carLoan: number;
      personalLoan: number;
      educationLoan: number;
    };
    sipCommitments: number;
    savingsPreference: number;
  }) => void;
  onBack: () => void;
}
export function EmployeeDataStep({ onNext, onBack }: EmployeeDataStepProps) {
  const [income, setIncome] = useState('');
  // Optional fields - collapsed by default
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  // Fixed Expenses (Optional)
  const [rent, setRent] = useState('');
  const [groceries, setGroceries] = useState('');
  const [utilities, setUtilities] = useState('');
  // Loan EMIs (Optional)
  const [homeLoan, setHomeLoan] = useState('');
  const [carLoan, setCarLoan] = useState('');
  const [personalLoan, setPersonalLoan] = useState('');
  const [educationLoan, setEducationLoan] = useState('');
  // SIP commitments (Optional)
  const [sipCommitments, setSipCommitments] = useState('');
  const [savingsPref, setSavingsPref] = useState('35');
  // Calculate totals
  const totalFixedExpenses =
  (parseFloat(rent) || 0) + (
  parseFloat(groceries) || 0) + (
  parseFloat(utilities) || 0);
  const totalLoans =
  (parseFloat(homeLoan) || 0) + (
  parseFloat(carLoan) || 0) + (
  parseFloat(personalLoan) || 0) + (
  parseFloat(educationLoan) || 0);
  const totalSips = parseFloat(sipCommitments) || 0;
  const totalCommitments = totalFixedExpenses + totalLoans + totalSips;
  const remainingIncome = (parseFloat(income) || 0) - totalCommitments;
  const suggestedSavingsMin = Math.round(remainingIncome * 0.3);
  const suggestedSavingsMax = Math.round(remainingIncome * 0.4);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      monthlyIncome: parseFloat(income),
      fixedExpenses: {
        rent: parseFloat(rent) || 0,
        groceries: parseFloat(groceries) || 0,
        utilities: parseFloat(utilities) || 0
      },
      loans: {
        homeLoan: parseFloat(homeLoan) || 0,
        carLoan: parseFloat(carLoan) || 0,
        personalLoan: parseFloat(personalLoan) || 0,
        educationLoan: parseFloat(educationLoan) || 0
      },
      sipCommitments: parseFloat(sipCommitments) || 0,
      savingsPreference: parseFloat(savingsPref)
    });
  };
  const hasAnyOptionalData = totalCommitments > 0;
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Employee Financial Profile
      </h2>
      <p className="text-gray-500 mb-8 text-center">
        Start with your salary - other details are optional
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Income Section - Required */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-300 shadow-sm">
          <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Monthly Salary (Required)
          </h3>
          <Input
            type="number"
            label="Net Monthly Salary (₹)"
            placeholder="e.g. 85000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            required
            className="bg-white" />

          <p className="text-xs text-emerald-700 mt-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Enter your in-hand salary after tax deductions
          </p>
        </div>

        {/* Optional Fields Toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all font-medium shadow-sm">

            {showOptionalFields ?
            <>
                <ChevronUp className="w-5 h-5" />
                Hide Optional Details
              </> :

            <>
                <ChevronDown className="w-5 h-5" />
                Add Optional Details (Rent, Loans, SIP, etc.)
              </>
            }
          </button>
          <p className="text-xs text-gray-500 mt-2">
            {showOptionalFields ?
            'These help us give you more accurate savings recommendations' :
            'Skip if you want to add these later'}
          </p>
        </div>

        {/* Optional Fields - Collapsible */}
        {showOptionalFields &&
        <div className="space-y-6 animate-fade-in">
            {/* Fixed Expenses Section - Optional */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-blue-600">🏠</span>
                  Fixed Monthly Expenses
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                label="Rent / Housing"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                placeholder="0" />

                <Input
                label="Groceries"
                type="number"
                value={groceries}
                onChange={(e) => setGroceries(e.target.value)}
                placeholder="0" />

                <Input
                label="Utilities (Bills, Internet)"
                type="number"
                value={utilities}
                onChange={(e) => setUtilities(e.target.value)}
                placeholder="0" />

              </div>
              {totalFixedExpenses > 0 &&
            <div className="mt-4 text-right text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Total Fixed Expenses:{' '}
                  <span className="font-bold text-blue-700">
                    ₹{totalFixedExpenses.toLocaleString()}
                  </span>
                </div>
            }
            </div>

            {/* Loan EMIs Section - Optional */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-orange-600">📋</span>
                  Loan EMIs (Monthly)
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                  Optional
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                label="Home Loan EMI"
                type="number"
                value={homeLoan}
                onChange={(e) => setHomeLoan(e.target.value)}
                placeholder="0" />

                <Input
                label="Car Loan EMI"
                type="number"
                value={carLoan}
                onChange={(e) => setCarLoan(e.target.value)}
                placeholder="0" />

                <Input
                label="Personal Loan EMI"
                type="number"
                value={personalLoan}
                onChange={(e) => setPersonalLoan(e.target.value)}
                placeholder="0" />

                <Input
                label="Education Loan EMI"
                type="number"
                value={educationLoan}
                onChange={(e) => setEducationLoan(e.target.value)}
                placeholder="0" />

              </div>
              {totalLoans > 0 &&
            <div className="mt-4 text-right text-sm text-gray-600 bg-orange-50 p-3 rounded-lg">
                  Total Loan EMIs:{' '}
                  <span className="font-bold text-orange-700">
                    ₹{totalLoans.toLocaleString()}
                  </span>
                </div>
            }
            </div>

            {/* SIP Commitments Section - Optional */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-purple-600">📈</span>
                  SIP Commitments
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                  Optional
                </span>
              </div>
              <Input
              label="Total Monthly SIP Amount (₹)"
              type="number"
              value={sipCommitments}
              onChange={(e) => setSipCommitments(e.target.value)}
              placeholder="0" />

              <p className="text-xs text-gray-500 mt-2 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Include all your existing mutual fund SIPs and recurring
                investments
              </p>
            </div>
          </div>
        }

        {/* Savings Capacity Calculation - Only show if income is entered */}
        {income &&
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-blue-700" />
              <h3 className="font-bold text-blue-900">Your Savings Capacity</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Monthly Income:</span>
                <span className="font-bold text-blue-900">
                  ₹{(parseFloat(income) || 0).toLocaleString()}
                </span>
              </div>

              {hasAnyOptionalData &&
            <>
                  {totalFixedExpenses > 0 &&
              <div className="flex justify-between text-gray-600">
                      <span>− Fixed Expenses:</span>
                      <span className="font-medium">
                        ₹{totalFixedExpenses.toLocaleString()}
                      </span>
                    </div>
              }
                  {totalLoans > 0 &&
              <div className="flex justify-between text-gray-600">
                      <span>− Loan EMIs:</span>
                      <span className="font-medium">
                        ₹{totalLoans.toLocaleString()}
                      </span>
                    </div>
              }
                  {totalSips > 0 &&
              <div className="flex justify-between text-gray-600">
                      <span>− SIP Commitments:</span>
                      <span className="font-medium">
                        ₹{totalSips.toLocaleString()}
                      </span>
                    </div>
              }
                  <div className="border-t-2 border-blue-300 pt-3 flex justify-between">
                    <span className="font-bold text-blue-900">
                      Remaining Income:
                    </span>
                    <span className="font-bold text-blue-900 text-lg">
                      ₹{Math.max(0, remainingIncome).toLocaleString()}
                    </span>
                  </div>
                </>
            }
            </div>

            {remainingIncome > 0 &&
          <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  💡 Recommended Savings Range:
                </p>
                <p className="text-lg font-bold text-blue-700">
                  ₹{suggestedSavingsMin.toLocaleString()} - ₹
                  {suggestedSavingsMax.toLocaleString()}/month
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {hasAnyOptionalData ?
              '(30-40% of remaining income for goals and emergency fund)' :
              '(30-40% of your salary - add optional details for more accurate calculation)'}
                </p>
              </div>
          }

            {income && remainingIncome <= 0 && hasAnyOptionalData &&
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">
                  ⚠️ Your commitments exceed your income. Please review your
                  entries or consider adjusting your expenses.
                </p>
              </div>
          }
          </div>
        }

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} fullWidth>
            Back
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={!income || hasAnyOptionalData && remainingIncome <= 0}>

            Complete Setup
          </Button>
        </div>
      </form>
    </div>);

}