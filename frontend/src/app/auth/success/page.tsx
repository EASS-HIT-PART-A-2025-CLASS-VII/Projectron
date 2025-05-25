// src/app/auth/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { handleOAuthSuccess } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // Handle OAuth token exchange and get user data
        const user = await handleOAuthSuccess();

        // Update auth context
        setUser(user);

        // Redirect to projects
        router.push("/projects");
      } catch (err) {
        console.error("OAuth success handling failed:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");

        // Redirect to login on error
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      }
    };

    handleSuccess();
  }, [router, setUser]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Authentication Error
          </h1>
          <p className="text-secondary-text mb-4">{error}</p>
          <p className="text-sm text-disabled-text">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-cta mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-primary-text mb-2">
          Completing Sign In
        </h1>
        <p className="text-secondary-text">
          Please wait while we finish setting up your account...
        </p>
      </div>
    </div>
  );
}
