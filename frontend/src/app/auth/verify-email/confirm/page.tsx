// src/app/auth/verify-email/confirm/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmailVerificationConfirm } from "@/components/auth/email-verification-confirm";
import { Loader2 } from "lucide-react";

// Component that uses useSearchParams - must be wrapped in Suspense
function VerifyEmailConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <EmailVerificationConfirm token={token} />;
}

// Loading component for Suspense fallback
function VerifyEmailConfirmLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-cta mx-auto mb-4" />
        <p className="text-secondary-text">Loading verification...</p>
      </div>
    </div>
  );
}

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense fallback={<VerifyEmailConfirmLoading />}>
      <div className="flex items-center justify-center min-h-screen bg-primary-background">
        <VerifyEmailConfirmContent />
      </div>
    </Suspense>
  );
}
