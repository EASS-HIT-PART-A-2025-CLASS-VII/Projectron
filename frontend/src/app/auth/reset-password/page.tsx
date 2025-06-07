"use client";

import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { apiClient } from "@/lib/api";

// Form validation schema
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Component that uses useSearchParams - must be wrapped in Suspense
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError(
        "Invalid or missing reset token. Please request a new password reset."
      );
    }
  }, [token]);

  // Initialize form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          new_password: values.password,
        },
      });

      setIsSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-900">
            <CheckCircle className="h-6 w-6 text-primary-cta" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-primary-text mb-2">
              Password reset successful
            </h2>
            <p className="text-secondary-text">
              Your password has been successfully reset. You can now sign in
              with your new password.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/auth/login">Sign in to your account</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  if (!token || error) {
    return (
      <AuthLayout>
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-900">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-primary-text mb-2">
              Invalid reset link
            </h2>
            <p className="text-secondary-text mb-4">
              {error || "This password reset link is invalid or has expired."}
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">Request new reset link</Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-text mb-2">
            Reset your password
          </h2>
          <p className="text-secondary-text">Enter your new password below.</p>
        </div>

        {/* Error alert */}
        {error && (
          <Alert
            variant="destructive"
            className="border-red-500/20 bg-red-500/10"
          >
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-text font-medium text-sm">
                    New password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="h-12 bg-primary-background border-border text-primary-text placeholder:text-disabled-text focus:border-primary-cta focus:ring-1 focus:ring-primary-cta/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-text font-medium text-sm">
                    Confirm new password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="h-12 bg-primary-background border-border text-primary-text placeholder:text-disabled-text focus:border-primary-cta focus:ring-1 focus:ring-primary-cta/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 bg-primary-cta hover:bg-cta-hover text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-primary-cta/25 hover:shadow-cta-hover/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </Form>

        {/* Additional help */}
        <div className="text-center">
          <p className="text-sm text-secondary-text">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-primary-cta hover:text-cta-hover font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

// Loading component for Suspense fallback
function ResetPasswordLoading() {
  return (
    <AuthLayout>
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary-cta mx-auto" />
        <p className="text-secondary-text">Loading...</p>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
