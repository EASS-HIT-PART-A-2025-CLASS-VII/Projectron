// src/contexts/auth-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  login as loginApi,
  register as registerApi,
  loginWithGoogle as loginWithGoogleApi,
  registerWithGoogle as registerWithGoogleApi,
  loginWithGithub as loginWithGithubApi,
  registerWithGithub as registerWithGithubApi,
  getCurrentUser,
  verifyEmail as verifyEmailApi,
  logout as logoutApi,
  isAuthenticated as checkIsAuthenticated,
} from "@/lib/auth";

// Define auth context interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    full_name: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  registerWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<void>;
  error: string | null;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user data - this will fail if not authenticated
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.log("No valid authentication found");
        // Not authenticated - this is normal, not an error
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
      await loginApi({
        username: email, // Backend expects username field for email
        password,
      });

      // Fetch user data (cookie is now set automatically)
      const userData = await getCurrentUser();
      setUser(userData);

      // Redirect to projects page
      router.push("/projects");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Login error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login function
  const loginWithGoogle = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await loginWithGoogleApi();
      // Note: The redirect happens in the API function
      // The actual login completion happens in the OAuth callback
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Google login failed";
      setError(errorMessage);
      console.error("Google login error:", errorMessage);
      setIsLoading(false);
    }
  };

  // GitHub Login function
  const loginWithGithub = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await loginWithGithubApi();
      // Note: The redirect happens in the API function
      // The actual login completion happens in the OAuth callback
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "GitHub login failed";
      setError(errorMessage);
      console.error("GitHub login error:", errorMessage);
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    full_name: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerApi({
        email,
        password,
        full_name,
      });

      // Redirect to verification pending page
      router.push("/auth/verify-email?email=" + encodeURIComponent(email));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Registration error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Register function
  const registerWithGoogle = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await registerWithGoogleApi();
      // Note: The redirect happens in the API function
      // The actual registration completion happens in the OAuth callback
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Google signup failed";
      setError(errorMessage);
      console.error("Google signup error:", errorMessage);
      setIsLoading(false);
    }
  };

  // GitHub Register function
  const registerWithGithub = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await registerWithGithubApi();
      // Note: The redirect happens in the API function
      // The actual registration completion happens in the OAuth callback
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "GitHub signup failed";
      setError(errorMessage);
      console.error("GitHub signup error:", errorMessage);
      setIsLoading(false);
    }
  };

  // Logout function - now calls backend and clears state
  const logout = async () => {
    try {
      // Call backend logout to clear cookie
      await logoutApi();
    } catch (err) {
      console.warn("Backend logout failed:", err);
      // Continue with local logout even if backend fails
    } finally {
      // Clear local state
      setUser(null);
      router.push("/auth/login");
    }
  };

  // Email verification function
  const verifyEmail = useCallback(async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await verifyEmailApi(token);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Verification error:", errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resend verification email function
  const resendVerification = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Include cookies
          body: JSON.stringify({ email }),
        }
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to manually set authenticated state (for OAuth callbacks)
  const setIsAuthenticated = (authenticated: boolean) => {
    if (!authenticated) {
      setUser(null);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginWithGoogle,
    registerWithGoogle,
    loginWithGithub,
    registerWithGithub,
    logout,
    verifyEmail,
    resendVerification,
    error,
    setUser,
    setIsAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
