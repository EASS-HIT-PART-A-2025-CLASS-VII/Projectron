// src/app/privacy/page.tsx
"use client";

import { LandingLayout } from "@/components/layout/landing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <LandingLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center">
                <Shield className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Privacy Policy</h1>
                <p className="text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-8 prose prose-invert max-w-none">
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    1. Information We Collect
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We collect information you provide directly to us, such as
                    when you create an account, use our services, or contact us.
                  </p>

                  <h3 className="text-xl font-medium mb-3">
                    Personal Information
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                    <li>Name and email address</li>
                    <li>Account credentials</li>
                    <li>Profile information</li>
                    <li>Communication preferences</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3">Project Data</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                    <li>Project descriptions and plans</li>
                    <li>Generated development roadmaps</li>
                    <li>Usage patterns and preferences</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3">
                    Technical Information
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                    <li>Usage analytics and performance metrics</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    2. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Generate AI-powered project plans and context</li>
                    <li>
                      Communicate with you about your account and our services
                    </li>
                    <li>Respond to your comments and questions</li>
                    <li>Analyze usage patterns to enhance user experience</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    3. Information Sharing
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We do not sell, trade, or otherwise transfer your personal
                    information to third parties except as described below:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and prevent fraud</li>
                    <li>
                      With service providers who assist in our operations (under
                      strict confidentiality agreements)
                    </li>
                    <li>
                      In connection with a business transfer or acquisition
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    4. Data Security
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate technical and organizational
                    measures to protect your personal information against
                    unauthorized access, alteration, disclosure, or destruction.
                    However, no method of transmission over the internet is 100%
                    secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    5. Data Retention
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your information for as long as necessary to
                    provide our services, comply with legal obligations, resolve
                    disputes, and enforce our agreements. You may request
                    deletion of your account and associated data at any time.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibred mb-4">
                    6. Your Rights
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Depending on your location, you may have the following
                    rights:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Object to processing of your information</li>
                    <li>Request data portability</li>
                    <li>Withdraw consent where applicable</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    7. Cookies and Tracking
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We use cookies and similar tracking technologies to enhance
                    your experience on our service. For detailed information
                    about our use of cookies, please see our Cookie Policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    8. Third-Party Services
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service may contain links to third-party websites or
                    integrate with third-party services. We are not responsible
                    for the privacy practices of these third parties. We
                    encourage you to read their privacy policies.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    9. Children's Privacy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service is not intended for children under 13 years of
                    age. We do not knowingly collect personal information from
                    children under 13. If we become aware that we have collected
                    such information, we will take steps to delete it.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    10. International Transfers
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Your information may be transferred to and processed in
                    countries other than your own. We ensure appropriate
                    safeguards are in place to protect your information in
                    accordance with this privacy policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    11. Changes to This Policy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this privacy policy from time to time. We will
                    notify you of any material changes by posting the new policy
                    on this page and updating the "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">
                    12. Contact Us
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this Privacy Policy or our
                    privacy practices, please contact us through our contact
                    page.
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
