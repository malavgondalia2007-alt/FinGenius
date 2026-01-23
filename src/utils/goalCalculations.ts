import {
  Goal,
  CommitmentCategory,
  InvestmentRecommendation,
  FundData } from
'../types';
import { SavingsCapacity } from './savingsCalculations';
import { fetchMutualFunds, IndiaInvestFund } from '../services/indiaInvestApi';

// Spending range type
export interface SpendingRange {
  min: number;
  typical: number;
  max: number;
  description: string;
}

// Spending range multipliers based on income for different goal types
const SPENDING_RANGES: Record<
  string,
  {minMult: number;typicalMult: number;maxMult: number;description: string;}> =
{
  emergency: {
    minMult: 3,
    typicalMult: 6,
    maxMult: 12,
    description: 'Emergency funds typically cover 3-12 months of expenses'
  },
  education: {
    minMult: 0.5,
    typicalMult: 2,
    maxMult: 5,
    description: 'Education costs vary based on course type and institution'
  },
  travel: {
    minMult: 0.3,
    typicalMult: 1,
    maxMult: 3,
    description: 'Travel budgets depend on destination and duration'
  },
  gadget: {
    minMult: 0.2,
    typicalMult: 0.5,
    maxMult: 1.5,
    description: 'Gadget prices range from budget to premium options'
  },
  general: {
    minMult: 1,
    typicalMult: 3,
    maxMult: 6,
    description: 'General savings for future needs and opportunities'
  },
  just_save: {
    minMult: 0,
    typicalMult: 0,
    maxMult: 0,
    description: 'Maximize your savings potential'
  }
};

// Get spending range for a goal type based on income
export const getSpendingRangeForGoalType = (
goalType: string,
monthlyIncome: number)
: SpendingRange => {
  const range = SPENDING_RANGES[goalType] || SPENDING_RANGES.general;

  return {
    min: Math.round(monthlyIncome * range.minMult),
    typical: Math.round(monthlyIncome * range.typicalMult),
    max: Math.round(monthlyIncome * range.maxMult),
    description: range.description
  };
};

// Recommended percentage ranges for commitments based on income
const COMMITMENT_RANGES = {
  rent: { min: 0.25, max: 0.3 },
  food: { min: 0.15, max: 0.2 },
  travel: { min: 0.05, max: 0.1 },
  education: { min: 0.05, max: 0.1 },
  emi: { min: 0.1, max: 0.2 },
  subscriptions: { min: 0.02, max: 0.05 },
  utilities: { min: 0.05, max: 0.08 },
  entertainment: { min: 0.05, max: 0.1 },
  healthcare: { min: 0.05, max: 0.1 },
  other: { min: 0.05, max: 0.1 }
};

export const getCategoryRecommendations = (
income: number)
: CommitmentCategory[] => {
  return [
  {
    id: 'rent',
    name: 'Rent & Housing',
    amount: Math.round(income * 0.25),
    recommendedMin: Math.round(income * 0.25),
    recommendedMax: Math.round(income * 0.3),
    hidden: false,
    icon: 'Home'
  },
  {
    id: 'food',
    name: 'Food & Groceries',
    amount: Math.round(income * 0.15),
    recommendedMin: Math.round(income * 0.15),
    recommendedMax: Math.round(income * 0.2),
    hidden: false,
    icon: 'Utensils'
  },
  {
    id: 'travel',
    name: 'Travel & Commute',
    amount: Math.round(income * 0.05),
    recommendedMin: Math.round(income * 0.05),
    recommendedMax: Math.round(income * 0.1),
    hidden: false,
    icon: 'Car'
  },
  {
    id: 'education',
    name: 'Education',
    amount: 0,
    recommendedMin: Math.round(income * 0.05),
    recommendedMax: Math.round(income * 0.1),
    hidden: true,
    icon: 'GraduationCap'
  },
  {
    id: 'emi',
    name: 'Loan EMIs',
    amount: 0,
    recommendedMin: Math.round(income * 0.1),
    recommendedMax: Math.round(income * 0.2),
    hidden: true,
    icon: 'CreditCard'
  },
  {
    id: 'utilities',
    name: 'Utilities',
    amount: Math.round(income * 0.05),
    recommendedMin: Math.round(income * 0.05),
    recommendedMax: Math.round(income * 0.08),
    hidden: false,
    icon: 'Zap'
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    amount: 0,
    recommendedMin: Math.round(income * 0.02),
    recommendedMax: Math.round(income * 0.05),
    hidden: true,
    icon: 'Smartphone'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    amount: Math.round(income * 0.05),
    recommendedMin: Math.round(income * 0.05),
    recommendedMax: Math.round(income * 0.1),
    hidden: false,
    icon: 'Film'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    amount: Math.round(income * 0.05),
    recommendedMin: Math.round(income * 0.05),
    recommendedMax: Math.round(income * 0.1),
    hidden: false,
    icon: 'Heart'
  },
  {
    id: 'other',
    name: 'Other',
    amount: 0,
    recommendedMin: Math.round(income * 0.05),
    recommendedMax: Math.round(income * 0.1),
    hidden: true,
    icon: 'MoreHorizontal'
  }];

};

export const calculateGoalSavings = (
goalType: string,
targetAmount: number,
timelineMonths: number,
remainingCapacity: number) =>
{
  const monthlyRequired = targetAmount / timelineMonths;
  const isFeasible = monthlyRequired <= remainingCapacity;

  return {
    monthlyRequired,
    isFeasible,
    shortfall: isFeasible ? 0 : monthlyRequired - remainingCapacity,
    suggestedTimeline: isFeasible ?
    timelineMonths :
    Math.ceil(targetAmount / remainingCapacity)
  };
};

// Convert India Invest API fund to our recommendation format
const convertToRecommendation = (
fund: IndiaInvestFund,
riskProfile: 'Low' | 'Moderate' | 'High',
monthsRemaining: number)
: InvestmentRecommendation => {
  const suitabilityScore = calculateSuitabilityScore(fund, riskProfile);

  return {
    fundId: fund.schemeCode,
    fundName: fund.schemeName,
    category: fund.schemeCategory || 'Mutual Fund',
    risk: fund.riskLevel,
    minSip: fund.minSipAmount,
    returns3Yr: fund.returns3Yr,
    suitabilityScore,
    reason: getRecommendationReason(fund, riskProfile, monthsRemaining)
  };
};

// Async function to get investment suitability with real API data
export const getInvestmentSuitability = async (
goal: Goal,
capacity: SavingsCapacity)
: Promise<{
  riskProfile: 'Low' | 'Moderate' | 'High';
  recommendations: InvestmentRecommendation[];
}> => {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const monthsRemaining =
  (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  let riskProfile: 'Low' | 'Moderate' | 'High' = 'Low';

  if (monthsRemaining < 12) {
    riskProfile = 'Low';
  } else if (monthsRemaining < 36) {
    riskProfile = 'Moderate';
  } else {
    riskProfile = 'High';
  }

  try {
    // Fetch funds from India Invest API
    const funds = await fetchMutualFunds(riskProfile);

    // Convert and sort by suitability
    const recommendations: InvestmentRecommendation[] = funds.
    map((fund) =>
    convertToRecommendation(fund, riskProfile, monthsRemaining)
    ).
    sort((a, b) => b.suitabilityScore - a.suitabilityScore).
    slice(0, 3);

    return {
      riskProfile,
      recommendations
    };
  } catch (error) {
    console.error(
      'Failed to fetch from India Invest API, using fallback:',
      error
    );
    // Fallback to mock data if API fails
    return getInvestmentSuitabilityFallback(goal, capacity);
  }
};

// Fallback function using mock data
const getInvestmentSuitabilityFallback = (
goal: Goal,
capacity: SavingsCapacity)
: {
  riskProfile: 'Low' | 'Moderate' | 'High';
  recommendations: InvestmentRecommendation[];
} => {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const monthsRemaining =
  (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

  let riskProfile: 'Low' | 'Moderate' | 'High' = 'Low';

  if (monthsRemaining < 12) {
    riskProfile = 'Low';
  } else if (monthsRemaining < 36) {
    riskProfile = 'Moderate';
  } else {
    riskProfile = 'High';
  }

  // Fallback mock funds
  const FALLBACK_FUNDS: FundData[] = [
  {
    id: 'f1',
    name: 'HDFC Mid-Cap Opportunities',
    category: 'Equity',
    risk: 'High',
    minSip: 500,
    returns3Yr: 18.5
  },
  {
    id: 'f2',
    name: 'SBI Blue Chip Fund',
    category: 'Equity',
    risk: 'Moderate',
    minSip: 500,
    returns3Yr: 14.2
  },
  {
    id: 'f3',
    name: 'Axis Long Term Equity',
    category: 'ELSS',
    risk: 'Moderate',
    minSip: 500,
    returns3Yr: 15.8
  },
  {
    id: 'f4',
    name: 'ICICI Prudential Value',
    category: 'Value',
    risk: 'High',
    minSip: 1000,
    returns3Yr: 16.4
  },
  {
    id: 'f5',
    name: 'Parag Parikh Flexi Cap',
    category: 'Flexi Cap',
    risk: 'Low',
    minSip: 1000,
    returns3Yr: 20.1
  }];


  let suitableFunds: FundData[] = [];

  if (riskProfile === 'Low') {
    suitableFunds = FALLBACK_FUNDS.filter((f) => f.risk === 'Low');
  } else if (riskProfile === 'Moderate') {
    suitableFunds = FALLBACK_FUNDS.filter(
      (f) => f.risk === 'Low' || f.risk === 'Moderate'
    );
  } else {
    suitableFunds = FALLBACK_FUNDS;
  }

  const recommendations: InvestmentRecommendation[] = suitableFunds.
  map((fund) => ({
    fundId: fund.id,
    fundName: fund.name,
    category: fund.category,
    risk: fund.risk,
    minSip: fund.minSip,
    returns3Yr: fund.returns3Yr,
    suitabilityScore: calculateSuitabilityScoreFallback(fund, riskProfile),
    reason: getRecommendationReasonFallback(
      fund,
      riskProfile,
      monthsRemaining
    )
  })).
  sort((a, b) => b.suitabilityScore - a.suitabilityScore).
  slice(0, 3);

  return {
    riskProfile,
    recommendations
  };
};

const calculateSuitabilityScore = (
fund: IndiaInvestFund,
profileRisk: string)
: number => {
  let score = 0;

  // Base score on returns
  score += fund.returns3Yr * 2;

  // Risk alignment bonus
  if (fund.riskLevel === profileRisk) score += 20;

  // Bonus for lower minimum SIP (more accessible)
  if (fund.minSipAmount <= 500) score += 10;else
  if (fund.minSipAmount <= 1000) score += 5;

  return score;
};

const calculateSuitabilityScoreFallback = (
fund: FundData,
profileRisk: string)
: number => {
  let score = 0;
  score += fund.returns3Yr * 2;
  if (fund.risk === profileRisk) score += 20;
  return score;
};

const getRecommendationReason = (
fund: IndiaInvestFund,
profileRisk: string,
months: number)
: string => {
  if (fund.riskLevel === 'Low') {
    return `Stable option for ${Math.round(months)}-month timeline with consistent returns`;
  } else if (fund.riskLevel === 'Moderate') {
    return `Balanced growth potential suitable for medium-term goals`;
  } else {
    return `Higher growth potential for long-term wealth creation`;
  }
};

const getRecommendationReasonFallback = (
fund: FundData,
profileRisk: string,
months: number)
: string => {
  if (fund.risk === 'Low') {
    return `Stable option for short-term goals (${Math.round(months)} months)`;
  } else if (fund.risk === 'Moderate') {
    return `Balanced growth for medium-term goals`;
  } else {
    return `High growth potential for long-term wealth creation`;
  }
};