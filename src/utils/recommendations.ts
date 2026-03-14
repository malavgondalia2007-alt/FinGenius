import { UserProfile } from '../types';

export const getSavingsAdvice = (profile: UserProfile): string => {
  if (profile.type === 'student') {
    const pocketMoney = profile.weeklyPocketMoney || 0;
    const expenses = profile.weeklyExpenses || 0;
    const savingsRate =
    pocketMoney > 0 ? (pocketMoney - expenses) / pocketMoney * 100 : 0;

    if (savingsRate < 20) {
      return 'Try to save at least 20% of your pocket money. Cut down on non-essential snacks or entertainment.';
    } else if (savingsRate < 40) {
      return "Good job! You're saving a healthy amount. Consider setting a specific goal for these savings.";
    } else {
      return "Excellent! You're a super saver. You should consider starting a small SIP.";
    }
  } else {
    // Employee
    const income = profile.monthlyIncome || 0;
    const fixed = Object.values(profile.fixedExpenses || {}).reduce(
      (a, b) => a + b,
      0
    );
    const disposable = income - fixed;
    const savingsRate = income > 0 ? disposable / income * 100 : 0;

    if (savingsRate < 10) {
      return 'Your fixed expenses are high. Review your subscriptions and utility usage to free up more cash.';
    } else if (savingsRate < 30) {
      return 'You have a solid foundation. Aim to build an emergency fund equal to 6 months of expenses.';
    } else {
      return 'Your financial health is strong. Maximize your tax-saving investments and look into equity funds.';
    }
  }
};

export const getInvestmentStrategy = (profile: UserProfile): string => {
  if (profile.type === 'student') {
    return 'Start small with low-risk mutual funds or recurring deposits. Focus on building the habit of saving.';
  } else {
    const age = profile.age;
    if (age < 30) {
      return 'You can afford higher risk. Allocation: 70% Equity, 20% Debt, 10% Gold/Cash.';
    } else if (age < 50) {
      return 'Balance growth and stability. Allocation: 50% Equity, 40% Debt, 10% Gold.';
    } else {
      return 'Prioritize capital preservation. Allocation: 30% Equity, 60% Debt, 10% Cash.';
    }
  }
};