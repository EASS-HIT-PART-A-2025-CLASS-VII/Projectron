"use client";

import { useSearchParams } from "next/navigation";
import { EmailVerificationConfirm } from "@/components/auth/email-verification-confirm";

export default function VerifyEmailConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-primary-background">
      <EmailVerificationConfirm token={token} />
    </div>
  );
}