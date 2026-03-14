import {
  FundData,
  InvestmentBreakdown,
  RiskProfile,
  SIPPrediction } from
'../types/investments';

/**
 * Calculates the future value of a SIP investment
 * Formula: FV = P × [ ( (1 + r)^n − 1 ) / r ] × (1 + r)
 * @param monthlyAmount Monthly SIP amount (P)
 * @param annualReturn Annual CAGR in percentage (e.g., 12 for 12%)
 * @param years Investment duration in years
 */
export const calculateSIPFutureValue = (
monthlyAmount: number,
annualReturn: number,
years: number)
: number => {
  if (monthlyAmount <= 0 || years <= 0) return 0;

  // Monthly return rate (r)
  const r = annualReturn / 12 / 100;

  // Total number of months (n)
  const n = years * 12;

  if (r === 0) {
    return monthlyAmount * n;
  }

  // FV calculation
  const fv = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

  return Math.round(fv);
};

/**
 * Returns appropriate CAGR based on risk profile and available fund data
 */
export const adjustCAGRByRisk = (
funds: FundData[],
riskProfile: RiskProfile)
: {cagr: number;fundName?: string;} => {
  // Default conservative fallbacks if no data
  const defaults = {
    low: 8.5, // Debt/Conservative
    medium: 11.0, // Balanced/Hybrid
    high: 13.5 // Equity/Aggressive
  };

  if (!funds || funds.length === 0) {
    return { cagr: defaults[riskProfile] };
  }

  // Filter funds matching the risk profile if possible, otherwise use all
  const matchingFunds = funds.filter((f) => f.riskLevel === riskProfile);
  const fundsToConsider = matchingFunds.length > 0 ? matchingFunds : funds;

  // Calculate average 5Y CAGR of relevant funds
  // We prefer 5Y CAGR for stability, fallback to 3Y
  const validFunds = fundsToConsider.filter((f) => f.cagr5y > 0 || f.cagr3y > 0);

  if (validFunds.length === 0) {
    return { cagr: defaults[riskProfile] };
  }

  // Find the representative fund based on risk strategy
  // Low risk: conservative (min returns)
  // Medium risk: average returns
  // High risk: aggressive (max returns)

  const sortedByReturn = [...validFunds].sort((a, b) => {
    const returnA = a.cagr5y || a.cagr3y;
    const returnB = b.cagr5y || b.cagr3y;
    return returnA - returnB;
  });

  let selectedFund: FundData;

  if (riskProfile === 'low') {
    // Pick from the lower end (conservative)
    selectedFund = sortedByReturn[0];
  } else if (riskProfile === 'high') {
    // Pick from the higher end (aggressive)
    selectedFund = sortedByReturn[sortedByReturn.length - 1];
  } else {
    // Pick median
    const midIndex = Math.floor(sortedByReturn.length / 2);
    selectedFund = sortedByReturn[midIndex];
  }

  const cagr = selectedFund.cagr5y || selectedFund.cagr3y;
  return { cagr, fundName: selectedFund.name };
};

export const calculateInvestmentBreakdown = (
prediction: SIPPrediction)
: InvestmentBreakdown => {
  if (prediction.estimatedValue === 0) {
    return { investmentPercentage: 0, gainsPercentage: 0 };
  }

  const investmentPercentage =
  prediction.totalInvestment / prediction.estimatedValue * 100;
  const gainsPercentage =
  prediction.estimatedGains / prediction.estimatedValue * 100;

  return {
    investmentPercentage: Math.round(investmentPercentage),
    gainsPercentage: Math.round(gainsPercentage)
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};