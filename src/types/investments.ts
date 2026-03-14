export type RiskProfile = 'low' | 'medium' | 'high';

export interface SIPInput {
  monthlyAmount: number;
  durationYears: number;
  riskProfile: RiskProfile;
}

export interface FundData {
  id: string;
  name: string;
  category: string;
  nav: number;
  cagr3y: number;
  cagr5y: number;
  cagr10y: number;
  riskLevel: RiskProfile;
}

export interface SIPPrediction {
  totalInvestment: number;
  estimatedValue: number;
  estimatedGains: number;
  cagrUsed: number;
  fundUsed?: string; // Name of the fund used for reference
}

export interface InvestmentBreakdown {
  investmentPercentage: number;
  gainsPercentage: number;
}