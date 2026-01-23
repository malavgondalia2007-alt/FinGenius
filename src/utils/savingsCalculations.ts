import { UserProfile, Goal, Expense, GoalSuggestion } from '../types';

export interface SavingsCapacity {
  monthlyIncome: number;
  fixedExpenses: number;
  loanEMIs: number;
  sipCommitments: number;
  totalCommitments: number;
  remainingIncome: number;
  suggestedSavingsMin: number;
  suggestedSavingsMax: number;
  breakdown: {
    label: string;
    amount: number;
    percentage: number;
  }[];
}

export const calculateSavingsCapacity = (
profile: UserProfile)
: SavingsCapacity | null => {
  if (profile.type !== 'employee') return null;

  const monthlyIncome = profile.monthlyIncome || 0;
  const fixedExpenses = Object.values(profile.fixedExpenses || {}).reduce(
    (sum, val) => sum + val,
    0
  );
  const loanEMIs = Object.values(profile.loans || {}).reduce(
    (sum, val) => sum + val,
    0
  );
  const sipCommitments = profile.sipCommitments || 0;

  const totalCommitments = fixedExpenses + loanEMIs + sipCommitments;
  const remainingIncome = monthlyIncome - totalCommitments;
  const suggestedSavingsMin = Math.round(remainingIncome * 0.3);
  const suggestedSavingsMax = Math.round(remainingIncome * 0.4);

  const breakdown = [
  {
    label: 'Fixed Expenses',
    amount: fixedExpenses,
    percentage: monthlyIncome > 0 ? fixedExpenses / monthlyIncome * 100 : 0
  },
  {
    label: 'Loan EMIs',
    amount: loanEMIs,
    percentage: monthlyIncome > 0 ? loanEMIs / monthlyIncome * 100 : 0
  },
  {
    label: 'SIP Commitments',
    amount: sipCommitments,
    percentage:
    monthlyIncome > 0 ? sipCommitments / monthlyIncome * 100 : 0
  },
  {
    label: 'Available for Savings & Expenses',
    amount: remainingIncome,
    percentage:
    monthlyIncome > 0 ? remainingIncome / monthlyIncome * 100 : 0
  }];


  return {
    monthlyIncome,
    fixedExpenses,
    loanEMIs,
    sipCommitments,
    totalCommitments,
    remainingIncome,
    suggestedSavingsMin,
    suggestedSavingsMax,
    breakdown
  };
};

export const generateGoalSuggestions = (
goal: Goal,
capacity: SavingsCapacity,
expenses: Expense[])
: GoalSuggestion[] => {
  const suggestions: GoalSuggestion[] = [];
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const monthsRemaining = Math.max(
    1,
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const amountNeeded = goal.targetAmount - goal.savedAmount;
  const monthlyRequirement = amountNeeded / monthsRemaining;

  // Timeline Feasibility
  if (monthlyRequirement <= capacity.suggestedSavingsMin) {
    suggestions.push({
      type: 'success',
      message: `Easily achievable! You need ₹${Math.round(monthlyRequirement).toLocaleString()}/month, well within your capacity.`
    });
  } else if (monthlyRequirement <= capacity.suggestedSavingsMax) {
    suggestions.push({
      type: 'timeline',
      message: `Achievable with discipline. Requires ₹${Math.round(monthlyRequirement).toLocaleString()}/month (${Math.round(monthlyRequirement / capacity.remainingIncome * 100)}% of remaining income).`
    });
  } else if (monthlyRequirement <= capacity.remainingIncome) {
    suggestions.push({
      type: 'warning',
      message: `Tight timeline. Requires ₹${Math.round(monthlyRequirement).toLocaleString()}/month. Consider extending deadline or reducing non-essential expenses.`,
      action: 'Extend deadline by 6 months'
    });
  } else {
    suggestions.push({
      type: 'warning',
      message: `Current timeline not feasible. Need ₹${Math.round(monthlyRequirement).toLocaleString()}/month but only ₹${capacity.remainingIncome.toLocaleString()} available.`,
      action: `Extend deadline to ${Math.ceil(amountNeeded / capacity.suggestedSavingsMax)} months`
    });
  }

  // Expense Optimization
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());

  });
  const nonEssentialTotal = currentMonthExpenses.
  filter((e) => e.type === 'non-essential').
  reduce((sum, e) => sum + e.amount, 0);

  if (nonEssentialTotal > capacity.remainingIncome * 0.3) {
    const potentialSavings = Math.round(nonEssentialTotal * 0.3);
    suggestions.push({
      type: 'expense',
      message: `You spent ₹${nonEssentialTotal.toLocaleString()} on non-essentials this month. Reducing by 30% could free up ₹${potentialSavings.toLocaleString()}.`,
      action: 'Review non-essential expenses'
    });
  }

  // Savings Improvement
  if (
  monthlyRequirement > capacity.suggestedSavingsMax &&
  monthlyRequirement <= capacity.remainingIncome * 0.6)
  {
    suggestions.push({
      type: 'savings',
      message: `To reach this goal faster, aim to save ${Math.round(monthlyRequirement / capacity.remainingIncome * 100)}% of your remaining income instead of the recommended 30-40%.`
    });
  }

  // Progress Encouragement
  const progress = goal.savedAmount / goal.targetAmount * 100;
  if (progress > 50) {
    suggestions.push({
      type: 'success',
      message: `You're ${Math.round(progress)}% there! Keep up the momentum.`
    });
  }

  return suggestions;
};

export const explainSavingsCalculation = (
capacity: SavingsCapacity)
: string => {
  return `Your savings capacity is calculated by taking your monthly income (₹${capacity.monthlyIncome.toLocaleString()}) and subtracting all fixed commitments:
  
• Fixed Expenses: ₹${capacity.fixedExpenses.toLocaleString()} (${Math.round(capacity.fixedExpenses / capacity.monthlyIncome * 100)}%)
• Loan EMIs: ₹${capacity.loanEMIs.toLocaleString()} (${Math.round(capacity.loanEMIs / capacity.monthlyIncome * 100)}%)
• SIP Commitments: ₹${capacity.sipCommitments.toLocaleString()} (${Math.round(capacity.sipCommitments / capacity.monthlyIncome * 100)}%)

This leaves you with ₹${capacity.remainingIncome.toLocaleString()} for variable expenses and savings. We recommend saving 30-40% of this amount (₹${capacity.suggestedSavingsMin.toLocaleString()} - ₹${capacity.suggestedSavingsMax.toLocaleString()}) for your goals and emergency fund.`;
};