import { User, UserProfile, Expense, Income, Goal } from "../types";

/* ================================
   API BASE URL (SIMPLE & SAFE)
================================ */

const BASE_URL = "https://your-backend.onrender.com"


/* ================================
   TOKEN HELPERS
================================ */

const getAuthToken = (): string | null => {
  return localStorage.getItem("fingenius_token");
};

/* ================================
   GENERIC API CALL
================================ */

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/* ================================
   AUTH API
================================ */

export const authAPI = {
  signup: async (name: string, email: string, password: string) => {
    const response = await apiCall<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    localStorage.setItem("fingenius_token", response.access_token);
    localStorage.setItem("fingenius_refresh_token", response.refresh_token);

    const user = await authAPI.getCurrentUser();
    localStorage.setItem("fingenius_user", JSON.stringify(user));

    return { user, token: response.access_token };
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("fingenius_token", response.access_token);
    localStorage.setItem("fingenius_refresh_token", response.refresh_token);

    const user = await authAPI.getCurrentUser();
    localStorage.setItem("fingenius_user", JSON.stringify(user));

    return { user, token: response.access_token };
  },

  getCurrentUser: async (): Promise<User> => {
    return apiCall<User>("/auth/me");
  },

  logout: () => {
    localStorage.removeItem("fingenius_token");
    localStorage.removeItem("fingenius_refresh_token");
    localStorage.removeItem("fingenius_user");
  },
};

/* ================================
   EXPENSES API
================================ */

export const expensesAPI = {
  getAll: async (): Promise<Expense[]> => {
    return apiCall<Expense[]>("/expenses/");
  },

  create: async (
    expense: Omit<Expense, "id" | "userId" | "createdAt">
  ): Promise<Expense> => {
    return apiCall<Expense>("/expenses/", {
      method: "POST",
      body: JSON.stringify(expense),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/expenses/${id}`, {
      method: "DELETE",
    });
  },
};

/* ================================
   INCOME API
================================ */

export const incomeAPI = {
  getAll: async (): Promise<Income[]> => {
    return apiCall<Income[]>("/income/");
  },

  create: async (
    income: Omit<Income, "id" | "userId" | "createdAt">
  ): Promise<Income> => {
    return apiCall<Income>("/income/", {
      method: "POST",
      body: JSON.stringify(income),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/income/${id}`, {
      method: "DELETE",
    });
  },
};

/* ================================
   GOALS API
================================ */

export const goalsAPI = {
  getAll: async (): Promise<Goal[]> => {
    return apiCall<Goal[]>("/goals/");
  },

  create: async (
    goal: Omit<Goal, "id" | "userId" | "createdAt">
  ): Promise<Goal> => {
    return apiCall<Goal>("/goals/", {
      method: "POST",
      body: JSON.stringify(goal),
    });
  },

  update: async (id: string, data: Partial<Goal>): Promise<Goal> => {
    return apiCall<Goal>(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiCall<void>(`/goals/${id}`, {
      method: "DELETE",
    });
  },
};

/* ================================
   PROFILES API
================================ */

export const profilesAPI = {
  get: async (): Promise<UserProfile> => {
    return apiCall<UserProfile>("/profiles/me");
  },

  create: async (
    profile: Omit<UserProfile, "userId">
  ): Promise<UserProfile> => {
    return apiCall<UserProfile>("/profiles/", {
      method: "POST",
      body: JSON.stringify(profile),
    });
  },

  update: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    return apiCall<UserProfile>("/profiles/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

/* ================================
   SIP API
================================ */

export const sipAPI = {
  getRecommendation: async () => {
    return apiCall<{
      user_type: string;
      monthly_money: number;
      recommended_sip: number;
      risk_level: string;
      message: string;
    }>("/sip/recommendation");
  },
};

/* ================================
   EXPORT COMBINED API
================================ */

export const api = {
  auth: authAPI,
  expenses: expensesAPI,
  income: incomeAPI,
  goals: goalsAPI,
  profiles: profilesAPI,
  sip: sipAPI, // 👈 THIS LINE IS IMPORTANT
};



export default api;
