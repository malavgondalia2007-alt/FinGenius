import { Expense, Goal, Investment, Income } from '../types';

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
};

export const calculateTotalIncome = (incomes: Income[]): number => {
  return incomes.reduce((sum, inc) => sum + inc.amount, 0);
};

export const calculateMonthlyExpenses = (
expenses: Expense[],
month: number,
year: number)
: number => {
  return expenses.
  filter((exp) => {
    const date = new Date(exp.date);
    return date.getMonth() === month && date.getFullYear() === year;
  }).
  reduce((sum, exp) => sum + exp.amount, 0);
};

export const calculateCategoryBreakdown = (expenses: Expense[]) => {
  const breakdown: Record<string, number> = {};
  expenses.forEach((exp) => {
    breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
  });
  return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
};

export const calculateTotalInvestments = (
investments: Investment[])
: number => {
  return investments.reduce((sum, inv) => sum + inv.amount, 0);
};

export const calculateGoalProgress = (goal: Goal): number => {
  if (goal.targetAmount === 0) return 0;
  return Math.min(100, Math.round(goal.savedAmount / goal.targetAmount * 100));
};