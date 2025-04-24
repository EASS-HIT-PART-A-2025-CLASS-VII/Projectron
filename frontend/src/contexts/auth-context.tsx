// src/contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  LoginCredentials, 
  RegisterCredentials,
  login as loginApi, 
  register as registerApi,
  getCurrentUser, 
  verifyEmail as verifyEmailApi,
  saveToken,
  getToken,
  removeToken,
  isAuthenticated as checkIsAuthenticated
} from '@/lib/auth';

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<void>;
  error: string | null;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (!checkIsAuthenticated()) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Token is invalid or expired
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the login utility with the correct credential format
      const authResponse = await loginApi({
        username: email, // Backend expects username field for email
        password
      });
      
      // Store JWT token
      saveToken(authResponse.access_token);
      
      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
      
      // Redirect to projects page
      router.push('/projects');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, full_name: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await registerApi({
        email,
        password,
        full_name
      });

      // Redirect to verification pending page
      router.push('/auth/verify-email?email=' + encodeURIComponent(email));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Registration error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    setUser(null);
    router.push('/auth/login');
  };

  // Email verification function
  const verifyEmail = useCallback( async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await verifyEmailApi(token);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Verification error:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }
  , []);

  // Resend verification email function
  const resendVerification = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would need to be implemented in the auth utilities
      // For now, we'll assume it exists
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};