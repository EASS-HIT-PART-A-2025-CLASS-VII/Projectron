// src/components/auth/email-verification.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Mail, Loader2 } from "lucide-react";

interface EmailVerificationProps {
  token?: string;
  email?: string;
}

export function EmailVerification({
  token,
  email: initialEmail,
}: EmailVerificationProps) {
  const [email, setEmail] = useState<string | null>(initialEmail || null);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error" | "loading"
  >(token ? "loading" : "pending");
  const { verifyEmail, resendVerification, error } = useAuth();

  // Check URL for email parameter if not provided via props
  useEffect(() => {
    if (!email) {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [email]);

  // Verify email if token is provided
  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const result = await verifyEmail(token);
          setVerificationStatus(result ? "success" : "error");
        } catch (err) {
          setVerificationStatus("error");
        }
      }
    };

    if (token && verificationStatus === "loading") {
      verify();
    }
  }, [token, verificationStatus, verifyEmail]);

  // Handle resend verification
  const handleResendVerification = async () => {
    if (email) {
      console.log(email);
      try {
        setVerificationStatus("loading");
        await resendVerification(email);
        setVerificationStatus("pending");
      } catch (error) {
        setVerificationStatus("error");
      }
    }
  };

  // Content based on verification status
  const renderContent = () => {
    switch (verificationStatus) {
      case "loading":
        return (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-background">
              <Loader2 className="h-6 w-6 text-primary-cta animate-spin" />
            </div>
            <h2 className="mt-3 text-h3 font-semibold text-primary-text text-center">
              Verifying your email
            </h2>
            <p className="mt-2 text-secondary-text text-center">
              Please wait while we verify your email address...
            </p>
          </>
        );
      case "success":
        return (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-900">
              <Check className="h-6 w-6 text-primary-cta" />
            </div>
            <h2 className="mt-3 text-h3 font-semibold text-primary-text text-center">
              Email verified!
            </h2>
            <p className="mt-2 text-secondary-text text-center">
              Your email has been successfully verified. You can now log in to
              your account.
            </p>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href="/auth/login">Log in to your account</Link>
              </Button>
            </div>
          </>
        );
      case "error":
        return (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900">
              <X className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="mt-3 text-h3 font-semibold text-primary-text text-center">
              Verification failed
            </h2>
            <p className="mt-2 text-secondary-text text-center">
              {error ||
                "We couldn't verify your email. The link may have expired or is invalid."}
            </p>
            <div className="mt-6 space-y-4">
              {email && (
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full"
                >
                  Resend verification email
                </Button>
              )}
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to login</Link>
              </Button>
            </div>
          </>
        );
      case "pending":
      default:
        return (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-background">
              <Mail className="h-6 w-6 text-primary-cta" />
            </div>
            <h2 className="mt-3 text-h3 font-semibold text-primary-text text-center">
              Verify your email
            </h2>
            <p className="mt-2 text-secondary-text text-center">
              {email
                ? `We've sent a verification email to ${email}. Please check your inbox and follow the link to verify your account.`
                : "Please check your email for a verification link to complete your registration."}
            </p>
            <Alert className="mt-6 bg-secondary-background border-divider">
              <AlertDescription>
                If you don't see the email in your inbox, please check your spam
                folder.
              </AlertDescription>
            </Alert>
            <div className="mt-6 space-y-4">
              {email && (
                <Button
                  onClick={handleResendVerification}
                  variant="outline"
                  className="w-full"
                >
                  Resend verification email
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Back to login</Link>
              </Button>
            </div>
          </>
        );
    }
  };

  return <div className="py-4">{renderContent()}</div>;
}
