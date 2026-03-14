import { User, UserProfile, Expense, Income, Goal, Investment, AdminLog, SystemAlert } from '../types';

// API Configuration - browser-safe environment variable access
const getApiBaseUrl = (): string => {
  // Try import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_URL as string || 'http://localhost:8000';
  }

  // Try process.env (Create React App) - with safety check
  if (typeof process !== 'undefined' && process.env) {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000';
  }

  // Fallback to localhost
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('fingenius_token');
};

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {})
  : Promise<T> {
  const token = getAuthToken();

  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.
      json().
      catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Auth API
export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    const response = await apiCall<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });

    // Store tokens
    localStorage.setItem('fingenius_token', response.access_token);
    localStorage.setItem('fingenius_refresh_token', response.refresh_token);

    // Fetch user info
    const user = await authAPI.getCurrentUser();
    localStorage.setItem('fingenius_user', JSON.stringify(user));

    return { user, token: response.access_token };
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    // Store tokens
    localStorage.setItem('fingenius_token', response.access_token);
    localStorage.setItem('fingenius_refresh_token', response.refresh_token);

    // Fetch user info
    const user = await authAPI.getCurrentUser();
    localStorage.setItem('fingenius_user', JSON.stringify(user));

    return { user, token: response.access_token };
  },

  getCurrentUser: async (): Promise<User> => {
    return apiCall<User>('/auth/me');
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('fingenius_refresh_token');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await apiCall<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    localStorage.setItem('fingenius_token', response.access_token);
    localStorage.setItem('fingenius_refresh_token', response.refresh_token);

    return response.access_token;
  },

  logout: () => {
    localStorage.removeItem('fingenius_token');
    localStorage.removeItem('fingenius_refresh_token');
    localStorage.removeItem('fingenius_user');
  }
};

// Expenses API
export const expensesAPI = {
  getAll: async (): Promise<Expense[]> => {
    return apiCall<Expense[]>('/expenses/');
  },

  create: async (
    expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>)
    : Promise<Expense> => {
    return apiCall<Expense>('/expenses/', {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/expenses/${id}`, {
      method: 'DELETE'
    });
  }
};

// Income API
export const incomeAPI = {
  getAll: async (): Promise<Income[]> => {
    return apiCall<Income[]>('/income/');
  },

  create: async (
    income: Omit<Income, 'id' | 'userId' | 'createdAt'>)
    : Promise<Income> => {
    return apiCall<Income>('/income/', {
      method: 'POST',
      body: JSON.stringify(income)
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/income/${id}`, {
      method: 'DELETE'
    });
  }
};

// Goals API
export const goalsAPI = {
  getAll: async (): Promise<Goal[]> => {
    return apiCall<Goal[]>('/goals/');
  },

  create: async (
    goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>)
    : Promise<Goal> => {
    return apiCall<Goal>('/goals/', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
  },

  update: async (id: string, data: Partial<Goal>): Promise<Goal> => {
    return apiCall<Goal>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/goals/${id}`, {
      method: 'DELETE'
    });
  }
};

// Profiles API
export const profilesAPI = {
  get: async (): Promise<UserProfile> => {
    return apiCall<UserProfile>('/profiles/me');
  },

  create: async (
    profile: Omit<UserProfile, 'userId'>)
    : Promise<UserProfile> => {
    return apiCall<UserProfile>('/profiles/', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  },

  update: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiCall<UserProfile>('/profiles/me', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};

// Investments API
export const investmentsAPI = {
  getAll: async (): Promise<Investment[]> => {
    return apiCall<Investment[]>('/investments/');
  },

  create: async (
    investment: Omit<Investment, 'id' | 'userId' | 'createdAt'>)
    : Promise<Investment> => {
    return apiCall<Investment>('/investments/', {
      method: 'POST',
      body: JSON.stringify(investment)
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/investments/${id}`, {
      method: 'DELETE'
    });
  }
};

// Admin API
export const adminAPI = {
  getLogs: async (limit: number = 100): Promise<AdminLog[]> => {
    return apiCall<AdminLog[]>(`/admin/logs?limit=${limit}`);
  },

  createLog: async (log: AdminLog): Promise<AdminLog> => {
    return apiCall<AdminLog>('/admin/logs', {
      method: 'POST',
      body: JSON.stringify(log)
    });
  },

  getAlerts: async (): Promise<SystemAlert[]> => {
    return apiCall<SystemAlert[]>('/admin/alerts');
  },

  createAlert: async (alert: SystemAlert): Promise<SystemAlert> => {
    return apiCall<SystemAlert>('/admin/alerts', {
      method: 'POST',
      body: JSON.stringify(alert)
    });
  },

  dismissAlert: async (id: string): Promise<void> => {
    return apiCall<void>(`/admin/alerts/${id}/dismiss`, {
      method: 'PATCH'
    });
  }
};

// Combined API object for easy imports
export const api = {
  auth: authAPI,
  expenses: expensesAPI,
  income: incomeAPI,
  goals: goalsAPI,
  profiles: profilesAPI,
  investments: investmentsAPI,
  admin: adminAPI
};

// Stock Screener API (personalized recommendations)
export const screenerAPI = {
  getRecommendations: async (): Promise<{
    user_analysis: {
      monthly_savings_capacity: number;
      risk_profile: string;
      investment_horizon: string;
      recommended_allocation: Record<string, number>;
    };
    recommendations: Array<{
      symbol: string;
      name: string;
      sector: string;
      market_cap_category: string;
      current_price: number;
      pe_ratio: number;
      dividend_yield: number;
      eps_growth_1y: number;
      debt_to_equity: number;
      volatility: string;
      suitability_score: number;
      match_reason: string;
      risk_alignment: string;
      is_affordable: boolean;
    }>;
    timestamp: string;
  }> => {
    return apiCall('/screener/recommendations');
  }
};

export default api;