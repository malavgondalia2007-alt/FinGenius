import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, CommitmentCategory, Goal } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  getSpendingRangeForGoalType,
  SpendingRange } from
'../../utils/goalCalculations';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Target,
  Shield,
  GraduationCap,
  Plane,
  Smartphone,
  PiggyBank,
  X,
  AlertCircle,
  TrendingUp,
  Info } from
'lucide-react';
interface GoalSetupWizardProps {
  profile: UserProfile | null;
  onComplete: (goal: Partial<Goal>, commitments: CommitmentCategory[]) => void;
  onClose: () => void;
}
const GOAL_TYPES = [
{
  id: 'emergency',
  name: 'Emergency Fund',
  icon: Shield,
  desc: 'Safety net for unexpected expenses',
  months: 6
},
{
  id: 'education',
  name: 'Education',
  icon: GraduationCap,
  desc: 'Tuition fees, courses, or books',
  months: 24
},
{
  id: 'travel',
  name: 'Travel',
  icon: Plane,
  desc: 'Vacations and trips',
  months: 12
},
{
  id: 'gadget',
  name: 'Gadget',
  icon: Smartphone,
  desc: 'Phone, laptop, or electronics',
  months: 6
},
{
  id: 'general',
  name: 'General Savings',
  icon: PiggyBank,
  desc: 'Saving for the future',
  months: 12
},
{
  id: 'just_save',
  name: 'Just Save Money',
  icon: Target,
  desc: 'Maximize savings without a specific goal',
  months: 12
}];

export function GoalSetupWizard({
  profile,
  onComplete,
  onClose
}: GoalSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [stepInput, setStepInput] = useState('1');
  const [selectedGoalType, setSelectedGoalType] = useState('');
  const [previewGoalType, setPreviewGoalType] = useState<string | null>(null);
  const [spendingRange, setSpendingRange] = useState<SpendingRange | null>(null);
  const [targetAmount, setTargetAmount] = useState('');
  const [timeline, setTimeline] = useState('');
  const [goalName, setGoalName] = useState('');
  // Get income from profile - handle both student and employee
  const income = profile ?
  profile.type === 'student' ?
  (profile.weeklyPocketMoney || 0) * 4 :
  profile.monthlyIncome || 0 :
  0;
  // Calculate commitments from profile
  const totalCommitments =
  (profile?.fixedExpenses?.rent || 0) + (
  profile?.fixedExpenses?.groceries || 0) + (
  profile?.fixedExpenses?.utilities || 0) + (
  profile?.loans?.homeLoan || 0) + (
  profile?.loans?.carLoan || 0) + (
  profile?.loans?.personalLoan || 0) + (
  profile?.loans?.educationLoan || 0) + (
  profile?.sipCommitments || 0);
  const remainingCapacity = income - totalCommitments;
  // Handle manual step input
  const handleStepInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStepInput(value);
    const numValue = parseInt(value);
    if (numValue >= 1 && numValue <= 3) {
      setStep(numValue);
    }
  };
  // Sync stepInput with step changes
  useEffect(() => {
    setStepInput(step.toString());
  }, [step]);
  // Handle goal type click - show spending range preview
  const handleGoalTypeClick = (typeId: string) => {
    setPreviewGoalType(typeId);
    const range = getSpendingRangeForGoalType(typeId, income);
    setSpendingRange(range);
  };
  // Confirm goal type selection and proceed
  const handleGoalTypeConfirm = () => {
    if (!previewGoalType) return;
    setSelectedGoalType(previewGoalType);
    if (previewGoalType === 'just_save') {
      setGoalName('General Savings');
      setTargetAmount(Math.round(remainingCapacity * 12).toString());
      setTimeline('12');
      setStep(3);
    } else {
      const type = GOAL_TYPES.find((t) => t.id === previewGoalType);
      if (type) {
        setGoalName(type.name);
        setTimeline(type.months.toString());
        // Pre-fill with typical amount if available
        if (spendingRange) {
          setTargetAmount(spendingRange.typical.toString());
        }
      }
      setStep(2);
    }
  };
  const handleGoalDetailsSubmit = () => {
    setStep(3);
  };
  const handleFinalSubmit = () => {
    const goalData: Partial<Goal> = {
      name: goalName,
      targetAmount: parseFloat(targetAmount) || 0,
      deadline: new Date(
        Date.now() + parseInt(timeline) * 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      category:
      GOAL_TYPES.find((t) => t.id === selectedGoalType)?.name || 'General',
      savedAmount: 0
    };
    onComplete(goalData, []);
  };
  // Calculations for Step 2 & 3
  const monthlyRequired = parseFloat(targetAmount) / parseInt(timeline) || 0;
  const isFeasible = monthlyRequired <= remainingCapacity;
  // Calculate position for range indicator
  const getRangePosition = (value: number, min: number, max: number) => {
    if (max === min) return 50;
    return Math.min(100, Math.max(0, (value - min) / (max - min) * 100));
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Create Financial Goal
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">Step</p>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={stepInput}
                  onChange={handleStepInputChange}
                  className="w-12 px-2 py-1 text-sm text-center border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />

                <p className="text-sm text-gray-500">of 3</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">

            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <motion.div
            className="h-full bg-blue-600"
            initial={{
              width: 0
            }}
            animate={{
              width: `${step / 3 * 100}%`
            }}
            transition={{
              duration: 0.3
            }} />

        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Goal Type with Spending Range */}
            {step === 1 &&
            <motion.div
              key="step1"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  What are you saving for?
                </h3>
                <p className="text-gray-500 mb-6">
                  Select a category to see typical spending ranges based on your
                  income.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {GOAL_TYPES.map((type) =>
                <button
                  key={type.id}
                  onClick={() => handleGoalTypeClick(type.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left group ${previewGoalType === type.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-300 hover:bg-blue-50/50'}`}>

                      <div
                    className={`w-12 h-12 rounded-lg shadow-sm flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${previewGoalType === type.id ? 'bg-blue-600' : 'bg-white'}`}>

                        <type.icon
                      className={`w-6 h-6 ${previewGoalType === type.id ? 'text-white' : 'text-blue-600'}`} />

                      </div>
                      <h4 className="font-bold text-gray-900 mb-1">
                        {type.name}
                      </h4>
                      <p className="text-sm text-gray-500">{type.desc}</p>
                    </button>
                )}
                </div>

                {/* Spending Range Preview Panel */}
                <AnimatePresence>
                  {previewGoalType && spendingRange &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                    height: 0
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: 'auto'
                  }}
                  exit={{
                    opacity: 0,
                    y: 20,
                    height: 0
                  }}
                  className="overflow-hidden">

                      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                        {previewGoalType === 'just_save' ?
                    // Just Save Money - Show savings capacity
                    <div>
                            <div className="flex items-start gap-3 mb-4">
                              <div className="p-2 bg-emerald-100 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  Your Savings Potential
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Based on your income and commitments
                                </p>
                              </div>
                            </div>

                            <div className="bg-white/80 rounded-xl p-4 mb-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-500 mb-1">
                                  Monthly Savings Capacity
                                </p>
                                <p className="text-4xl font-bold text-emerald-600">
                                  ₹{remainingCapacity.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                  That's ₹
                                  {(remainingCapacity * 12).toLocaleString()}{' '}
                                  per year!
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm text-gray-600 bg-white/60 p-3 rounded-lg">
                              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p>
                                We'll help you maximize your savings without a
                                specific target. Perfect for building wealth
                                over time.
                              </p>
                            </div>
                          </div> :

                    // Regular goal - Show spending range
                    <div>
                            <div className="flex items-start gap-3 mb-4">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Info className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  Typical Spending Range
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {spendingRange.description}
                                </p>
                              </div>
                            </div>

                            {/* Range Display */}
                            <div className="bg-white/80 rounded-xl p-4 mb-4">
                              <div className="flex justify-between items-end mb-3">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Minimum
                                  </p>
                                  <p className="text-lg font-semibold text-gray-700">
                                    ₹{spendingRange.min.toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-blue-600 font-medium">
                                    Typical
                                  </p>
                                  <p className="text-2xl font-bold text-blue-600">
                                    ₹{spendingRange.typical.toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">
                                    Maximum
                                  </p>
                                  <p className="text-lg font-semibold text-gray-700">
                                    ₹{spendingRange.max.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Visual Range Indicator */}
                              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                            className="absolute h-full bg-gradient-to-r from-blue-300 via-blue-500 to-blue-300 rounded-full"
                            style={{
                              left: '0%',
                              width: '100%'
                            }} />

                                {/* Typical marker */}
                                <motion.div
                            initial={{
                              scale: 0
                            }}
                            animate={{
                              scale: 1
                            }}
                            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg"
                            style={{
                              left: `${getRangePosition(spendingRange.typical, spendingRange.min, spendingRange.max)}%`,
                              transform: 'translate(-50%, -50%)'
                            }} />

                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-400">
                                  Budget
                                </span>
                                <span className="text-xs text-gray-400">
                                  Premium
                                </span>
                              </div>
                            </div>

                            {/* Feasibility Check */}
                            {spendingRange.typical <=
                      remainingCapacity *
                      parseInt(
                        GOAL_TYPES.find(
                          (t) => t.id === previewGoalType
                        )?.months.toString() || '12'
                      ) ?
                      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                <Check className="w-4 h-4" />
                                <p>
                                  This goal is achievable with your current
                                  savings capacity!
                                </p>
                              </div> :

                      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <AlertCircle className="w-4 h-4" />
                                <p>
                                  This may require adjusting your timeline or
                                  commitments.
                                </p>
                              </div>
                      }
                          </div>
                    }

                        {/* Continue Button */}
                        <Button
                      onClick={handleGoalTypeConfirm}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700">

                          Continue with{' '}
                          {
                      GOAL_TYPES.find((t) => t.id === previewGoalType)?.
                      name
                      }
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                }
                </AnimatePresence>
              </motion.div>
            }

            {/* Step 2: Goal Details */}
            {step === 2 &&
            <motion.div
              key="step2"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              className="max-w-xl mx-auto">

                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Goal Details
                </h3>

                {/* Available Monthly Savings - Prominent Display */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6 border-2 border-blue-200 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-50"></div>
                  <div className="relative">
                    <p className="text-sm font-medium text-blue-700 mb-1">
                      Available Monthly Savings
                    </p>
                    <p className="text-4xl font-bold text-blue-900 mb-2">
                      ₹{remainingCapacity.toLocaleString()}
                    </p>
                    <p className="text-xs text-blue-600">
                      Based on your income and commitments, you can comfortably
                      save this amount each month.
                    </p>
                  </div>
                </div>

                {/* Spending Range Reference */}
                {spendingRange && selectedGoalType !== 'just_save' &&
              <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">
                      Typical range for{' '}
                      {GOAL_TYPES.find((t) => t.id === selectedGoalType)?.name}:
                    </p>
                    <p className="font-semibold text-gray-900">
                      ₹{spendingRange.min.toLocaleString()} - ₹
                      {spendingRange.max.toLocaleString()}
                      <span className="text-blue-600 ml-2">
                        (Typical: ₹{spendingRange.typical.toLocaleString()})
                      </span>
                    </p>
                  </div>
              }

                <div className="space-y-5">
                  <Input
                  label="Goal Name"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Europe Trip" />


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-gray-500 font-medium">
                        ₹
                      </span>
                      <input
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      placeholder="100000"
                      className="w-full pl-8 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />

                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Timeline (Months)
                    </label>
                    <input
                    type="range"
                    min="1"
                    max="60"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />

                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">1 month</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {timeline} months
                      </span>
                      <span className="text-sm text-gray-500">5 years</span>
                    </div>
                  </div>

                  {targetAmount && timeline &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className={`p-4 rounded-xl border-2 ${isFeasible ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>

                      <div className="flex items-start gap-3">
                        {isFeasible ?
                    <div className="p-1.5 bg-emerald-500 rounded-full">
                            <Check className="w-4 h-4 text-white" />
                          </div> :

                    <div className="p-1.5 bg-amber-500 rounded-full">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                    }
                        <div className="flex-1">
                          <p
                        className={`font-bold text-lg mb-1 ${isFeasible ? 'text-emerald-900' : 'text-amber-900'}`}>

                            Required: ₹
                            {Math.round(monthlyRequired).toLocaleString()}/month
                          </p>
                          <p
                        className={`text-sm ${isFeasible ? 'text-emerald-700' : 'text-amber-700'}`}>

                            {isFeasible ?
                        '✓ Great! This is within your savings capacity.' :
                        `This exceeds your capacity by ₹${Math.round(monthlyRequired - remainingCapacity).toLocaleString()}. Consider extending the timeline to ${Math.ceil(parseFloat(targetAmount) / remainingCapacity)} months.`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                }
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="px-6">

                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                  onClick={handleGoalDetailsSubmit}
                  disabled={!targetAmount || !timeline || !goalName}
                  className="bg-blue-600 hover:bg-blue-700 px-8">

                    Review
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            }

            {/* Step 3: Review */}
            {step === 3 &&
            <motion.div
              key="step3"
              initial={{
                opacity: 0,
                x: 20
              }}
              animate={{
                opacity: 1,
                x: 0
              }}
              exit={{
                opacity: 0,
                x: -20
              }}
              className="max-w-2xl mx-auto">

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Ready to start?
                  </h3>
                  <p className="text-gray-500">
                    Here's your personalized plan.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-bold text-gray-900">Goal Summary</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal Name</span>
                      <span className="font-medium text-gray-900">
                        {goalName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Amount</span>
                      <span className="font-medium text-gray-900">
                        ₹{parseFloat(targetAmount || '0').toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeline</span>
                      <span className="font-medium text-gray-900">
                        {timeline || '12'} months
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <span className="text-gray-600">
                        Monthly Savings Required
                      </span>
                      <span className="font-bold text-blue-600">
                        ₹
                        {Math.round(
                        monthlyRequired || remainingCapacity
                      ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h4 className="font-bold text-gray-900">
                      Financial Health Check
                    </h4>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Monthly Income</p>
                      <p className="font-medium">₹{income.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Commitments</p>
                      <p className="font-medium">
                        ₹{totalCommitments.toLocaleString()}
                      </p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Remaining Capacity
                      </p>
                      <p
                      className={`font-bold ${remainingCapacity >= (monthlyRequired || 0) ? 'text-emerald-600' : 'text-amber-600'}`}>

                        ₹{remainingCapacity.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                  variant="outline"
                  onClick={() =>
                  setStep(selectedGoalType === 'just_save' ? 1 : 2)
                  }>

                    Back
                  </Button>
                  <Button
                  onClick={handleFinalSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full ml-4">

                    Create Goal Plan
                  </Button>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </motion.div>
    </div>);

}