// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LandingLayout } from "@/components/layout/landing-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MessageSquare,
  Bug,
  Lightbulb,
  HelpCircle,
  CheckCircle,
  Loader2,
  Send,
} from "lucide-react";
import { apiClient } from "@/lib/api";

// Form validation schema
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  type: z.enum(["feature", "bug", "question", "other"], {
    required_error: "Please select an inquiry type",
  }),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const inquiryTypes = [
  {
    value: "feature",
    label: "Feature Request",
    icon: Lightbulb,
    color: "text-blue-400",
    description: "Suggest a new feature or improvement",
  },
  {
    value: "bug",
    label: "Bug Report",
    icon: Bug,
    color: "text-red-400",
    description: "Report an issue or bug you've encountered",
  },
  {
    value: "question",
    label: "General Question",
    icon: HelpCircle,
    color: "text-green-400",
    description: "Ask a question about Projectron",
  },
  {
    value: "other",
    label: "Other",
    icon: MessageSquare,
    color: "text-purple-400",
    description: "Any other inquiry or feedback",
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      type: undefined,
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient("/contact", {
        method: "POST",
        body: values,
      });

      setIsSubmitted(true);
      form.reset();
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send message. Please try again later."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <LandingLayout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
          <div className="container mx-auto px-4 pt-24 pb-16">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-card/50 backdrop-blur border-green-500/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h1 className="text-3xl font-bold mb-4">
                    Message Sent Successfully!
                  </h1>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out! I'll get back to you as soon as
                    possible, usually within 24-48 hours.
                  </p>
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                  >
                    Send Another Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        {/* Header */}
        <section className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center mx-auto mb-6 gap-12">
              <Mail className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground">
              Have a feature request, found a bug, or just want to say hello?
              I'd love to hear from you!
            </p>
          </div>
        </section>

        {/* Contact Form */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Send Me a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Name and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your name"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Inquiry Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What's this about?</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select inquiry type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {inquiryTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        className={`w-4 h-4 ${type.color}`}
                                      />
                                      <div>
                                        <div className="font-medium">
                                          {type.label}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subject */}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Brief subject line"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell me more about your request, bug report, or question..."
                              className="h-32 resize-none"
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-secondary hover:text-white font-semibold text-black"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                I typically respond within 24-48 hours. For urgent issues,
                please include "URGENT" in your subject line.
              </p>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
