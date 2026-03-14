import { RiskProfile } from '../types/investments';
import { IndiaInvestFund } from '../services/indiaInvestApi';

export interface FundScore {
  fund: IndiaInvestFund;
  score: number;
  breakdown: {
    returns: number;
    risk: number;
    expense: number;
    stability: number;
  };
}

export interface RecommendationResult {
  topFund: IndiaInvestFund;
  alternatives: IndiaInvestFund[];
  rejectedCount: number;
  safeLimit: {
    min: number;
    max: number;
    isSafe: boolean;
  };
}

/**
 * Calculate safe SIP limit based on monthly savings
 * Safe limit is typically 20-40% of monthly savings
 */
export const calculateSafeSIPLimit = (
monthlySavings: number,
proposedSIP: number)
: {min: number;max: number;isSafe: boolean;} => {
  const min = Math.round(monthlySavings * 0.2);
  const max = Math.round(monthlySavings * 0.4);

  return {
    min,
    max,
    isSafe: proposedSIP <= max // We only check upper bound for safety warning
  };
};

/**
 * Map risk profile to allowed fund categories
 */
export const getAllowedFundCategories = (risk: RiskProfile): string[] => {
  switch (risk) {
    case 'low':
      return [
      'Debt',
      'Liquid',
      'Conservative Hybrid',
      'Hybrid - Balanced Advantage'];

    case 'medium':
      return [
      'Hybrid',
      'Large Cap',
      'Equity - Large Cap',
      'ELSS',
      'Equity - Large & Mid Cap'];

    case 'high':
      return [
      'Mid Cap',
      'Small Cap',
      'Equity - Mid Cap',
      'Equity - Small Cap',
      'Equity - Value',
      'Equity - Flexi Cap',
      'Equity Multi Cap'];

    default:
      return [];
  }
};

/**
 * Filter funds based on risk profile and performance criteria
 */
export const filterFunds = (
funds: IndiaInvestFund[],
risk: RiskProfile)
: IndiaInvestFund[] => {
  const allowedCategories = getAllowedFundCategories(risk);

  return funds.filter((fund) => {
    // 1. Category/Risk Check
    // We check if the fund's category is in our allowed list OR if its risk level matches
    // This is a bit loose to accommodate data variations
    const isCategoryAllowed = allowedCategories.some(
      (cat) => fund.schemeCategory.includes(cat) || fund.schemeCategory === cat
    );

    // Strict risk level check from API data if available
    const isRiskLevelAllowed =
    risk === 'low' && fund.riskLevel === 'Low' ||
    risk === 'medium' && (
    fund.riskLevel === 'Moderate' || fund.riskLevel === 'Low') || // Medium can take Low risk too
    risk === 'high'; // High can take anything, but usually prefers high growth

    if (risk === 'low' && fund.riskLevel !== 'Low') return false;
    if (risk === 'medium' && fund.riskLevel === 'High') return false;

    // 2. Performance Check (5Y Returns > 8%)
    // If 5Y returns are missing, we skip this check or use 3Y
    const returns = fund.returns5Yr || fund.returns3Yr;
    if (returns < 8) return false;

    // 3. Expense Ratio Check
    // Filter out very high expense ratios (> 2.5%)
    if (fund.expenseRatio > 2.5) return false;

    return true;
  });
};

/**
 * Score funds based on weighted criteria
 * Score = 40% Past Returns + 30% Risk Match + 20% Low Expense + 10% Stability
 */
export const scoreFund = (
fund: IndiaInvestFund,
risk: RiskProfile)
: FundScore => {
  // 1. Returns Score (40%)
  // Normalize returns (assume max reasonable return is 30%)
  const returnVal = fund.returns5Yr || fund.returns3Yr;
  const returnsScore = Math.min(returnVal / 30 * 100, 100) * 0.4;

  // 2. Risk Match Score (30%)
  // Higher score if fund risk matches user risk perfectly
  let riskMatchVal = 0;
  if (risk === 'low' && fund.riskLevel === 'Low') riskMatchVal = 100;else
  if (risk === 'medium' && fund.riskLevel === 'Moderate')
  riskMatchVal = 100;else
  if (risk === 'medium' && fund.riskLevel === 'Low') riskMatchVal = 80;else
  if (risk === 'high' && fund.riskLevel === 'High') riskMatchVal = 100;else
  if (risk === 'high' && fund.riskLevel === 'Moderate') riskMatchVal = 80;else
  riskMatchVal = 50;

  const riskScore = riskMatchVal * 0.3;

  // 3. Expense Ratio Score (20%)
  // Lower is better. Assume 0% is perfect, 2.5% is 0 score.
  const expenseVal = Math.max(0, 2.5 - fund.expenseRatio) / 2.5 * 100;
  const expenseScore = expenseVal * 0.2;

  // 4. Stability/AUM Score (10%)
  // Higher AUM generally implies stability. Cap at 50,000 Cr.
  const aumVal = Math.min(fund.aum / 50000, 1) * 100;
  const stabilityScore = aumVal * 0.1;

  const totalScore = returnsScore + riskScore + expenseScore + stabilityScore;

  return {
    fund,
    score: totalScore,
    breakdown: {
      returns: returnsScore,
      risk: riskScore,
      expense: expenseScore,
      stability: stabilityScore
    }
  };
};

/**
 * Get best recommendations from available funds
 */
export const getBestRecommendations = (
funds: IndiaInvestFund[],
risk: RiskProfile,
monthlySavings: number,
proposedSIP: number)
: RecommendationResult => {
  // 1. Calculate Safe Limit
  const safeLimit = calculateSafeSIPLimit(monthlySavings, proposedSIP);

  // 2. Filter Funds
  const filteredFunds = filterFunds(funds, risk);
  const rejectedCount = funds.length - filteredFunds.length;

  // 3. Score Funds
  const scoredFunds = filteredFunds.map((f) => scoreFund(f, risk));

  // 4. Sort by Score
  scoredFunds.sort((a, b) => b.score - a.score);

  // 5. Select Top and Alternatives
  const topFund = scoredFunds[0]?.fund;
  const alternatives = scoredFunds.slice(1, 3).map((s) => s.fund);

  return {
    topFund,
    alternatives,
    rejectedCount,
    safeLimit
  };
};