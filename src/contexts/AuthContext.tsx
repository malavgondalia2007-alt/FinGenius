import React, { useEffect, useState, createContext } from 'react';
import { User } from '../types';
import { authService } from '../services/auth';
import { db } from '../services/database';
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isOnboardingComplete: boolean;
  refreshProfile: () => void;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: {children: ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const checkOnboardingStatus = (userId: string) => {
    const profile = db.profiles.getByUserId(userId);
    setIsOnboardingComplete(!!profile?.onboardingComplete);
  };
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        checkOnboardingStatus(currentUser.id);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);
  const login = async (email: string, password: string) => {
    const { user } = await authService.login(email, password);
    setUser(user);
    checkOnboardingStatus(user.id);
  };
  const signup = async (name: string, email: string, password: string) => {
    const { user } = await authService.signup(name, email, password);
    setUser(user);
    setIsOnboardingComplete(false); // New users always need onboarding
  };
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsOnboardingComplete(false);
  };
  const refreshProfile = () => {
    if (user) {
      checkOnboardingStatus(user.id);
    }
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAdmin: false,
        isOnboardingComplete,
        refreshProfile
      }}>

      {children}
    </AuthContext.Provider>);

}