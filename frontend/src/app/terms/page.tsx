// src/app/terms/page.tsx
"use client";

import { LandingLayout } from "@/components/layout/landing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <LandingLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center">
                <Scale className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Terms of Service</h1>
                <p className="text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-8 prose prose-invert max-w-none">
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Projectron, you accept and agree to
                    be bound by the terms and provision of this agreement. If
                    you do not agree to abide by the above, please do not use
                    this service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    2. Description of Service
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Projectron is an AI-powered project planning platform that
                    helps developers transform project ideas into comprehensive
                    development plans and generate context for AI-assisted
                    development. The service is provided "as is" and "as
                    available."
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    3. User Accounts
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    To access certain features of the service, you must create
                    an account. You are responsible for:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>
                      Maintaining the confidentiality of your account
                      information
                    </li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    4. Acceptable Use
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You agree not to use the service to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe upon the rights of others</li>
                    <li>Distribute malware or harmful content</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>
                      Use the service for any commercial purpose without
                      permission
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    5. Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The service and its original content, features, and
                    functionality are owned by Projectron and are protected by
                    international copyright, trademark, patent, trade secret,
                    and other intellectual property laws. You retain ownership
                    of any content you create using our service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    6. Privacy Policy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your privacy is important to us. Please review our Privacy
                    Policy, which also governs your use of the service, to
                    understand our practices.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    7. Termination
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account and bar access to
                    the service immediately, without prior notice or liability,
                    under our sole discretion, for any reason whatsoever,
                    including without limitation if you breach the Terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">8. Disclaimer</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    The information on this service is provided on an "as is"
                    basis. To the fullest extent permitted by law, we exclude
                    all representations, warranties, and conditions relating to
                    our service and the use of this service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    9. Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    In no event shall Projectron, nor its directors, employees,
                    partners, agents, suppliers, or affiliates, be liable for
                    any indirect, incidental, special, consequential, or
                    punitive damages, including without limitation, loss of
                    profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    10. Changes to Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or
                    replace these Terms at any time. If a revision is material,
                    we will provide at least 30 days notice prior to any new
                    terms taking effect.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    11. Contact Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about these Terms of Service,
                    please contact us through our contact page.
                  </p>
                </section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
