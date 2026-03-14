import { db } from './database';
import { User, UserProfile, Expense, Income, Goal, Investment } from '../types';
import {
  MCPResponse,
  MCPUserContext,
  MCPFinancialSummary,
  MCPSavingsCalculations,
  MCPGoalAnalysis,
  MCPInvestmentRecommendation,
  MCPFinancialReport,
  MCPExpenseFilter,
  MCPIncomeFilter,
  MCPDateFilter,
  MCPToolDefinition,
  MCPToolName } from
'../types/mcp';
import {
  calculateCategoryBreakdown,
  calculateGoalProgress,
  calculateTotalExpenses,
  calculateTotalIncome } from
'../utils/calculations';
import { calculateSavingsCapacity } from '../utils/savingsCalculations';

// Helper to create MCP response
function createResponse<T>(
data: T,
success = true,
error?: string)
: MCPResponse<T> {
  return {
    success,
    data: success ? data : undefined,
    error,
    timestamp: new Date().toISOString()
  };
}

// Helper to get date range based on period
function getDateRange(filter?: MCPDateFilter): {start: Date;end: Date;} {
  const end = new Date();
  let start = new Date();

  if (filter?.startDate && filter?.endDate) {
    return {
      start: new Date(filter.startDate),
      end: new Date(filter.endDate)
    };
  }

  switch (filter?.period) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    case 'all':
    default:
      start = new Date('2000-01-01');
  }

  return { start, end };
}

// Helper to filter by date
function filterByDate<T extends {date: string;}>(
items: T[],
filter?: MCPDateFilter)
: T[] {
  if (!filter) return items;
  const { start, end } = getDateRange(filter);
  return items.filter((item) => {
    const itemDate = new Date(item.date);
    return itemDate >= start && itemDate <= end;
  });
}

/**
 * MCP Service - Model Context Protocol integration for Fingenius
 * Provides secure, real-time access to financial data and calculations
 */
export const mcpService = {
  /**
   * Get available MCP tools
   */
  getToolDefinitions(): MCPToolDefinition[] {
    return [
    {
      name: 'get_user_context',
      description: 'Get authenticated user data and profile information',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' }
        },
        required: ['userId']
      }
    },
    {
      name: 'get_financial_summary',
      description:
      'Get comprehensive financial overview including income, expenses, savings, and goals',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' },
          period: {
            type: 'string',
            description: 'Time period: week, month, quarter, year, all'
          }
        },
        required: ['userId']
      }
    },
    {
      name: 'get_expenses',
      description: 'Get expense records with optional filtering',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' },
          category: { type: 'string', description: 'Filter by category' },
          type: {
            type: 'string',
            description: 'Filter by type: essential or non-essential'
          },
          period: { type: 'string', description: 'Time period' }
        },
        required: ['userId']
      }
    },
    {
      name: 'get_income',
      description: 'Get income records with optional filtering',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' },
          source: { type: 'string', description: 'Filter by source' },
          period: { type: 'string', description: 'Time period' }
        },
        required: ['userId']
      }
    },
    {
      name: 'get_goals',
      description: 'Get financial goals with progress calculations',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' }
        },
        required: ['userId']
      }
    },
    {
      name: 'get_goal_analysis',
      description: 'Get detailed analysis for a specific goal',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' },
          goalId: { type: 'string', description: 'Goal ID' }
        },
        required: ['userId', 'goalId']
      }
    },
    {
      name: 'get_savings_calculations',
      description:
      'Get savings capacity and projections based on income and expenses',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' }
        },
        required: ['userId']
      }
    },
    {
      name: 'get_financial_report',
      description:
      'Get AI-generated financial report with insights and recommendations',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' },
          month: {
            type: 'string',
            description: 'Report month (e.g., January)'
          },
          year: { type: 'number', description: 'Report year' }
        },
        required: ['userId']
      }
    },
    {
      name: 'get_investment_recommendations',
      description:
      'Get personalized investment recommendations based on profile and goals',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID' },
          riskTolerance: {
            type: 'string',
            description: 'Risk tolerance: Low, Moderate, High'
          },
          goalId: {
            type: 'string',
            description: 'Optional goal ID to match recommendations'
          }
        },
        required: ['userId']
      }
    }];

  },

  /**
   * Execute an MCP tool
   */
  async executeTool(
  toolName: MCPToolName,
  params: Record<string, any>)
  : Promise<MCPResponse<any>> {
    try {
      switch (toolName) {
        case 'get_user_context':
          return this.getUserContext(params.userId);
        case 'get_financial_summary':
          return this.getFinancialSummary(params.userId, {
            period: params.period
          });
        case 'get_expenses':
          return this.getExpenses(params.userId, params);
        case 'get_income':
          return this.getIncome(params.userId, params);
        case 'get_goals':
          return this.getGoals(params.userId);
        case 'get_goal_analysis':
          return this.getGoalAnalysis(params.userId, params.goalId);
        case 'get_savings_calculations':
          return this.getSavingsCalculations(params.userId);
        case 'get_financial_report':
          return this.getFinancialReport(
            params.userId,
            params.month,
            params.year
          );
        case 'get_investment_recommendations':
          return this.getInvestmentRecommendations(
            params.userId,
            params.riskTolerance,
            params.goalId
          );
        default:
          return createResponse(null, false, `Unknown tool: ${toolName}`);
      }
    } catch (error) {
      return createResponse(
        null,
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  },

  /**
   * Get user context including authentication status and profile
   */
  getUserContext(userId: string): MCPResponse<MCPUserContext> {
    const users = db.users.getAll();
    const user = users.find((u) => u.id === userId) || null;
    const profile = user ? db.profiles.getByUserId(userId) || null : null;

    return createResponse<MCPUserContext>({
      user: user ? { ...user, password: '[REDACTED]' } as User : null,
      profile,
      isAuthenticated: !!user,
      sessionId: crypto.randomUUID()
    });
  },

  /**
   * Get comprehensive financial summary
   */
  getFinancialSummary(
  userId: string,
  filter?: MCPDateFilter)
  : MCPResponse<MCPFinancialSummary> {
    const profile = db.profiles.getByUserId(userId);
    if (!profile) {
      return createResponse<MCPFinancialSummary>(
        null as any,
        false,
        'User profile not found'
      );
    }

    const allExpenses = db.expenses.getByUserId(userId);
    const allIncome = db.income.getByUserId(userId);
    const goals = db.goals.getByUserId(userId);
    const investments = db.investments.getByUserId(userId);

    const expenses = filterByDate(allExpenses, filter);
    const income = filterByDate(allIncome, filter);

    const totalExpenses = calculateTotalExpenses(expenses);
    const totalIncome = calculateTotalIncome(income);
    const categoryBreakdown = calculateCategoryBreakdown(expenses);

    // Calculate monthly values
    const { start, end } = getDateRange(filter);
    const monthsDiff = Math.max(
      1,
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const monthlyExpenses = totalExpenses / monthsDiff;
    const monthlyIncome = profile.monthlyIncome || totalIncome / monthsDiff;

    // Calculate savings
    const fixedExpenses = profile.fixedExpenses ?
    Object.values(profile.fixedExpenses).reduce((a, b) => a + b, 0) :
    0;
    const loanPayments = profile.loans ?
    Object.values(profile.loans).reduce((a, b) => a + b, 0) :
    0;
    const monthlyCapacity =
    monthlyIncome -
    fixedExpenses -
    loanPayments - (
    profile.sipCommitments || 0);
    const netSavings = monthlyCapacity - monthlyExpenses;

    // Calculate goals progress
    const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSavedAmount = goals.reduce((sum, g) => sum + g.savedAmount, 0);
    const completedGoals = goals.filter(
      (g) => g.savedAmount >= g.targetAmount
    ).length;

    // Calculate investments
    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
    const currentValue = investments.reduce(
      (sum, i) =>
      sum + (i.currentValue || i.amount * (1 + (i.returns || 0) / 100)),
      0
    );

    // Calculate health score (0-100)
    const savingsRate =
    monthlyIncome > 0 ? netSavings / monthlyIncome * 100 : 0;
    const goalProgress =
    totalTargetAmount > 0 ? totalSavedAmount / totalTargetAmount * 100 : 0;
    const healthScore = Math.min(
      100,
      Math.max(0, savingsRate * 0.4 + goalProgress * 0.3 + 30)
    );

    const summary: MCPFinancialSummary = {
      userId,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      income: {
        total: totalIncome,
        monthly: monthlyIncome,
        sources: income.reduce(
          (acc, i) => {
            const existing = acc.find((s) => s.source === i.source);
            if (existing) {
              existing.amount += i.amount;
            } else {
              acc.push({ source: i.source, amount: i.amount });
            }
            return acc;
          },
          [] as {source: string;amount: number;}[]
        )
      },
      expenses: {
        total: totalExpenses,
        monthly: monthlyExpenses,
        byCategory: categoryBreakdown.map((c) => ({
          category: c.name,
          amount: c.value,
          percentage: totalExpenses > 0 ? c.value / totalExpenses * 100 : 0
        })),
        essential: expenses.
        filter((e) => e.type === 'essential').
        reduce((sum, e) => sum + e.amount, 0),
        nonEssential: expenses.
        filter((e) => e.type === 'non-essential').
        reduce((sum, e) => sum + e.amount, 0)
      },
      savings: {
        netSavings,
        savingsRate,
        monthlyCapacity,
        projectedAnnual: netSavings * 12
      },
      goals: {
        total: goals.length,
        completed: completedGoals,
        inProgress: goals.length - completedGoals,
        totalTargetAmount,
        totalSavedAmount,
        overallProgress: goalProgress
      },
      investments: {
        totalInvested,
        currentValue,
        returns: currentValue - totalInvested,
        returnsPercentage:
        totalInvested > 0 ?
        (currentValue - totalInvested) / totalInvested * 100 :
        0
      },
      healthScore: Math.round(healthScore),
      lastUpdated: new Date().toISOString()
    };

    return createResponse(summary);
  },

  /**
   * Get expenses with filtering
   */
  getExpenses(
  userId: string,
  filter?: MCPExpenseFilter)
  : MCPResponse<Expense[]> {
    let expenses = db.expenses.getByUserId(userId);

    // Apply date filter
    expenses = filterByDate(expenses, filter);

    // Apply category filter
    if (filter?.category) {
      expenses = expenses.filter((e) => e.category === filter.category);
    }

    // Apply type filter
    if (filter?.type) {
      expenses = expenses.filter((e) => e.type === filter.type);
    }

    // Apply amount filters
    if (filter?.minAmount !== undefined) {
      expenses = expenses.filter((e) => e.amount >= filter.minAmount!);
    }
    if (filter?.maxAmount !== undefined) {
      expenses = expenses.filter((e) => e.amount <= filter.maxAmount!);
    }

    return createResponse(expenses);
  },

  /**
   * Get income with filtering
   */
  getIncome(userId: string, filter?: MCPIncomeFilter): MCPResponse<Income[]> {
    let income = db.income.getByUserId(userId);

    // Apply date filter
    income = filterByDate(income, filter);

    // Apply source filter
    if (filter?.source) {
      income = income.filter((i) => i.source === filter.source);
    }

    // Apply amount filters
    if (filter?.minAmount !== undefined) {
      income = income.filter((i) => i.amount >= filter.minAmount!);
    }
    if (filter?.maxAmount !== undefined) {
      income = income.filter((i) => i.amount <= filter.maxAmount!);
    }

    return createResponse(income);
  },

  /**
   * Get goals with progress calculations
   */
  getGoals(userId: string): MCPResponse<(Goal & {progress: number;})[]> {
    const goals = db.goals.getByUserId(userId);
    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      progress: calculateGoalProgress(goal)
    }));

    return createResponse(goalsWithProgress);
  },

  /**
   * Get detailed goal analysis
   */
  getGoalAnalysis(
  userId: string,
  goalId: string)
  : MCPResponse<MCPGoalAnalysis> {
    const goals = db.goals.getByUserId(userId);
    const goal = goals.find((g) => g.id === goalId);

    if (!goal) {
      return createResponse<MCPGoalAnalysis>(
        null as any,
        false,
        'Goal not found'
      );
    }

    const profile = db.profiles.getByUserId(userId);
    const progress = calculateGoalProgress(goal);
    const remainingAmount = goal.targetAmount - goal.savedAmount;
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );
    const monthsRemaining = Math.max(1, daysRemaining / 30);
    const monthlyRequired = remainingAmount / monthsRemaining;

    // Determine feasibility
    let feasibility: MCPGoalAnalysis['feasibility'] = 'on_track';
    const savingsCapacity = profile ? calculateSavingsCapacity(profile) : null;
    const monthlyCapacity = savingsCapacity?.remainingIncome || 0;

    if (progress >= 100) {
      feasibility = 'achieved';
    } else if (monthlyRequired > monthlyCapacity * 1.5) {
      feasibility = 'needs_attention';
    } else if (monthlyRequired > monthlyCapacity) {
      feasibility = 'at_risk';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (feasibility === 'needs_attention') {
      recommendations.push(
        `Consider extending your deadline or reducing the target amount`
      );
      recommendations.push(
        `You need to save ₹${monthlyRequired.toLocaleString()} monthly, but your capacity is ₹${monthlyCapacity.toLocaleString()}`
      );
    } else if (feasibility === 'at_risk') {
      recommendations.push(
        `Try to reduce non-essential expenses to increase savings`
      );
      recommendations.push(
        `Consider additional income sources to meet this goal`
      );
    } else if (feasibility === 'on_track') {
      recommendations.push(
        `Great progress! Keep maintaining your current savings rate`
      );
    } else if (feasibility === 'achieved') {
      recommendations.push(`Congratulations! You've achieved this goal!`);
      recommendations.push(`Consider setting a new financial goal`);
    }

    const analysis: MCPGoalAnalysis = {
      goalId: goal.id,
      goalName: goal.name,
      targetAmount: goal.targetAmount,
      savedAmount: goal.savedAmount,
      remainingAmount,
      progress,
      deadline: goal.deadline,
      daysRemaining,
      monthlyRequired,
      feasibility,
      recommendations
    };

    return createResponse(analysis);
  },

  /**
   * Get savings calculations and projections
   */
  getSavingsCalculations(userId: string): MCPResponse<MCPSavingsCalculations> {
    const profile = db.profiles.getByUserId(userId);
    if (!profile) {
      return createResponse<MCPSavingsCalculations>(
        null as any,
        false,
        'User profile not found'
      );
    }

    const expenses = db.expenses.getByUserId(userId);
    const monthlyIncome = profile.monthlyIncome || 0;
    const fixedExpenses = profile.fixedExpenses ?
    Object.values(profile.fixedExpenses).reduce((a, b) => a + b, 0) :
    0;
    const loanPayments = profile.loans ?
    Object.values(profile.loans).reduce((a, b) => a + b, 0) :
    0;
    const sipCommitments = profile.sipCommitments || 0;

    // Calculate variable expenses from recent data
    const recentExpenses = expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return expenseDate >= monthAgo;
    });
    const variableExpenses = recentExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const availableForSavings =
    monthlyIncome -
    fixedExpenses -
    loanPayments -
    sipCommitments -
    variableExpenses;

    // Calculate different savings scenarios
    const savingsCapacity = {
      conservative: Math.max(0, availableForSavings * 0.5),
      moderate: Math.max(0, availableForSavings * 0.7),
      aggressive: Math.max(0, availableForSavings * 0.9)
    };

    // Calculate projections (assuming moderate savings)
    const monthlySavings = savingsCapacity.moderate;
    const projections = {
      months3: monthlySavings * 3,
      months6: monthlySavings * 6,
      months12: monthlySavings * 12,
      years5: monthlySavings * 60
    };

    // Generate recommendations
    const recommendations: string[] = [];
    const savingsRate =
    monthlyIncome > 0 ? availableForSavings / monthlyIncome * 100 : 0;

    if (savingsRate < 10) {
      recommendations.push(
        'Your savings rate is below 10%. Consider reducing non-essential expenses.'
      );
    } else if (savingsRate < 20) {
      recommendations.push(
        'Good start! Aim to increase your savings rate to 20% for better financial security.'
      );
    } else if (savingsRate < 30) {
      recommendations.push(
        'Great savings rate! Consider investing a portion for long-term growth.'
      );
    } else {
      recommendations.push(
        'Excellent savings discipline! Make sure to diversify your investments.'
      );
    }

    if (loanPayments > monthlyIncome * 0.4) {
      recommendations.push(
        'Your loan payments exceed 40% of income. Consider debt consolidation.'
      );
    }

    const calculations: MCPSavingsCalculations = {
      userId,
      monthlyIncome,
      fixedExpenses,
      variableExpenses,
      loanPayments,
      sipCommitments,
      availableForSavings,
      savingsCapacity,
      projections,
      recommendations
    };

    return createResponse(calculations);
  },

  /**
   * Get AI-generated financial report
   */
  getFinancialReport(
  userId: string,
  month?: string,
  year?: number)
  : MCPResponse<MCPFinancialReport> {
    const profile = db.profiles.getByUserId(userId);
    if (!profile) {
      return createResponse<MCPFinancialReport>(
        null as any,
        false,
        'User profile not found'
      );
    }

    const now = new Date();
    const reportMonth =
    month || now.toLocaleString('default', { month: 'long' });
    const reportYear = year || now.getFullYear();

    const expenses = db.expenses.getByUserId(userId);
    const income = db.income.getByUserId(userId);
    const goals = db.goals.getByUserId(userId);
    const investments = db.investments.getByUserId(userId);

    const totalExpenses = calculateTotalExpenses(expenses);
    const totalIncome =
    (profile.monthlyIncome || 0) + calculateTotalIncome(income);
    const categoryBreakdown = calculateCategoryBreakdown(expenses);
    const topCategory =
    categoryBreakdown.length > 0 ? categoryBreakdown[0].name : 'N/A';

    const savingsRate =
    totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome * 100 : 0;
    const goalProgress =
    goals.length > 0 ?
    goals.reduce((sum, g) => sum + calculateGoalProgress(g), 0) /
    goals.length :
    0;

    // Calculate financial health score
    const score = Math.min(
      100,
      Math.max(0, savingsRate * 0.4 + goalProgress * 0.4 + 20)
    );

    // Generate insights
    const insights: string[] = [];
    const aiInsights: string[] = [];
    const actionItems: string[] = [];
    const warnings: string[] = [];
    const achievements: string[] = [];

    // Analyze spending patterns
    if (totalExpenses > totalIncome * 0.8) {
      warnings.push('Your expenses are consuming more than 80% of your income');
      actionItems.push('Review and reduce non-essential spending');
    }

    const nonEssential = expenses.filter((e) => e.type === 'non-essential');
    const nonEssentialTotal = nonEssential.reduce((sum, e) => sum + e.amount, 0);
    if (nonEssentialTotal > totalExpenses * 0.3) {
      insights.push(
        `Non-essential spending is ${Math.round(nonEssentialTotal / totalExpenses * 100)}% of total expenses`
      );
      aiInsights.push(
        'Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings'
      );
    }

    // Check goal progress
    const achievedGoals = goals.filter((g) => g.savedAmount >= g.targetAmount);
    if (achievedGoals.length > 0) {
      achievements.push(
        `Achieved ${achievedGoals.length} financial goal(s) this period!`
      );
    }

    const atRiskGoals = goals.filter((g) => {
      const progress = calculateGoalProgress(g);
      const deadline = new Date(g.deadline);
      const daysRemaining =
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return progress < 50 && daysRemaining < 90;
    });
    if (atRiskGoals.length > 0) {
      warnings.push(
        `${atRiskGoals.length} goal(s) are at risk of not being met`
      );
      actionItems.push(
        'Review and adjust your goal timelines or increase savings'
      );
    }

    // Investment insights
    const investmentReturns =
    investments.reduce((sum, i) => sum + (i.returns || 0), 0) /
    Math.max(1, investments.length);
    if (investmentReturns > 12) {
      achievements.push(
        `Your investments are performing well with ${investmentReturns.toFixed(1)}% average returns`
      );
    }

    if (savingsRate > 20) {
      achievements.push(`Excellent savings rate of ${savingsRate.toFixed(1)}%!`);
    }

    insights.push(`Top spending category: ${topCategory}`);
    insights.push(`Overall financial health score: ${Math.round(score)}/100`);

    const report: MCPFinancialReport = {
      month: reportMonth,
      year: reportYear,
      totalIncome,
      totalExpenses,
      savingsRate,
      topExpenseCategory: topCategory,
      goalProgress,
      score: Math.round(score),
      insights,
      investmentGrowth: investmentReturns,
      generatedAt: new Date().toISOString(),
      periodCovered: `${reportMonth} ${reportYear}`,
      aiInsights,
      actionItems,
      warnings,
      achievements
    };

    return createResponse(report);
  },

  /**
   * Get personalized investment recommendations
   */
  getInvestmentRecommendations(
  userId: string,
  riskTolerance?: 'Low' | 'Moderate' | 'High',
  goalId?: string)
  : MCPResponse<MCPInvestmentRecommendation[]> {
    const profile = db.profiles.getByUserId(userId);
    if (!profile) {
      return createResponse<MCPInvestmentRecommendation[]>(
        [],
        false,
        'User profile not found'
      );
    }

    const goals = db.goals.getByUserId(userId);
    const targetGoal = goalId ? goals.find((g) => g.id === goalId) : null;

    // Determine risk tolerance based on profile if not provided
    const effectiveRisk =
    riskTolerance || (
    profile.age && profile.age < 30 ?
    'High' :
    profile.age && profile.age < 45 ?
    'Moderate' :
    'Low');

    // Sample fund recommendations (in a real app, this would come from an API)
    const recommendations: MCPInvestmentRecommendation[] = [];

    if (effectiveRisk === 'Low' || effectiveRisk === 'Moderate') {
      recommendations.push({
        fundId: 'fund_1',
        fundName: 'HDFC Balanced Advantage Fund',
        category: 'Hybrid',
        risk: 'Moderate',
        minSip: 500,
        expectedReturns: 12.5,
        suitabilityScore: effectiveRisk === 'Moderate' ? 95 : 80,
        reason:
        'Balanced fund suitable for moderate risk appetite with consistent returns',
        matchesGoal: targetGoal?.name
      });
    }

    if (effectiveRisk === 'Moderate' || effectiveRisk === 'High') {
      recommendations.push({
        fundId: 'fund_2',
        fundName: 'Axis Bluechip Fund',
        category: 'Large Cap',
        risk: 'Moderate',
        minSip: 500,
        expectedReturns: 14.2,
        suitabilityScore: 90,
        reason:
        'Large cap fund with stable blue-chip companies for steady growth',
        matchesGoal: targetGoal?.name
      });
    }

    if (effectiveRisk === 'High') {
      recommendations.push({
        fundId: 'fund_3',
        fundName: 'Mirae Asset Emerging Bluechip',
        category: 'Large & Mid Cap',
        risk: 'High',
        minSip: 1000,
        expectedReturns: 18.5,
        suitabilityScore: 85,
        reason: 'High growth potential with exposure to emerging companies',
        matchesGoal: targetGoal?.name
      });
    }

    recommendations.push({
      fundId: 'fund_4',
      fundName: 'SBI Liquid Fund',
      category: 'Liquid',
      risk: 'Low',
      minSip: 500,
      expectedReturns: 6.5,
      suitabilityScore: effectiveRisk === 'Low' ? 90 : 70,
      reason: 'Ideal for emergency fund with high liquidity and stable returns'
    });

    // Sort by suitability score
    recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return createResponse(recommendations);
  }
};

export default mcpService;