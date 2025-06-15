"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromCognito() {
      try {
        const { user } = await getCurrentUser();
        if (user) {
          console.log('User from Cognito:', user);
          setUser(user);
        }
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserFromCognito();
  }, []);

  const value = {
    isAuthenticated: !!user,
    isLoading,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}