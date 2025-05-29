// src/app/auth/verify-email/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { EmailVerification } from "@/components/auth/email-verification";
import { Skeleton } from "@/components/ui/skeleton";

// Component that uses useSearchParams - must be wrapped in Suspense
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const email = searchParams.get("email") || undefined;

  return <EmailVerification token={token} email={email} />;
}

// Loading component for Suspense fallback
function VerifyEmailLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-12 rounded-full mx-auto" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<VerifyEmailLoading />}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
