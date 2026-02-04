import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Plus,
  Edit2,
  Trash2,
  Target,
  PlayCircle,
  Upload,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb } from
'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../services/database';
import { Goal, GoalSuggestion, Expense, CommitmentCategory } from '../types';
import { calculateGoalProgress } from '../utils/calculations';
import { GoalSimulator } from '../components/GoalSimulator';
import { HelpChatbot } from '../components/HelpChatbot';
import { ExpenseImportModal } from '../components/ExpenseImportModal';
import {
  calculateSavingsCapacity,
  generateGoalSuggestions } from
'../utils/savingsCalculations';
import { GoalSetupWizard } from '../components/goals/GoalSetupWizard';
import { GoalChatInterface } from '../components/goals/GoalChatInterface';
export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>(
    user ? db.goals.getByUserId(user.id) : []
  );
  const profile = user ? db.profiles.getByUserId(user.id) : null;
  const expenses = user ? db.expenses.getByUserId(user.id) : [];
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [simulatingGoal, setSimulatingGoal] = useState<Goal | null>(null);
  // New state for auto-opening chat after goal creation
  const [newlyCreatedGoalId, setNewlyCreatedGoalId] = useState<string | null>(
    null
  );
  // Calculate savings capacity
  const savingsCapacity = profile ? calculateSavingsCapacity(profile) : null;
  const handleImportExpenses = (importedExpenses: Partial<Expense>[]) => {
    if (!user) return;
    importedExpenses.forEach((expense) => {
      const fullExpense: Expense = {
        id: crypto.randomUUID(),
        userId: user.id,
        amount: expense.amount || 0,
        category: expense.category || 'General',
        date: expense.date || new Date().toISOString().split('T')[0],
        type: expense.type || 'non-essential',
        description: expense.description || 'Imported expense',
        createdAt: new Date().toISOString()
      };
      db.expenses.create(fullExpense);
    });
    alert(`Successfully imported ${importedExpenses.length} expenses!`);
  };
  const handleCreateGoal = (
  goalData: Partial<Goal>,
  commitments: CommitmentCategory[]) =>
  {
    if (!user) return;
    const goalId = crypto.randomUUID();
    const goal: Goal = {
      id: goalId,
      userId: user.id,
      name: goalData.name || 'New Goal',
      targetAmount: goalData.targetAmount || 0,
      savedAmount: 0,
      deadline: goalData.deadline || new Date().toISOString(),
      category: goalData.category || 'General',
      createdAt: new Date().toISOString()
    };
    db.goals.create(goal);
    setGoals(db.goals.getByUserId(user.id));
    setShowGoalWizard(false);
    // Auto-open chat for the newly created goal after a brief pause
    setTimeout(() => {
      setNewlyCreatedGoalId(goalId);
    }, 300);
    // In a real app, we would also save the updated commitments to the user profile
    console.log('Updated commitments:', commitments);
  };
  // Clear the newly created goal ID after chat has been opened
  const handleChatOpened = (goalId: string) => {
    if (goalId === newlyCreatedGoalId) {
      // Keep it set for a moment so the initial message can be sent
      setTimeout(() => {
        setNewlyCreatedGoalId(null);
      }, 1000);
    }
  };
  const handleDelete = (id: string) => {
    db.goals.delete(id);
    if (user) setGoals(db.goals.getByUserId(user.id));
  };
  const handleAddFunds = (id: string, amount: number) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      db.goals.update(id, {
        savedAmount: goal.savedAmount + amount
      });
      if (user) setGoals(db.goals.getByUserId(user.id));
    }
  };
  const getSuggestionIcon = (type: GoalSuggestion['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'timeline':
        return <TrendingUp className="w-4 h-4" />;
      case 'expense':
        return <Lightbulb className="w-4 h-4" />;
      case 'savings':
        return <Target className="w-4 h-4" />;
    }
  };
  const getSuggestionColor = (type: GoalSuggestion['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'timeline':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'expense':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'savings':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
    }
  };
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-500">
            Plan your future with intelligent, income-based guidance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowImportModal(true)}
            variant="outline"
            className="flex items-center gap-2">

            <Upload className="w-4 h-4" />
            Import Expenses
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-lg shadow-blue-200"
            onClick={() => setShowGoalWizard(true)}>

            <Plus className="w-4 h-4" />
            Create New Goal
          </Button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
        {goals.length === 0 ?
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No goals yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Start your financial journey by creating a smart goal. We'll help
              you plan based on your actual income and commitments.
            </p>
            <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            onClick={() => setShowGoalWizard(true)}>

              Start Planning
            </Button>
          </div> :

        goals.map((goal) => {
          const progress = calculateGoalProgress(goal);
          const daysRemaining = Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) / (
            1000 * 60 * 60 * 24)
          );
          const suggestions =
          savingsCapacity && profile?.type === 'employee' ?
          generateGoalSuggestions(goal, savingsCapacity, expenses) :
          [];
          return (
            <div key={goal.id}>
                {simulatingGoal?.id === goal.id ?
              <GoalSimulator
                goal={goal}
                profile={profile}
                onClose={() => setSimulatingGoal(null)} /> :


              <div className="space-y-3">
                    <Card className="p-6 border-l-4 border-l-blue-500 overflow-visible">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {goal.name}
                          </h3>
                          <p className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded inline-block mt-1">
                            {goal.category}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                        onClick={() => setSimulatingGoal(goal)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                        title="Simulate Feasibility">

                            <PlayCircle className="w-5 h-5" />
                          </button>
                          <button
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        onClick={() => handleDelete(goal.id)}
                        title="Delete goal">

                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mb-2 flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {progress}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                        <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500 relative"
                      style={{
                        width: `${progress}%`
                      }}>

                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full opacity-50"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Saved</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{goal.savedAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">Target</p>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{goal.targetAmount.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-500 mb-1">
                            Remaining
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {daysRemaining > 0 ?
                        `${daysRemaining} days` :
                        'Due'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <Button
                      onClick={() => handleAddFunds(goal.id, 1000)}
                      variant="outline"
                      className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50">

                          +₹1,000
                        </Button>
                        <Button
                      onClick={() => handleAddFunds(goal.id, 5000)}
                      variant="outline"
                      className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50">

                          +₹5,000
                        </Button>
                        <Button
                      onClick={() => handleAddFunds(goal.id, 10000)}
                      variant="outline"
                      className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50">

                          +₹10,000
                        </Button>
                      </div>

                      {/* Contextual Suggestions */}
                      {suggestions.length > 0 &&
                  <div className="space-y-2 mb-4">
                          {suggestions.map((suggestion, idx) =>
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${getSuggestionColor(suggestion.type)}`}>

                              <div className="mt-0.5">
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {suggestion.message}
                                </p>
                                {suggestion.action &&
                        <button className="text-xs font-semibold mt-1 underline">
                                    {suggestion.action} →
                                  </button>
                        }
                              </div>
                            </div>
                    )}
                        </div>
                  }

                      {/* Embedded Chat Interface - with isNewGoal prop */}
                      <GoalChatInterface
                    goal={goal}
                    capacity={savingsCapacity}
                    isNewGoal={goal.id === newlyCreatedGoalId}
                    onChatOpened={() => handleChatOpened(goal.id)} />

                    </Card>
                  </div>
              }
              </div>);

        })
        }
      </div>

      {/* Goal Setup Wizard */}
      {showGoalWizard &&
      <GoalSetupWizard
        profile={profile}
        onComplete={handleCreateGoal}
        onClose={() => setShowGoalWizard(false)} />

      }

      {/* Import Modal */}
      {showImportModal && user &&
      <ExpenseImportModal
        userId={user.id}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportExpenses} />

      }

      <HelpChatbot />
    </>);

}