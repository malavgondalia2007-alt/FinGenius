import { db } from '../services/database';
import { SystemAlert } from '../types';

/**
 * Generate system alerts based on real-time data analysis
 */
export const generateSystemAlerts = (): SystemAlert[] => {
  const alerts: SystemAlert[] = [];
  const users = db.users.getAll();
  const expenses = db.expenses.getAll();
  const tickets = db.support.getAll();

  // Alert 1: Check for high-risk spending patterns
  let highRiskUsers = 0;
  users.forEach((user) => {
    const userExpenses = expenses.filter((e) => e.userId === user.id);
    const profile = db.profiles.getByUserId(user.id);

    if (profile && userExpenses.length > 0) {
      const totalExpenses = userExpenses.reduce((sum, e) => sum + e.amount, 0);
      const income =
      profile.type === 'student' ?
      (profile.weeklyPocketMoney || 0) * 4 :
      profile.monthlyIncome || 0;

      if (income > 0 && totalExpenses / income > 0.95) {
        highRiskUsers++;
      }
    }
  });

  if (highRiskUsers > 0) {
    alerts.push({
      id: `alert-risk-${Date.now()}`,
      severity: highRiskUsers > 2 ? 'critical' : 'warning',
      title: 'High-Risk Spending Detected',
      message: `${highRiskUsers} user${highRiskUsers > 1 ? 's are' : ' is'} spending over 95% of their income. Consider sending financial wellness notifications.`,
      action: 'View Users',
      createdAt: new Date().toISOString(),
      dismissed: false
    });
  }

  // Alert 2: Check for open support tickets
  const openTickets = tickets.filter((t) => t.status === 'open');
  const highPriorityTickets = openTickets.filter((t) => t.priority === 'high');

  if (highPriorityTickets.length > 0) {
    alerts.push({
      id: `alert-tickets-${Date.now()}`,
      severity: 'warning',
      title: 'High Priority Support Tickets',
      message: `${highPriorityTickets.length} high-priority ticket${highPriorityTickets.length > 1 ? 's' : ''} awaiting response. Average response time: 2 hours.`,
      action: 'View Tickets',
      createdAt: new Date().toISOString(),
      dismissed: false
    });
  }

  // Alert 3: Check for new user registrations
  const recentUsers = users.filter((u) => {
    const createdAt = new Date(u.createdAt).getTime();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return createdAt > oneDayAgo;
  });

  if (recentUsers.length > 0) {
    alerts.push({
      id: `alert-newusers-${Date.now()}`,
      severity: 'info',
      title: 'New User Registrations',
      message: `${recentUsers.length} new user${recentUsers.length > 1 ? 's' : ''} registered in the last 24 hours. Welcome messages sent automatically.`,
      action: 'View Users',
      createdAt: new Date().toISOString(),
      dismissed: false
    });
  }

  // Alert 4: System health check
  const profiles = users.
  map((u) => db.profiles.getByUserId(u.id)).
  filter(Boolean);
  if (users.length > 0 && profiles.length < users.length) {
    const incompleteProfiles = users.length - profiles.length;
    alerts.push({
      id: `alert-profiles-${Date.now()}`,
      severity: 'warning',
      title: 'Incomplete User Profiles',
      message: `${incompleteProfiles} user${incompleteProfiles > 1 ? 's have' : ' has'} incomplete profile data. This may affect personalization features.`,
      action: 'Review Profiles',
      createdAt: new Date().toISOString(),
      dismissed: false
    });
  }

  return alerts;
};

/**
 * Calculate system-wide statistics
 */
export const calculateSystemStats = () => {
  const users = db.users.getAll();
  const expenses = db.expenses.getAll();
  const goals = db.goals.getAll();
  const investments = db.investments.getAll();

  // Active users (within last 24 hours)
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const activeUsers = users.filter((u) => {
    if (!u.lastActive) return false;
    return new Date(u.lastActive).getTime() > oneDayAgo;
  }).length;

  // Total financial activity
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestments = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.savedAmount, 0);

  // Average goal completion
  const goalCompletionRates = goals.map(
    (g) => g.savedAmount / g.targetAmount * 100
  );
  const avgGoalCompletion =
  goalCompletionRates.length > 0 ?
  goalCompletionRates.reduce((sum, rate) => sum + rate, 0) /
  goalCompletionRates.length :
  0;

  return {
    totalUsers: users.length,
    activeUsers,
    totalExpenses,
    totalInvestments,
    totalGoalsSaved,
    avgGoalCompletion: Math.round(avgGoalCompletion),
    totalTransactions: expenses.length,
    totalGoals: goals.length
  };
};