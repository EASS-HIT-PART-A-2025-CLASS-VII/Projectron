// src/app/auth/verify-email/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { EmailVerification } from "@/components/auth/email-verification";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const email = searchParams.get("email") || undefined;

  return (
    <AuthLayout>
      <EmailVerification token={token} email={email} />
    </AuthLayout>
  );
}