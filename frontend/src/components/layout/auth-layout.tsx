// src/components/layout/auth-layout.tsx
"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import LoadingScreen from "../ui/loading-screen";
import Logo from "../../../public/logo.svg";
interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to projects if already authenticated and not loading
    if (isAuthenticated && !isLoading) {
      router.push("/projects");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Don't render the content if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-primary-background">
      <Link href="/" className="flex items-center justify-center">
        <Logo className="h-14 md:h-20 mt-4 m-auto" />
      </Link>
      <div className="flex flex-1 flex-col justify-center px-6 pt-2 pb-10 lg:px-8">
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-secondary-background py-8 px-6 shadow-lg rounded-lg sm:px-10 border border-divider">
            {children}
          </div>
        </div>
      </div>
      <footer className="border-t border-divider py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-secondary-text">
            &copy; {new Date().getFullYear()} Projectron. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
