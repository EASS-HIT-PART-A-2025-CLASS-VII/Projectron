"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface EmailVerificationConfirmProps {
  token: string | null;
}

export function EmailVerificationConfirm({
  token,
}: EmailVerificationConfirmProps) {
  const router = useRouter();
  const { verifyEmail, setUser, user } = useAuth();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [isAutoLoggedIn, setIsAutoLoggedIn] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage(
          "Verification token is missing. Please check your email link."
        );
        return;
      }

      try {
        console.log("Starting email verification...");

        // Call the verifyEmail function from auth context
        const result = await verifyEmail(token);
        console.log("Verification result:", result);

        setStatus("success");

        // Check if user was automatically logged in
        if (result.user) {
          console.log("User data received from verification:", result.user);
          setIsAutoLoggedIn(true);
          setUser(result.user); // Set user immediately from verification response
          setMessage(
            "Your email has been successfully verified and you've been automatically logged in!"
          );

          // Also try to fetch fresh user data to ensure everything is in sync
          setTimeout(async () => {
            try {
              const freshUser = await getCurrentUser();
              console.log("Fresh user data fetched:", freshUser);
              setUser(freshUser);
            } catch (error) {
              console.log(
                "Could not fetch fresh user data, but user is already set:",
                error
              );
              // Don't treat this as an error since we already have user data
            }
          }, 100);

          // Auto-redirect to projects page after 3 seconds
          setTimeout(() => {
            router.push("/projects");
          }, 3000);
        } else {
          setIsAutoLoggedIn(false);
          setMessage(
            "Your email has been successfully verified. You can now log in to your account."
          );
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "Email verification failed. The token may be invalid or expired."
        );
      }
    };

    verifyToken();
  }, [token, verifyEmail, router, setUser]);

  const handleContinue = () => {
    if (status === "success") {
      if (isAutoLoggedIn) {
        router.push("/projects");
      } else {
        router.push("/auth/login");
      }
    } else {
      router.push("/auth/verify-email");
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 bg-secondary-background border border-divider text-primary-text">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-primary-cta animate-spin" />
            <p className="text-secondary-text">
              Verifying your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <>
            <Alert className="border-primary-cta bg-secondary-background/50">
              <CheckCircle className="h-5 w-5 text-primary-cta" />
              <AlertTitle className="ml-2">Verification Successful</AlertTitle>
              <AlertDescription className="ml-2 text-secondary-text">
                {message}
              </AlertDescription>
            </Alert>

            {isAutoLoggedIn && user && (
              <div className="bg-hover-active/30 rounded-lg p-4 border border-primary-cta/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-cta/20 rounded-full flex items-center justify-center">
                    <span className="text-primary-cta font-semibold text-lg">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-primary-text">
                      Welcome, {user.full_name}!
                    </p>
                    <p className="text-sm text-secondary-text">{user.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-secondary-text">
                  <ArrowRight className="h-4 w-4 mr-2 text-primary-cta" />
                  Redirecting to your projects in 3 seconds...
                </div>
              </div>
            )}
          </>
        )}

        {status === "error" && (
          <Alert className="border-red-500 bg-secondary-background/50">
            <XCircle className="h-5 w-5 text-red-500" />
            <AlertTitle className="ml-2">Verification Failed</AlertTitle>
            <AlertDescription className="ml-2 text-secondary-text">
              {message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleContinue}
          className="w-full bg-primary-cta hover:bg-[#10C676] text-black"
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Verifying..."
            : status === "success"
            ? isAutoLoggedIn
              ? "Continue to Projects"
              : "Continue to Login"
            : "Go Back"}
        </Button>
      </CardFooter>
    </Card>
  );
}
