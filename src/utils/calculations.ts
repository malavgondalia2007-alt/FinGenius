import { Expense, Goal, Investment, Income } from '../types';

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  return Math.round(total);
};

export const calculateTotalIncome = (incomes: Income[]): number => {
  const total = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  return Math.round(total);
};

export const calculateMonthlyExpenses = (
  expenses: Expense[],
  month: number,
  year: number)
  : number => {
  const total = expenses.
    filter((exp) => {
      const date = new Date(exp.date);
      return date.getMonth() === month && date.getFullYear() === year;
    }).
    reduce((sum, exp) => sum + exp.amount, 0);
  return Math.round(total);
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
  const total = investments.reduce((sum, inv) => sum + inv.amount, 0);
  return parseFloat(total.toFixed(2));
};

export const calculateGoalProgress = (goal: Goal): number => {
  if (goal.targetAmount === 0) return 0;
  return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
};

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
};