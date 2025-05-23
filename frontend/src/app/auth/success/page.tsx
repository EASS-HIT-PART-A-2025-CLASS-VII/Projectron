// app/auth/success/page.tsx (or pages/auth/success.tsx)

"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { saveToken, getCurrentUser } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleToken = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        router.push("/auth/login?error=oauth_failed");
        return;
      }

      if (token) {
        try {
          // Save token
          saveToken(token);

          // Get user data
          const userData = await getCurrentUser();
          setUser(userData);

          // Redirect to projects (same as regular login)
          router.push("/projects");
        } catch (error) {
          console.error("OAuth completion failed:", error);
          router.push("/auth/login?error=auth_failed");
        }
      } else {
        router.push("/auth/login");
      }
    };

    handleToken();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-cta" />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
