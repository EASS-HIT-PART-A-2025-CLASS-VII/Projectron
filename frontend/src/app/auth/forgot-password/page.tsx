"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
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
import { ArrowLeft, CheckCircle, Loader2, Mail } from "lucide-react";
import { AuthLayout } from "@/components/layout/auth-layout";
import { apiClient } from "@/lib/api";

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: { email: values.email },
      });

      setIsSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset email. Please try again."
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
              Check your email
            </h2>
            <p className="text-secondary-text">
              If your email exists in our system, you will receive a password
              reset link shortly.
            </p>
          </div>

          <Alert className="bg-secondary-background border-divider">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-secondary-text">
              If you don't see the email in your inbox, please check your spam
              folder.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to Login</Link>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setError(null);
                form.reset();
              }}
              className="w-full"
            >
              Send to different email
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-secondary-text hover:text-primary-text"
        >
          <Link href="/auth/login">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </Button>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-text mb-2">
            Forgot your password?
          </h2>
          <p className="text-secondary-text">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-text font-medium text-sm">
                    Email address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      className="h-12 bg-primary-background border-border text-primary-text placeholder:text-disabled-text focus:border-primary-cta focus:ring-1 focus:ring-primary-cta/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      {...field}
                    />
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
                  Sending reset link...
                </>
              ) : (
                "Send reset link"
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
