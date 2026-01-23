import React, { useEffect, useState, createContext, useContext } from 'react';
import { authService } from '../services/auth';
interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
  isLoading: boolean;
}
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);
export function AdminAuthProvider({ children }: {children: React.ReactNode;}) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check if admin is already logged in
    const isAuth = authService.isAdminAuthenticated();
    setIsAdminAuthenticated(isAuth);
    setIsLoading(false);
  }, []);
  const adminLogin = async (
  email: string,
  password: string)
  : Promise<boolean> => {
    try {
      await authService.adminLogin(email, password);
      setIsAdminAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };
  const adminLogout = () => {
    authService.adminLogout();
    setIsAdminAuthenticated(false);
  };
  return (
    <AdminAuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        isLoading
      }}>

      {children}
    </AdminAuthContext.Provider>);

}
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}