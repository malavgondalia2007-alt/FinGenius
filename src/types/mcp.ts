import {
  User,
  UserProfile,
  Expense,
  Income,
  Goal,
  Investment,
  FinancialReport } from
'./index';

// MCP Request/Response Types
export interface MCPRequest {
  tool: string;
  params?: Record<string, any>;
}

export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// User Context
export interface MCPUserContext {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  sessionId: string;
}

// Financial Summary
export interface MCPFinancialSummary {
  userId: string;
  period: {
    start: string;
    end: string;
  };
  income: {
    total: number;
    monthly: number;
    sources: {source: string;amount: number;}[];
  };
  expenses: {
    total: number;
    monthly: number;
    byCategory: {category: string;amount: number;percentage: number;}[];
    essential: number;
    nonEssential: number;
  };
  savings: {
    netSavings: number;
    savingsRate: number;
    monthlyCapacity: number;
    projectedAnnual: number;
  };
  goals: {
    total: number;
    completed: number;
    inProgress: number;
    totalTargetAmount: number;
    totalSavedAmount: number;
    overallProgress: number;
  };
  investments: {
    totalInvested: number;
    currentValue: number;
    returns: number;
    returnsPercentage: number;
  };
  healthScore: number;
  lastUpdated: string;
}

// Savings Calculations
export interface MCPSavingsCalculations {
  userId: string;
  monthlyIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  loanPayments: number;
  sipCommitments: number;
  availableForSavings: number;
  savingsCapacity: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
  projections: {
    months3: number;
    months6: number;
    months12: number;
    years5: number;
  };
  recommendations: string[];
}

// Goal Analysis
export interface MCPGoalAnalysis {
  goalId: string;
  goalName: string;
  targetAmount: number;
  savedAmount: number;
  remainingAmount: number;
  progress: number;
  deadline: string;
  daysRemaining: number;
  monthlyRequired: number;
  feasibility: 'on_track' | 'at_risk' | 'needs_attention' | 'achieved';
  recommendations: string[];
}

// Investment Recommendation
export interface MCPInvestmentRecommendation {
  fundId: string;
  fundName: string;
  category: string;
  risk: 'Low' | 'Moderate' | 'High';
  minSip: number;
  expectedReturns: number;
  suitabilityScore: number;
  reason: string;
  matchesGoal?: string;
}

// Financial Report
export interface MCPFinancialReport extends FinancialReport {
  generatedAt: string;
  periodCovered: string;
  aiInsights: string[];
  actionItems: string[];
  warnings: string[];
  achievements: string[];
}

// Filter Options
export interface MCPDateFilter {
  startDate?: string;
  endDate?: string;
  period?: 'week' | 'month' | 'quarter' | 'year' | 'all';
}

export interface MCPExpenseFilter extends MCPDateFilter {
  category?: string;
  type?: 'essential' | 'non-essential';
  minAmount?: number;
  maxAmount?: number;
}

export interface MCPIncomeFilter extends MCPDateFilter {
  source?: string;
  minAmount?: number;
  maxAmount?: number;
}

// MCP Tool Definitions
export type MCPToolName =
'get_user_context' |
'get_financial_summary' |
'get_expenses' |
'get_income' |
'get_goals' |
'get_goal_analysis' |
'get_savings_calculations' |
'get_financial_report' |
'get_investment_recommendations';

export interface MCPToolDefinition {
  name: MCPToolName;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {type: string;description: string;}>;
    required?: string[];
  };
}