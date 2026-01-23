import { User } from '../types';
import { api } from './api';
import { db, initDatabase } from './database';

// Initialize DB on load for fallback mode
initDatabase();

export const authService = {
  login: async (
  email: string,
  password: string)
  : Promise<{user: User;token: string;}> => {
    // Try API first
    try {
      return await api.auth.login(email, password);
    } catch (error) {
      // Fallback to localStorage if API fails
      console.warn('Backend unavailable, using localStorage mode');

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = db.users.findByEmail(email);

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Simple password check
      if (user.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Update last active timestamp
      db.users.updateLastActive(user.id);

      // Create a fake token
      const token = btoa(`${user.id}:${user.email}:${Date.now()}`);

      // Store session
      localStorage.setItem('fingenius_token', token);
      localStorage.setItem('fingenius_user', JSON.stringify(user));

      // Log activity
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'system',
        action: 'User Login',
        target: `User: ${user.email}`,
        status: 'success',
        details: `User ${user.name} logged in successfully`,
        timestamp: new Date().toISOString()
      });

      return { user, token };
    }
  },

  adminLogin: async (
  email: string,
  password: string)
  : Promise<{token: string;}> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Hardcoded admin credentials for demonstration
    if (email === 'admin@fingenius.com' && password === 'admin123') {
      const token = btoa(`admin:${email}:${Date.now()}`);
      localStorage.setItem('admin_token', token);

      // Log admin login
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'admin',
        action: 'Admin Login',
        target: 'Admin Panel',
        status: 'success',
        details: 'Admin user logged in to control center',
        timestamp: new Date().toISOString()
      });

      return { token };
    }

    // Log failed login attempt
    db.admin.logActivity({
      id: crypto.randomUUID(),
      adminId: 'system',
      action: 'Failed Admin Login',
      target: `Email: ${email}`,
      status: 'error',
      details: 'Invalid admin credentials provided',
      timestamp: new Date().toISOString()
    });

    throw new Error('Invalid admin credentials');
  },

  signup: async (
  name: string,
  email: string,
  password: string)
  : Promise<{user: User;token: string;}> => {
    // Try API first
    try {
      return await api.auth.signup(name, email, password);
    } catch (error) {
      // Fallback to localStorage if API fails
      console.warn('Backend unavailable, using localStorage mode');

      await new Promise((resolve) => setTimeout(resolve, 500));

      const existingUser = db.users.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        password, // In real app, hash this
        role: 'user',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      db.users.create(newUser);

      // Create session
      const token = btoa(`${newUser.id}:${newUser.email}:${Date.now()}`);
      localStorage.setItem('fingenius_token', token);
      localStorage.setItem('fingenius_user', JSON.stringify(newUser));

      return { user: newUser, token };
    }
  },

  logout: () => {
    const user = authService.getCurrentUser();
    if (user) {
      db.admin.logActivity({
        id: crypto.randomUUID(),
        adminId: 'system',
        action: 'User Logout',
        target: `User: ${user.email}`,
        status: 'success',
        details: `User ${user.name} logged out`,
        timestamp: new Date().toISOString()
      });
    }
    api.auth.logout();
  },

  adminLogout: () => {
    db.admin.logActivity({
      id: crypto.randomUUID(),
      adminId: 'admin',
      action: 'Admin Logout',
      target: 'Admin Panel',
      status: 'success',
      details: 'Admin user logged out from control center',
      timestamp: new Date().toISOString()
    });
    localStorage.removeItem('admin_token');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('fingenius_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('fingenius_token');
  },

  isAdminAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_token');
  },

  refreshToken: async (): Promise<string> => {
    try {
      return await api.auth.refreshToken();
    } catch (error) {
      // If refresh fails, logout
      authService.logout();
      throw error;
    }
  }
};