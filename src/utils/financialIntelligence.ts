import {
  Expense,
  Goal,
  UserProfile,
  SmartWarning,
  FinancialReport } from
'../types';

// Helper to get total fixed expenses (handles both old and new structure)
const getTotalFixedExpenses = (profile: UserProfile): number => {
  if (!profile.fixedExpenses) return 0;
  return Object.values(profile.fixedExpenses).reduce((a, b) => a + b, 0);
};

// Helper to get total loan EMIs
const getTotalLoanEMIs = (profile: UserProfile): number => {
  if (!profile.loans) return 0;
  return Object.values(profile.loans).reduce((a, b) => a + b, 0);
};

// --- Smart Expense Warnings ---

export const analyzeSpendingTrends = (expenses: Expense[]): SmartWarning[] => {
  const warnings: SmartWarning[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter current month expenses
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Filter last month expenses
  const lastMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) &&
      d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear));

  });

  const currentTotal = currentMonthExpenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );
  const lastTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Trend Warning: Spending spike
  if (lastTotal > 0 && currentTotal > lastTotal * 1.2) {
    warnings.push({
      id: 'trend-spike',
      type: 'warning',
      title: 'Spending Spike Detected',
      message: `You've spent 20% more this month compared to last month. Check your recent transactions.`,
      date: now.toISOString(),
      icon: 'TrendingUp'
    });
  }

  return warnings;
};

export const checkNonEssentialLimits = (
expenses: Expense[],
profile: UserProfile)
: SmartWarning | null => {
  const now = new Date();
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());

  });

  const nonEssentialTotal = currentMonthExpenses.
  filter((e) => e.type === 'non-essential').
  reduce((sum, e) => sum + e.amount, 0);

  let income = 0;
  if (profile.type === 'student') {
    income = (profile.weeklyPocketMoney || 0) * 4;
  } else {
    income = profile.monthlyIncome || 0;
  }

  // Warning if non-essential spending > 30% of income
  if (income > 0 && nonEssentialTotal > income * 0.3) {
    return {
      id: 'limit-non-essential',
      type: 'danger',
      title: 'High Discretionary Spending',
      message: `Your non-essential spending is ${Math.round(nonEssentialTotal / income * 100)}% of your income. Recommended limit is 30%.`,
      date: now.toISOString(),
      icon: 'AlertTriangle'
    };
  }

  return null;
};

export const checkGoalThreats = (
expenses: Expense[],
goals: Goal[],
profile: UserProfile)
: SmartWarning[] => {
  const warnings: SmartWarning[] = [];
  const now = new Date();

  // Calculate disposable income
  let income = 0;
  let fixedExpenses = 0;

  if (profile.type === 'student') {
    income = (profile.weeklyPocketMoney || 0) * 4;
    fixedExpenses = (profile.weeklyExpenses || 0) * 4;
  } else {
    income = profile.monthlyIncome || 0;
    fixedExpenses =
    getTotalFixedExpenses(profile) +
    getTotalLoanEMIs(profile) + (
    profile.sipCommitments || 0);
  }

  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());

  });

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = income - fixedExpenses - totalSpent;

  // Check if remaining budget is enough for monthly goal contributions
  let totalMonthlyGoalNeed = 0;

  goals.forEach((goal) => {
    if (goal.savedAmount < goal.targetAmount) {
      const deadline = new Date(goal.deadline);
      const monthsRemaining = Math.max(
        1,
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const monthlyNeed =
      (goal.targetAmount - goal.savedAmount) / monthsRemaining;
      totalMonthlyGoalNeed += monthlyNeed;
    }
  });

  if (remainingBudget < totalMonthlyGoalNeed && totalMonthlyGoalNeed > 0) {
    warnings.push({
      id: 'goal-threat',
      type: 'warning',
      title: 'Goals at Risk',
      message: `Your current spending might impact your ability to reach your goals. You need ₹${Math.round(totalMonthlyGoalNeed - remainingBudget)} more to stay on track.`,
      date: now.toISOString(),
      icon: 'Target'
    });
  }

  return warnings;
};

// --- Goal Feasibility Simulator ---

export const calculateGoalFeasibility = (
targetAmount: number,
currentSaved: number,
monthlyContribution: number,
deadline: Date)
: {probability: number;projectedDate: Date;message: string;} => {
  const remainingAmount = targetAmount - currentSaved;
  if (remainingAmount <= 0)
  return {
    probability: 100,
    projectedDate: new Date(),
    message: 'Goal already achieved!'
  };
  if (monthlyContribution <= 0)
  return {
    probability: 0,
    projectedDate: new Date(deadline.getFullYear() + 10, 0, 1),
    message: 'Increase savings to reach this goal.'
  };

  const monthsNeeded = remainingAmount / monthlyContribution;
  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + Math.ceil(monthsNeeded));

  const timeUntilDeadline =
  (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);

  let probability = 0;
  if (monthsNeeded <= timeUntilDeadline) {
    probability = 95;
  } else if (monthsNeeded <= timeUntilDeadline * 1.2) {
    probability = 70;
  } else if (monthsNeeded <= timeUntilDeadline * 1.5) {
    probability = 40;
  } else {
    probability = 10;
  }

  let message = '';
  if (probability >= 90)
  message = "You're on track to reach this goal comfortably!";else
  if (probability >= 60)
  message = 'You can make it, but try to increase savings slightly.';else
  if (probability >= 30)
  message = "It's tight. Consider extending the deadline or saving more.";else

  message = 'This goal is at risk. You need a significant change in strategy.';

  return { probability, projectedDate, message };
};

// --- Emotional Feedback ---

export const getEmotionalFeedback = (
expenses: Expense[],
profile: UserProfile)
: {
  message: string;
  type: 'positive' | 'neutral' | 'caution';
  emoji: string;
} => {
  const now = new Date();
  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear());

  });

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  let income = 0;
  if (profile.type === 'student') {
    income = (profile.weeklyPocketMoney || 0) * 4;
  } else {
    income = profile.monthlyIncome || 0;
  }

  const spendingRatio = income > 0 ? totalSpent / income : 0;

  if (spendingRatio < 0.5) {
    return {
      message: "You're doing amazing! Your discipline is inspiring. 🌟",
      type: 'positive',
      emoji: '🤩'
    };
  } else if (spendingRatio < 0.8) {
    return {
      message: "Good balance! You're enjoying life while staying responsible.",
      type: 'neutral',
      emoji: '🙂'
    };
  } else {
    return {
      message: "Whoa there! Spending is heating up. Let's cool down a bit? 🧊",
      type: 'caution',
      emoji: '😅'
    };
  }
};

// --- Monthly Report ---

export const generateMonthlyReport = (
expenses: Expense[],
goals: Goal[],
profile: UserProfile)
: FinancialReport => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const monthlyExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  let income = 0;
  if (profile.type === 'student') {
    income = (profile.weeklyPocketMoney || 0) * 4;
  } else {
    income = profile.monthlyIncome || 0;
  }

  const savings = Math.max(0, income - totalExpenses);
  const savingsRate = income > 0 ? savings / income * 100 : 0;

  // Top Category
  const categories: Record<string, number> = {};
  monthlyExpenses.forEach((e) => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });
  const topCategory =
  Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  // Goal Progress
  const activeGoals = goals.filter((g) => g.savedAmount < g.targetAmount);
  const goalProgress =
  activeGoals.length > 0 ?
  activeGoals.reduce(
    (sum, g) => sum + g.savedAmount / g.targetAmount,
    0
  ) /
  activeGoals.length *
  100 :
  100;

  // Score Calculation (0-100)
  let score = 50;
  if (savingsRate > 20) score += 20;
  if (savingsRate > 40) score += 10;
  if (totalExpenses < income * 0.8) score += 10;
  if (goalProgress > 10) score += 10;

  const insights = [
  savingsRate > 20 ?
  'Great savings rate this month!' :
  'Try to boost your savings next month.',
  `Your biggest expense was ${topCategory}.`,
  goalProgress > 0 ?
  "You're making steady progress on goals." :
  'Time to start funding your goals!'];


  return {
    month: monthName,
    year: currentYear,
    totalIncome: income,
    totalExpenses,
    savingsRate,
    topExpenseCategory: topCategory,
    goalProgress,
    score: Math.min(100, score),
    insights
  };
};