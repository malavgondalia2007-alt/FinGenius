import {
  User,
  UserProfile,
  Expense,
  Income,
  Goal,
  Investment,
  AdminLog,
  SupportTicket,
  SystemAlert,
  SIPCalculation
} from
  '../types';
import { api } from './api';

const DB_KEYS = {
  USERS: 'fingenius_users',
  PROFILES: 'fingenius_profiles',
  EXPENSES: 'fingenius_expenses',
  INCOME: 'fingenius_income',
  GOALS: 'fingenius_goals',
  INVESTMENTS: 'fingenius_investments',
  SUPPORT_TICKETS: 'fingenius_support_tickets',
  ADMIN_LOGS: 'fingenius_admin_logs',
  SYSTEM_ALERTS: 'fingenius_system_alerts',
  SIP_HISTORY: 'fingenius_sip_history'
};

// Helper to get data
const get = <T,>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Helper to set data
const set = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize with seed data if empty
export const initDatabase = () => {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    const users: User[] = [
      {
        id: 'u1',
        email: 'haed@example.com',
        password: 'P@ssword123', // Updated to meet validation requirements
        name: 'haed',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      }];

    set(DB_KEYS.USERS, users);

    const profiles: UserProfile[] = [
      {
        userId: 'u1',
        age: 24,
        type: 'employee',
        onboardingComplete: true,
        monthlyIncome: 85000,
        fixedExpenses: {
          rent: 25000,
          groceries: 8000,
          utilities: 3000
        },
        loans: {
          homeLoan: 0,
          carLoan: 5000,
          personalLoan: 0,
          educationLoan: 0
        },
        sipCommitments: 10000,
        savingsPreference: 35
      }];

    set(DB_KEYS.PROFILES, profiles);

    const expenses: Expense[] = [
      {
        id: 'e1',
        userId: 'u1',
        amount: 12000,
        category: 'Housing',
        date: '2026-01-01',
        type: 'essential',
        description: 'Rent partial',
        createdAt: new Date().toISOString()
      },
      {
        id: 'e2',
        userId: 'u1',
        amount: 8000,
        category: 'Food',
        date: '2026-01-03',
        type: 'essential',
        description: 'Groceries',
        createdAt: new Date().toISOString()
      },
      {
        id: 'e3',
        userId: 'u1',
        amount: 5000,
        category: 'Transport',
        date: '2026-01-05',
        type: 'essential',
        description: 'Fuel & Metro',
        createdAt: new Date().toISOString()
      },
      {
        id: 'e4',
        userId: 'u1',
        amount: 7500,
        category: 'Entertainment',
        date: '2026-01-06',
        type: 'non-essential',
        description: 'Weekend trip',
        createdAt: new Date().toISOString()
      }];

    set(DB_KEYS.EXPENSES, expenses);

    const income: Income[] = [
      {
        id: 'inc1',
        userId: 'u1',
        amount: 5000,
        source: 'Freelance Project',
        date: '2026-01-10',
        description: 'Web design work',
        createdAt: new Date().toISOString()
      }];

    set(DB_KEYS.INCOME, income);

    const goals: Goal[] = [
      {
        id: 'g1',
        userId: 'u1',
        name: 'Emergency Fund',
        targetAmount: 100000,
        savedAmount: 45000,
        deadline: '2026-06-01',
        category: 'Savings',
        createdAt: new Date().toISOString()
      },
      {
        id: 'g2',
        userId: 'u1',
        name: 'Vacation',
        targetAmount: 50000,
        savedAmount: 12000,
        deadline: '2026-12-01',
        category: 'Travel',
        createdAt: new Date().toISOString()
      }];

    set(DB_KEYS.GOALS, goals);

    const investments: Investment[] = [
      {
        id: 'i1',
        userId: 'u1',
        fundName: 'HDFC Mid-Cap Opportunities',
        amount: 50000,
        type: 'sip',
        date: '2025-06-15',
        returns: 18.5,
        risk: 'High',
        createdAt: new Date().toISOString()
      },
      {
        id: 'i2',
        userId: 'u1',
        fundName: 'SBI Blue Chip Fund',
        amount: 75000,
        type: 'stock',
        date: '2025-08-20',
        returns: 14.2,
        risk: 'Moderate',
        createdAt: new Date().toISOString()
      }];

    set(DB_KEYS.INVESTMENTS, investments);

    // Seed some support tickets
    if (!localStorage.getItem(DB_KEYS.SUPPORT_TICKETS)) {
      const tickets: SupportTicket[] = [
        {
          id: 't1',
          userId: 'u1',
          userName: 'haed',
          userEmail: 'haed@example.com',
          subject: 'Question about investment risks',
          message:
            'I am new to investing and wanted to understand how the risk levels are calculated for the funds shown.',
          status: 'open',
          priority: 'medium',
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 't2',
          userId: 'u1',
          userName: 'haed',
          userEmail: 'haed@example.com',
          subject: 'Cannot update profile',
          message:
            'I tried to change my income but the save button is disabled.',
          status: 'resolved',
          priority: 'high',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          adminResponse: 'This was a temporary glitch. Please try again now.',
          respondedAt: new Date(Date.now() - 86400000).toISOString(),
          respondedBy: 'Admin User'
        }];

      set(DB_KEYS.SUPPORT_TICKETS, tickets);
    }

    // Initialize admin logs
    if (!localStorage.getItem(DB_KEYS.ADMIN_LOGS)) {
      const logs: AdminLog[] = [
        {
          id: 'log1',
          adminId: 'admin',
          action: 'Login',
          target: 'System',
          status: 'success',
          details: 'Admin logged in successfully',
          timestamp: new Date(Date.now() - 300000).toISOString() // 5 min ago
        }];

      set(DB_KEYS.ADMIN_LOGS, logs);
    }

    // Initialize system alerts
    if (!localStorage.getItem(DB_KEYS.SYSTEM_ALERTS)) {
      set(DB_KEYS.SYSTEM_ALERTS, []);
    }
  } else {
    // Ensure demo user credentials are always correct (fixes stale localStorage)
    const users = get<User>(DB_KEYS.USERS);
    const demoUser = users.find((u) => u.email === 'haed@example.com');
    if (demoUser && demoUser.password !== 'P@ssword123') {
      demoUser.password = 'P@ssword123';
      set(DB_KEYS.USERS, users);
    }
    // If demo user was deleted, re-create it
    if (!demoUser) {
      users.push({
        id: 'u1',
        email: 'haed@example.com',
        password: 'P@ssword123',
        name: 'haed',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      });
      set(DB_KEYS.USERS, users);
    }
  }
};

export const db = {
  users: {
    getAll: () => get<User>(DB_KEYS.USERS),
    findByEmail: (email: string) =>
      get<User>(DB_KEYS.USERS).find((u) => u.email === email),
    create: (user: User) => {
      const users = get<User>(DB_KEYS.USERS);
      users.push(user);
      set(DB_KEYS.USERS, users);

      // Log activity
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'system',
        action: 'User Registration',
        target: `User: ${user.email}`,
        status: 'success',
        details: `New user registered: ${user.name}`,
        timestamp: new Date().toISOString()
      });

      return user;
    },
    updateLastActive: (userId: string) => {
      const users = get<User>(DB_KEYS.USERS);
      const index = users.findIndex((u) => u.id === userId);
      if (index !== -1) {
        users[index].lastActive = new Date().toISOString();
        set(DB_KEYS.USERS, users);
      }
    },
    delete: (userId: string) => {
      // Delete user
      const users = get<User>(DB_KEYS.USERS).filter((u) => u.id !== userId);
      set(DB_KEYS.USERS, users);

      // Delete associated profile
      const profiles = get<UserProfile>(DB_KEYS.PROFILES).filter(
        (p) => p.userId !== userId
      );
      set(DB_KEYS.PROFILES, profiles);

      // Delete associated expenses
      const expenses = get<Expense>(DB_KEYS.EXPENSES).filter(
        (e) => e.userId !== userId
      );
      set(DB_KEYS.EXPENSES, expenses);

      // Delete associated income
      const income = get<Income>(DB_KEYS.INCOME).filter(
        (i) => i.userId !== userId
      );
      set(DB_KEYS.INCOME, income);

      // Delete associated goals
      const goals = get<Goal>(DB_KEYS.GOALS).filter((g) => g.userId !== userId);
      set(DB_KEYS.GOALS, goals);

      // Delete associated investments
      const investments = get<Investment>(DB_KEYS.INVESTMENTS).filter(
        (i) => i.userId !== userId
      );
      set(DB_KEYS.INVESTMENTS, investments);

      // Delete associated support tickets
      const tickets = get<SupportTicket>(DB_KEYS.SUPPORT_TICKETS).filter(
        (t) => t.userId !== userId
      );
      set(DB_KEYS.SUPPORT_TICKETS, tickets);

      // Log activity
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'admin',
        action: 'Delete User',
        target: `User ID: ${userId}`,
        status: 'success',
        details: 'User and all associated data deleted',
        timestamp: new Date().toISOString()
      });
    }
  },
  profiles: {
    getByUserId: (userId: string) =>
      get<UserProfile>(DB_KEYS.PROFILES).find((p) => p.userId === userId),
    create: (profile: UserProfile) => {
      const profiles = get<UserProfile>(DB_KEYS.PROFILES);
      const existingIndex = profiles.findIndex(
        (p) => p.userId === profile.userId
      );
      if (existingIndex >= 0) {
        profiles[existingIndex] = profile;
      } else {
        profiles.push(profile);
      }
      set(DB_KEYS.PROFILES, profiles);
      return profile;
    },
    update: (userId: string, data: Partial<UserProfile>) => {
      const profiles = get<UserProfile>(DB_KEYS.PROFILES);
      const index = profiles.findIndex((p) => p.userId === userId);
      if (index !== -1) {
        profiles[index] = { ...profiles[index], ...data };
        set(DB_KEYS.PROFILES, profiles);
        return profiles[index];
      }
      return null;
    },
    sync: (backendProfile: UserProfile) => {
      const profiles = get<UserProfile>(DB_KEYS.PROFILES);
      const existingIndex = profiles.findIndex(
        (p) => p.userId === backendProfile.userId
      );
      if (existingIndex >= 0) {
        profiles[existingIndex] = backendProfile;
      } else {
        profiles.push(backendProfile);
      }
      set(DB_KEYS.PROFILES, profiles);
    }
  },
  expenses: {
    getAll: () => get<Expense>(DB_KEYS.EXPENSES),
    getByUserId: (userId: string) =>
      get<Expense>(DB_KEYS.EXPENSES).filter((e) => e.userId === userId),
    create: (expense: Expense) => {
      const expenses = get<Expense>(DB_KEYS.EXPENSES);
      expenses.push(expense);
      set(DB_KEYS.EXPENSES, expenses);

      // Async push to PostgreSQL
      api.expenses.create(expense).catch(err => {
        console.error('Failed to sync expense to PostgreSQL:', err);
      });

      // Log activity
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'system',
        action: 'Expense Added',
        target: `User: ${expense.userId}`,
        status: 'success',
        details: `Expense of ₹${expense.amount} added in ${expense.category}`,
        timestamp: new Date().toISOString()
      });

      return expense;
    },
    delete: (id: string) => {
      const expenses = get<Expense>(DB_KEYS.EXPENSES);
      const filtered = expenses.filter((e) => e.id !== id);
      set(DB_KEYS.EXPENSES, filtered);

      // Async push to PostgreSQL
      api.expenses.delete(id).catch(() => { });
    },
    sync: (backendExpenses: Expense[]) => {
      set(DB_KEYS.EXPENSES, backendExpenses);
    }
  },
  income: {
    getAll: () => get<Income>(DB_KEYS.INCOME),
    getByUserId: (userId: string) =>
      get<Income>(DB_KEYS.INCOME).filter((i) => i.userId === userId),
    create: (income: Income) => {
      const incomes = get<Income>(DB_KEYS.INCOME);
      incomes.push(income);
      set(DB_KEYS.INCOME, incomes);

      // Async push to PostgreSQL
      api.income.create(income).catch(() => { });

      return income;
    },
    delete: (id: string) => {
      const incomes = get<Income>(DB_KEYS.INCOME);
      const filtered = incomes.filter((i) => i.id !== id);
      set(DB_KEYS.INCOME, filtered);

      // Async push to PostgreSQL
      api.income.delete(id).catch(() => { });
    },
    sync: (backendIncome: Income[]) => {
      set(DB_KEYS.INCOME, backendIncome);
    }
  },
  goals: {
    getAll: () => get<Goal>(DB_KEYS.GOALS),
    getByUserId: (userId: string) =>
      get<Goal>(DB_KEYS.GOALS).filter((g) => g.userId === userId),
    create: (goal: Goal) => {
      const goals = get<Goal>(DB_KEYS.GOALS);
      goals.push(goal);
      set(DB_KEYS.GOALS, goals);

      // Async push to PostgreSQL
      api.goals.create(goal).catch(() => { });

      // Log activity
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'system',
        action: 'Goal Created',
        target: `User: ${goal.userId}`,
        status: 'success',
        details: `New goal created: ${goal.name} (₹${goal.targetAmount})`,
        timestamp: new Date().toISOString()
      });

      return goal;
    },
    update: (id: string, data: Partial<Goal>) => {
      const goals = get<Goal>(DB_KEYS.GOALS);
      const index = goals.findIndex((g) => g.id === id);
      if (index !== -1) {
        goals[index] = { ...goals[index], ...data };
        set(DB_KEYS.GOALS, goals);

        // Async push to PostgreSQL
        api.goals.update(id, data).catch(() => { });

        return goals[index];
      }
      return null;
    },
    delete: (id: string) => {
      const goals = get<Goal>(DB_KEYS.GOALS);
      const filtered = goals.filter((g) => g.id !== id);
      set(DB_KEYS.GOALS, filtered);

      // Async push to PostgreSQL
      api.goals.delete(id).catch(() => { });
    },
    sync: (backendGoals: Goal[]) => {
      set(DB_KEYS.GOALS, backendGoals);
    }
  },
  investments: {
    getAll: () => get<Investment>(DB_KEYS.INVESTMENTS),
    getByUserId: (userId: string) =>
      get<Investment>(DB_KEYS.INVESTMENTS).filter((i) => i.userId === userId),
    create: (investment: Investment) => {
      const investments = get<Investment>(DB_KEYS.INVESTMENTS);
      investments.push(investment);
      set(DB_KEYS.INVESTMENTS, investments);

      // Async push to PostgreSQL
      api.investments.create(investment).catch(() => { });

      return investment;
    },
    delete: (id: string) => {
      const investments = get<Investment>(DB_KEYS.INVESTMENTS);
      const filtered = investments.filter((i) => i.id !== id);
      set(DB_KEYS.INVESTMENTS, filtered);

      // Async push to PostgreSQL
      api.investments.delete(id).catch(() => { });
    },
    sync: (backendInvestments: Investment[]) => {
      set(DB_KEYS.INVESTMENTS, backendInvestments);
    }
  },
  support: {
    getAll: () => get<SupportTicket>(DB_KEYS.SUPPORT_TICKETS),
    getByUserId: (userId: string) =>
      get<SupportTicket>(DB_KEYS.SUPPORT_TICKETS).filter(
        (t) => t.userId === userId
      ),
    create: (ticket: SupportTicket) => {
      const tickets = get<SupportTicket>(DB_KEYS.SUPPORT_TICKETS);
      tickets.unshift(ticket); // Add to beginning
      set(DB_KEYS.SUPPORT_TICKETS, tickets);

      // Log activity
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'system',
        action: 'Support Ticket Created',
        target: `Ticket: ${ticket.subject}`,
        status: 'success',
        details: `New ${ticket.priority} priority ticket from ${ticket.userName}`,
        timestamp: new Date().toISOString()
      });

      return ticket;
    },
    update: (id: string, data: Partial<SupportTicket>) => {
      const tickets = get<SupportTicket>(DB_KEYS.SUPPORT_TICKETS);
      const index = tickets.findIndex((t) => t.id === id);
      if (index !== -1) {
        tickets[index] = { ...tickets[index], ...data };
        set(DB_KEYS.SUPPORT_TICKETS, tickets);
        return tickets[index];
      }
      return null;
    }
  },
  admin: {
    logActivity: (log: AdminLog) => {
      const logs = get<AdminLog>(DB_KEYS.ADMIN_LOGS);
      logs.unshift(log); // Add to beginning
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(1000);
      }
      set(DB_KEYS.ADMIN_LOGS, logs);

      // Also push to PostgreSQL
      api.admin.createLog(log).catch(() => { });
    },
    getActivityLogs: (limit?: number) => {
      const logs = get<AdminLog>(DB_KEYS.ADMIN_LOGS);
      return limit ? logs.slice(0, limit) : logs;
    },
    getAlerts: () => {
      return get<SystemAlert>(DB_KEYS.SYSTEM_ALERTS).filter((a) => !a.dismissed);
    },
    createAlert: (alert: SystemAlert) => {
      const alerts = get<SystemAlert>(DB_KEYS.SYSTEM_ALERTS);
      alerts.unshift(alert);
      set(DB_KEYS.SYSTEM_ALERTS, alerts);

      // Also push to PostgreSQL
      api.admin.createAlert(alert).catch(() => { });
    },
    dismissAlert: (id: string) => {
      const alerts = get<SystemAlert>(DB_KEYS.SYSTEM_ALERTS);
      const index = alerts.findIndex((a) => a.id === id);
      if (index !== -1) {
        alerts[index].dismissed = true;
        set(DB_KEYS.SYSTEM_ALERTS, alerts);

        // Also update PostgreSQL
        api.admin.dismissAlert(id).catch(() => { });
      }
    }
  },
  sipHistory: {
    getByUserId: (userId: string) =>
      get<SIPCalculation>(DB_KEYS.SIP_HISTORY).filter(
        (s) => s.userId === userId
      ),
    create: (calculation: SIPCalculation) => {
      const history = get<SIPCalculation>(DB_KEYS.SIP_HISTORY);
      history.unshift(calculation); // Add to beginning (newest first)
      // Keep only last 50 calculations per user
      const userHistory = history.filter((h) => h.userId === calculation.userId);
      if (userHistory.length > 50) {
        const toRemove = userHistory.slice(50);
        toRemove.forEach((item) => {
          const idx = history.findIndex((h) => h.id === item.id);
          if (idx !== -1) history.splice(idx, 1);
        });
      }
      set(DB_KEYS.SIP_HISTORY, history);
      return calculation;
    },
    delete: (id: string) => {
      const history = get<SIPCalculation>(DB_KEYS.SIP_HISTORY);
      const filtered = history.filter((h) => h.id !== id);
      set(DB_KEYS.SIP_HISTORY, filtered);
    },
    clearByUserId: (userId: string) => {
      const history = get<SIPCalculation>(DB_KEYS.SIP_HISTORY);
      const filtered = history.filter((h) => h.userId !== userId);
      set(DB_KEYS.SIP_HISTORY, filtered);
    }
  }
};