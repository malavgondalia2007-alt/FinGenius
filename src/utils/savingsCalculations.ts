import { UserProfile, Goal, Expense, GoalSuggestion, Income } from '../types';

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
    monthlyRequirement <= capacity.remainingIncome * 0.6) {
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

// --- NEW FUNCTIONS FOR FINANCIAL FLOW SYSTEM ---

export const calculateNetSavings = (
  profile: UserProfile,
  expenses: Expense[],
  income: Income[])
  : {
    monthlyIncome: number;
    totalFixedCommitments: number;
    trackedExpenses: number;
    extraIncome: number;
    netSavings: number;
    lastMonthNetSavings: number;
    trend: number;
  } => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Calculate Base Monthly Income
  let monthlyIncome = 0;
  if (profile.type === 'student') {
    monthlyIncome = (profile.weeklyPocketMoney || 0) * 4;
  } else {
    monthlyIncome = profile.monthlyIncome || 0;
  }

  // 2. Calculate Fixed Commitments (Employees only)
  let totalFixedCommitments = 0;
  if (profile.type === 'employee') {
    const fixedExpenses = Object.values(profile.fixedExpenses || {}).reduce(
      (sum, val) => sum + val,
      0
    );
    const loanEMIs = Object.values(profile.loans || {}).reduce(
      (sum, val) => sum + val,
      0
    );
    const sipCommitments = profile.sipCommitments || 0;
    totalFixedCommitments = fixedExpenses + loanEMIs + sipCommitments;
  } else if (profile.type === 'student') {
    // For students, fixed expenses are usually weekly expenses * 4
    totalFixedCommitments = (profile.weeklyExpenses || 0) * 4;
  }

  // 3. Calculate Extra Income (Current Month)
  const currentMonthExtraIncome = Math.round(income.
    filter((inc) => {
      const d = new Date(inc.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).
    reduce((sum, inc) => sum + inc.amount, 0));

  // 4. Calculate Tracked Expenses (Current Month)
  const currentMonthTrackedExpenses = Math.round(expenses.
    filter((exp) => {
      const d = new Date(exp.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).
    reduce((sum, exp) => sum + exp.amount, 0));

  // 5. Calculate Net Savings (Current Month)
  const netSavings = Math.round(
    monthlyIncome +
    currentMonthExtraIncome -
    totalFixedCommitments -
    currentMonthTrackedExpenses);

  // --- LAST MONTH CALCULATION FOR TREND ---
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastYear = lastMonthDate.getFullYear();

  const lastMonthExtraIncome = income.
    filter((inc) => {
      const d = new Date(inc.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    }).
    reduce((sum, inc) => sum + inc.amount, 0);

  const lastMonthTrackedExpenses = expenses.
    filter((exp) => {
      const d = new Date(exp.date);
      return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
    }).
    reduce((sum, exp) => sum + exp.amount, 0);

  const lastMonthNetSavings =
    monthlyIncome +
    lastMonthExtraIncome -
    totalFixedCommitments -
    lastMonthTrackedExpenses;

  // Calculate Trend
  let trend = 0;
  if (lastMonthNetSavings !== 0) {
    trend = Math.round(
      (netSavings - lastMonthNetSavings) / Math.abs(lastMonthNetSavings) *
      100
    );
  }

  return {
    monthlyIncome,
    totalFixedCommitments,
    trackedExpenses: currentMonthTrackedExpenses,
    extraIncome: currentMonthExtraIncome,
    netSavings,
    lastMonthNetSavings,
    trend
  };
};

export const calculateAvailableForGoals = (
  profile: UserProfile,
  expenses: Expense[],
  income: Income[],
  goals: Goal[])
  : {
    netSavings: number;
    totalAllocatedToGoals: number;
    availableForNewGoals: number;
    allocationPercentage: number;
    isOverAllocated: boolean;
  } => {
  const { netSavings } = calculateNetSavings(profile, expenses, income);
  const now = new Date();

  // Calculate total allocated to active goals
  let totalAllocatedToGoals = 0;
  goals.forEach((goal) => {
    if (goal.savedAmount < goal.targetAmount) {
      const deadline = new Date(goal.deadline);
      // Calculate months remaining (min 1 month to avoid division by zero)
      const monthsRemaining = Math.max(
        1,
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      // Monthly contribution needed
      const monthlyContribution =
        (goal.targetAmount - goal.savedAmount) / monthsRemaining;
      totalAllocatedToGoals += monthlyContribution;
    }
  });

  const availableForNewGoals = netSavings - totalAllocatedToGoals;
  const allocationPercentage =
    netSavings > 0 ?
      Math.min(100, totalAllocatedToGoals / netSavings * 100) :
      100;
  const isOverAllocated = availableForNewGoals < 0;

  return {
    netSavings,
    totalAllocatedToGoals,
    availableForNewGoals,
    allocationPercentage,
    isOverAllocated
  };
};

export const calculateRealisticTimeline = (
  targetAmount: number,
  savedAmount: number,
  monthlyNetSavings: number)
  : {
    realisticMonths: number;
    monthlyRequired: number;
    percentOfSavings: number;
    feasibility: 'easy' | 'moderate' | 'tight' | 'unrealistic';
  } => {
  const remainingAmount = Math.max(0, targetAmount - savedAmount);

  // If already saved, return 0 months
  if (remainingAmount === 0) {
    return {
      realisticMonths: 0,
      monthlyRequired: 0,
      percentOfSavings: 0,
      feasibility: 'easy'
    };
  }

  // If no savings, it's unrealistic
  if (monthlyNetSavings <= 0) {
    return {
      realisticMonths: Infinity,
      monthlyRequired: remainingAmount, // Need full amount immediately theoretically
      percentOfSavings: Infinity,
      feasibility: 'unrealistic'
    };
  }

  // Calculate realistic timeline assuming 100% of net savings goes to this goal (optimistic)
  // In reality, we should probably use a portion, but this is "fastest possible"
  const realisticMonths = Math.ceil(remainingAmount / monthlyNetSavings);

  // Calculate monthly required for a standard 12-month goal if timeline not specified
  // But here we just return what 100% savings would do
  const monthlyRequired = monthlyNetSavings; // Max possible

  // Calculate feasibility based on how much of the savings it takes
  // We assume a standard goal might want to take 20-50% of savings
  // If a goal takes 100% of savings, how long?
  // Let's reverse it: How many months if we use 50% of savings?
  const conservativeMonths = Math.ceil(
    remainingAmount / (monthlyNetSavings * 0.5)
  );

  // We return the fastest possible timeline (100% allocation)
  // But feasibility is based on "Is this timeline comfortable?"
  // Actually, let's base feasibility on "If I want this in 6 months, is it hard?"
  // Since we don't have a target date here, we just return the timeline based on 100% allocation

  // Let's refine: The function asks for "Realistic Timeline".
  // A realistic timeline is one where you don't spend 100% of savings.
  // Let's assume 50% allocation is "Realistic".
  const realisticAllocation = monthlyNetSavings * 0.5;
  const realisticTimelineMonths = Math.ceil(
    remainingAmount / realisticAllocation
  );

  return {
    realisticMonths: realisticTimelineMonths,
    monthlyRequired: realisticAllocation,
    percentOfSavings: 50, // We assumed 50%
    feasibility: 'moderate'
  };
};

// Overload or specialized version for checking specific goal feasibility against deadline
export const checkGoalFeasibilityWithDeadline = (
  targetAmount: number,
  savedAmount: number,
  deadline: Date,
  monthlyNetSavings: number)
  : {
    realisticMonths: number;
    monthlyRequired: number;
    percentOfSavings: number;
    feasibility: 'easy' | 'moderate' | 'tight' | 'unrealistic';
  } => {
  const remainingAmount = Math.max(0, targetAmount - savedAmount);
  const now = new Date();
  const monthsRemaining = Math.max(
    1,
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  const monthlyRequired = remainingAmount / monthsRemaining;
  const percentOfSavings =
    monthlyNetSavings > 0 ?
      monthlyRequired / monthlyNetSavings * 100 :
      Infinity;

  let feasibility: 'easy' | 'moderate' | 'tight' | 'unrealistic' = 'unrealistic';

  if (percentOfSavings <= 30) feasibility = 'easy'; else
    if (percentOfSavings <= 60) feasibility = 'moderate'; else
      if (percentOfSavings <= 90) feasibility = 'tight'; else
        feasibility = 'unrealistic';

  const realisticMonths = Math.ceil(remainingAmount / (monthlyNetSavings * 0.5)); // Assuming 50% allocation is healthy

  return {
    realisticMonths,
    monthlyRequired,
    percentOfSavings,
    feasibility
  };
};

export const validateGoalContribution = (
  amount: number,
  availableForGoals: number)
  : {
    isValid: boolean;
    errorMessage: string | null;
  } => {
  if (amount <= 0) {
    return {
      isValid: false,
      errorMessage: 'Contribution amount must be greater than zero.'
    };
  }

  if (amount > availableForGoals) {
    return {
      isValid: false,
      errorMessage: `You only have ₹${Math.max(0, availableForGoals).toLocaleString()} available. Reduce expenses or increase income to save more.`
    };
  }

  return {
    isValid: true,
    errorMessage: null
  };
};