import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import {
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Wallet,
  Calculator,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  DollarSign,
  ShoppingCart,
  Zap } from
'lucide-react';
export function ScenarioPlanning() {
  const { user } = useAuth();
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  const [showHelp, setShowHelp] = useState(false);
  const [scenario, setScenario] = useState({
    incomeChange: 0,
    newMonthlyExpense: 0,
    oneTimeExpense: 0
  });
  const [result, setResult] = useState<any>(null);
  const calculateImpact = () => {
    if (!profile) return;
    // Base values
    let currentIncome =
    profile.type === 'student' ?
    (profile.weeklyPocketMoney || 0) * 4 :
    profile.monthlyIncome || 0;
    let currentFixedExpenses =
    profile.type === 'student' ?
    (profile.weeklyExpenses || 0) * 4 :
    Object.values(profile.fixedExpenses || {}).reduce((a, b) => a + b, 0);
    // Add estimated variable expenses (mocked for simplicity, in real app would come from history)
    const estimatedVariableExpenses = 5000;
    const totalCurrentExpenses =
    currentFixedExpenses + estimatedVariableExpenses;
    const currentSavings = Math.max(0, currentIncome - totalCurrentExpenses);
    // Scenario values
    const incomeChange = parseFloat(scenario.incomeChange.toString() || '0');
    const newMonthlyExpense = parseFloat(
      scenario.newMonthlyExpense.toString() || '0'
    );
    const oneTimeExpense = parseFloat(scenario.oneTimeExpense.toString() || '0');
    const newIncome = currentIncome + incomeChange;
    const newTotalExpenses = totalCurrentExpenses + newMonthlyExpense;
    const newSavings = Math.max(0, newIncome - newTotalExpenses);
    const difference = newSavings - currentSavings;
    // Recovery calculation
    const oneTimeRecoveryMonths =
    newSavings > 0 ? oneTimeExpense / newSavings : Infinity;
    setResult({
      currentIncome,
      currentExpenses: totalCurrentExpenses,
      currentSavings,
      newIncome,
      newExpenses: newTotalExpenses,
      newSavings,
      difference,
      oneTimeExpense,
      oneTimeRecovery: oneTimeRecoveryMonths
    });
  };
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Real-Life Scenario Planner
          </h1>
          <p className="text-gray-500">
            Simulate financial changes to see their impact on your savings.
          </p>
        </div>

        {/* How to Use Section */}
        <Card className="mb-8 overflow-hidden">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">
                  How to Use This Tool
                </h3>
                <p className="text-sm text-gray-500">
                  Learn how to plan for financial changes
                </p>
              </div>
            </div>
            {showHelp ?
            <ChevronUp className="w-5 h-5 text-gray-400" /> :

            <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </button>

          {showHelp &&
          <div className="px-6 pb-6 pt-2 border-t border-gray-100 animate-fade-in">
              <div className="space-y-6">
                {/* Introduction */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        What is Scenario Planning?
                      </p>
                      <p className="text-sm text-blue-800">
                        Test "what-if" scenarios before they happen. See how
                        life changes—like a raise, new subscription, or
                        emergency expense—will affect your monthly savings and
                        financial goals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step-by-step Guide */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">
                    Step-by-Step Guide:
                  </h4>
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <h5 className="font-semibold text-gray-900">
                            Monthly Income Change
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Enter positive or negative changes to your monthly
                          income.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="font-medium text-gray-700 mb-1">
                            Examples:
                          </p>
                          <ul className="space-y-1 text-gray-600">
                            <li>
                              •{' '}
                              <span className="text-green-600 font-medium">
                                +5000
                              </span>{' '}
                              - Got a raise or promotion
                            </li>
                            <li>
                              •{' '}
                              <span className="text-green-600 font-medium">
                                +3000
                              </span>{' '}
                              - Started freelancing on weekends
                            </li>
                            <li>
                              •{' '}
                              <span className="text-red-600 font-medium">
                                -2000
                              </span>{' '}
                              - Reduced work hours or pay cut
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="w-4 h-4 text-blue-600" />
                          <h5 className="font-semibold text-gray-900">
                            New Monthly Expense
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Add recurring expenses that will happen every month.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="font-medium text-gray-700 mb-1">
                            Examples:
                          </p>
                          <ul className="space-y-1 text-gray-600">
                            <li>
                              • <span className="font-medium">2000</span> - New
                              gym membership or subscription
                            </li>
                            <li>
                              • <span className="font-medium">3000</span> - Rent
                              increase
                            </li>
                            <li>
                              • <span className="font-medium">1500</span> - New
                              loan EMI
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-600" />
                          <h5 className="font-semibold text-gray-900">
                            One-Time Large Expense
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Enter big, one-off expenses you're planning or
                          expecting.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="font-medium text-gray-700 mb-1">
                            Examples:
                          </p>
                          <ul className="space-y-1 text-gray-600">
                            <li>
                              • <span className="font-medium">50000</span> - New
                              laptop or phone
                            </li>
                            <li>
                              • <span className="font-medium">30000</span> -
                              Vacation trip
                            </li>
                            <li>
                              • <span className="font-medium">20000</span> -
                              Medical emergency fund
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calculator className="w-4 h-4 text-blue-600" />
                          <h5 className="font-semibold text-gray-900">
                            Simulate & Analyze
                          </h5>
                        </div>
                        <p className="text-sm text-gray-600">
                          Click "Simulate Impact" to see how these changes
                          affect your monthly savings and how long it will take
                          to recover from one-time expenses.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Pro Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>
                        <strong>Test before committing:</strong> Planning a new
                        subscription? Run the scenario first to ensure it fits
                        your budget.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>
                        <strong>Emergency planning:</strong> Simulate unexpected
                        expenses to see if you have enough buffer.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span>
                        <strong>Compare scenarios:</strong> Try different
                        combinations to find the best financial path forward.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          }
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                Define Scenario
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income Change (+/-)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 5000 or -2000"
                    value={scenario.incomeChange}
                    onChange={(e) =>
                    setScenario({
                      ...scenario,
                      incomeChange: parseFloat(e.target.value)
                    })
                    } />

                  <p className="text-xs text-gray-500 mt-1">
                    Raise, bonus, or pay cut
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Monthly Expense
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 2000"
                    value={scenario.newMonthlyExpense}
                    onChange={(e) =>
                    setScenario({
                      ...scenario,
                      newMonthlyExpense: parseFloat(e.target.value)
                    })
                    } />

                  <p className="text-xs text-gray-500 mt-1">
                    Subscription, rent increase, etc.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    One-time Large Expense
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
                    value={scenario.oneTimeExpense}
                    onChange={(e) =>
                    setScenario({
                      ...scenario,
                      oneTimeExpense: parseFloat(e.target.value)
                    })
                    } />

                  <p className="text-xs text-gray-500 mt-1">
                    Laptop, vacation, medical bill
                  </p>
                </div>

                <Button onClick={calculateImpact} fullWidth className="mt-4">
                  <Calculator className="w-4 h-4 mr-2" />
                  Simulate Impact
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {result ?
            <div className="space-y-6 animate-fade-in">
                {/* Comparison Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-6 bg-white border-l-4 border-gray-300">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Current Status
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Income:</span>
                        <span className="font-medium">
                          ₹{result.currentIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expenses:</span>
                        <span className="font-medium">
                          ₹{result.currentExpenses.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex justify-between">
                        <span className="font-bold text-gray-900">
                          Savings:
                        </span>
                        <span className="font-bold text-blue-600">
                          ₹{result.currentSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>

                  <Card
                  className={`p-6 bg-white border-l-4 ${result.newSavings >= result.currentSavings ? 'border-green-500' : 'border-red-500'}`}>

                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Projected Status
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Income:</span>
                        <span className="font-medium">
                          ₹{result.newIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Expenses:</span>
                        <span className="font-medium">
                          ₹{result.newExpenses.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-100 flex justify-between">
                        <span className="font-bold text-gray-900">
                          Savings:
                        </span>
                        <span
                        className={`font-bold ${result.newSavings >= result.currentSavings ? 'text-green-600' : 'text-red-600'}`}>

                          ₹{result.newSavings.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Analysis Card */}
                <Card className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Impact Analysis
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                      className={`p-2 rounded-lg ${result.newSavings > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>

                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Monthly Cash Flow
                        </p>
                        <p className="text-sm text-gray-600">
                          {result.newSavings > 0 ?
                        `You will save ₹${result.newSavings.toLocaleString()} per month.` :
                        'Warning: Your expenses will exceed your income.'}{' '}
                          {result.difference !== 0 &&
                        <span
                          className={
                          result.difference > 0 ?
                          'text-green-600' :
                          'text-red-600'
                          }>

                              (Change: {result.difference > 0 ? '+' : ''}₹
                              {result.difference.toLocaleString()})
                            </span>
                        }
                        </p>
                      </div>
                    </div>

                    {result.oneTimeExpense > 0 &&
                  <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <RefreshCw className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Recovery Timeline
                          </p>
                          <p className="text-sm text-gray-600">
                            To pay off the ₹
                            {result.oneTimeExpense.toLocaleString()} expense:
                          </p>
                          {result.newSavings > 0 ?
                      <p className="text-sm font-bold text-purple-700 mt-1">
                              It will take {Math.ceil(result.oneTimeRecovery)}{' '}
                              months of savings.
                            </p> :

                      <p className="text-sm font-bold text-red-600 mt-1">
                              Impossible with current negative cash flow.
                            </p>
                      }
                        </div>
                      </div>
                  }
                  </div>
                </Card>
              </div> :

            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-12">
                <ArrowRight className="w-12 h-12 mb-4 opacity-20" />
                <p>Enter scenario details to see the impact</p>
              </div>
            }
          </div>
        </div>
      </div>
    </>);

}