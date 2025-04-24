"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface EmailVerificationConfirmProps {
  token: string | null;
}

export function EmailVerificationConfirm({ token }: EmailVerificationConfirmProps) {
  const router = useRouter();
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing. Please check your email link.");
        return;
      }

      try {
        // Call the verifyEmail function from auth context
        const success = await verifyEmail(token);
        
        if (success) {
          setStatus("success");
          setMessage("Your email has been successfully verified. You can now log in to your account.");
        } else {
          setStatus("error");
          setMessage("Email verification failed. The token may be invalid or expired.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again later.");
        console.error("Verification error:", err);
      }
    };

    verifyToken();
  }, [token, verifyEmail]);

  const handleContinue = () => {
    if (status === "success") {
      router.push("/auth/login");
    } else {
      router.push("/auth/verify-email");
    }
  };

  return (
    <Card className="w-full max-w-md mx-4 bg-secondary-background border border-divider text-primary-text">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Email Verification</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-primary-cta animate-spin" />
            <p className="text-secondary-text">Verifying your email address...</p>
          </div>
        )}

        {status === "success" && (
          <Alert className="border-primary-cta bg-secondary-background/50">
            <CheckCircle className="h-5 w-5 text-primary-cta" />
            <AlertTitle className="ml-2">Verification Successful</AlertTitle>
            <AlertDescription className="ml-2 text-secondary-text">
              {message}
            </AlertDescription>
          </Alert>
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
          className="w-full bg-primary-cta hover:bg-[#10C676] text-primary-text"
        >
          {status === "success" ? "Continue to Login" : "Go Back"}
        </Button>
      </CardFooter>
    </Card>
  );
}