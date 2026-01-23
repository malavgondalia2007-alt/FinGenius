export interface User {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed. We'll simulate hashing.
  name: string;
  role: 'user';
  createdAt: string;
  lastActive?: string; // Track last activity for active users calculation
}

export interface UserProfile {
  userId: string;
  age: number;
  type: 'student' | 'employee';
  onboardingComplete: boolean;
  // Student specific
  weeklyPocketMoney?: number;
  weeklyExpenses?: number; // Estimated
  // Employee specific
  monthlyIncome?: number;
  fixedExpenses?: {
    rent: number;
    groceries: number;
    utilities: number;
  };
  // Detailed loan breakdown
  loans?: {
    homeLoan: number;
    carLoan: number;
    personalLoan: number;
    educationLoan: number;
  };
  // SIP commitments
  sipCommitments?: number;
  savingsPreference?: number; // Percentage
  // Auto-split settings
  autoSplitEnabled?: boolean;
  autoSplitPercentage?: number;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: string;
  type: 'essential' | 'non-essential';
  description: string;
  createdAt: string;
}

export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: string; // e.g., 'Salary Bonus', 'Family Support', 'Refund', 'Gift'
  date: string;
  description: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  category: string;
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string;
  fundName: string;
  amount: number;
  type: 'stock' | 'sip';
  date: string;
  currentValue?: number; // For display purposes
  returns?: number; // Percentage
  risk?: 'Low' | 'Moderate' | 'High';
  createdAt: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  target: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  timestamp: string;
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
  createdAt: string;
  dismissed: boolean;
}

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface FundData {
  id: string;
  name: string;
  category: string;
  risk: 'Low' | 'Moderate' | 'High';
  minSip: number;
  returns3Yr: number;
}

export interface SmartWarning {
  id: string;
  type: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  icon?: string; // Lucide icon name
  date: string;
  dismissed?: boolean;
}

export interface FinancialReport {
  month: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  topExpenseCategory: string;
  goalProgress: number;
  score: number;
  insights: string[];
  investmentGrowth?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  date: string;
  read: boolean;
}

export interface GoalSuggestion {
  type: 'timeline' | 'expense' | 'savings' | 'warning' | 'success';
  message: string;
  action?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
}

export interface CommitmentCategory {
  id: string;
  name: string;
  amount: number;
  recommendedMin: number;
  recommendedMax: number;
  hidden: boolean;
  icon: string;
}

export interface GoalType {
  id: string;
  name: string;
  icon: string;
  description: string;
  suggestedTimelineMonths: number;
  riskProfile: 'Low' | 'Moderate' | 'High';
}

export interface GoalChatMessage {
  id: string;
  goalId: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type?: 'text' | 'investment_prompt' | 'investment_options';
}

export interface InvestmentRecommendation {
  fundId: string;
  fundName: string;
  category: string;
  risk: 'Low' | 'Moderate' | 'High';
  minSip: number;
  returns3Yr: number;
  suitabilityScore: number;
  reason: string;
}

// API Monitoring Types
export interface APIEndpoint {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  status: 'active' | 'inactive' | 'maintenance';
  category: string;
  lastCalled?: string;
  totalCalls: number;
  successRate: number;
  avgResponseTime: number;
  rateLimit: {
    perMinute: number;
    perDay: number;
  };
  currentUsage: {
    perMinute: number;
    perDay: number;
  };
}

export interface APICall {
  id: string;
  apiId: string;
  apiName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  userAgent: string;
  requestBody?: string;
  responseBody?: string;
  errorMessage?: string;
}

export interface APIError {
  id: string;
  apiId: string;
  apiName: string;
  endpoint: string;
  statusCode: number;
  errorType: '4xx' | '5xx';
  errorMessage: string;
  stackTrace?: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress: string;
  module: string;
  resolved: boolean;
}

export interface SecurityAlert {
  id: string;
  type:
  'rate_limit_exceeded' |
  'suspicious_activity' |
  'unauthorized_access' |
  'ddos_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  apiId?: string;
  apiName?: string;
  ipAddress: string;
  userId?: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  actionTaken?: string;
}

export interface APIMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  callsPerMinute: number;
  callsPerHour: number;
  callsPerDay: number;
  errorRate: number;
  uptime: number;
}

export interface RateLimitStatus {
  apiId: string;
  apiName: string;
  limit: number;
  current: number;
  percentage: number;
  resetTime: string;
  exceeded: boolean;
}