// src/components/layout/app-layout.tsx
"use client";

import { useAuth } from "@/contexts/auth-context";
import { Navbar } from "./main-nav";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingScreen from "../ui/loading-screen";
import { Toaster } from "../ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isAuthenticated && !isLoading) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Don't render the content until authentication is confirmed
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-primary-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
          <Toaster />
        </div>
      </main>
      <footer className="bg-secondary-background border-t border-divider py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-secondary-text">
            &copy; {new Date().getFullYear()} Projectron. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
