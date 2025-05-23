"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
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
import { Loader2 } from "lucide-react";

// Form validation schema
const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
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

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register, registerWithGoogle, registerWithGithub, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  // Initialize form
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await register(values.email, values.password, values.full_name);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth handler
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      await registerWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // GitHub OAuth handler
  const handleGithubSignup = async () => {
    setIsGithubLoading(true);
    try {
      await registerWithGithub();
    } finally {
      setIsGithubLoading(false);
    }
  };

  const isAnyOAuthLoading = isGoogleLoading || isGithubLoading;

  return (
    <div className="relative max-w-md mx-auto">
      <div className="relative bg-secondary-background rounded-2xl p-4 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2.5rem font-bold text-primary-text tracking-tight leading-tight">
            Create your account
          </h2>
          <p className="text-secondary-text mt-2 text-sm">
            Start planning your first project for free
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-transparent border-border text-primary-text hover:bg-hover-active hover:border-primary-cta transition-all duration-200 font-medium"
            onClick={handleGoogleSignup}
            disabled={isAnyOAuthLoading || isSubmitting}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary-cta" />
            ) : (
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          {/* GitHub OAuth Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-transparent border-border text-primary-text hover:bg-hover-active hover:border-primary-cta transition-all duration-200 font-medium"
            onClick={handleGithubSignup}
            disabled={isAnyOAuthLoading || isSubmitting}
          >
            {isGithubLoading ? (
              <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary-cta" />
            ) : (
              <svg
                className="mr-3 h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            )}
            Continue with GitHub
          </Button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-secondary-background text-secondary-text">
              or create with email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary-text font-medium text-sm">
                    Full name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      autoComplete="name"
                      disabled={isSubmitting || isAnyOAuthLoading}
                      className="h-12 bg-primary-background border-border text-primary-text placeholder:text-disabled-text focus:border-primary-cta focus:ring-1 focus:ring-primary-cta/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

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
                      disabled={isSubmitting || isAnyOAuthLoading}
                      className="h-12 bg-primary-background border-border text-primary-text placeholder:text-disabled-text focus:border-primary-cta focus:ring-1 focus:ring-primary-cta/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1  gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-text font-medium text-sm">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                        disabled={isSubmitting || isAnyOAuthLoading}
                        className="h-12 bg-primary-background border-border text-primary-text placeholder:text-disabled-text focus:border-primary-cta focus:ring-1 focus:ring-primary-cta/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        {...field}
                      />
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
                      Confirm password
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        autoComplete="new-password"
                        disabled={isSubmitting || isAnyOAuthLoading}
                        className="h-12 bg-primary-background border-border text-primary-text placeholder:text-disabled-text focus:border-primary-cta focus:ring-1 focus:ring-primary-cta/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex w-full h-2"></div>
            <Button
              type="submit"
              className="w-full h-12 bg-primary-cta hover:bg-cta-hover text-white font-medium rounded-lg transition-all duration-200 hover:shadow-cta-hover/30"
              disabled={isSubmitting || isAnyOAuthLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-sm text-secondary-text">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary-cta hover:text-cta-hover font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center">
          <p className="text-xs text-secondary-text">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="text-secondary-text hover:text-primary-text underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-secondary-text hover:text-primary-text underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
