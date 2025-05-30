// src/app/cookies/page.tsx
"use client";

import { LandingLayout } from "@/components/layout/landing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie } from "lucide-react";

export default function CookiePage() {
  return (
    <LandingLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center">
                <Cookie className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Cookie Policy</h1>
                <p className="text-muted-foreground">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-8 prose prose-invert max-w-none">
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    1. What Are Cookies
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Cookies are small text files that are placed on your device
                    when you visit our website. They help us provide you with a
                    better experience by remembering your preferences, keeping
                    you logged in, and understanding how you use our service.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    2. Types of Cookies We Use
                  </h2>

                  <h3 className="text-xl font-medium mb-3">
                    Essential Cookies
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    These cookies are necessary for the website to function
                    properly. They enable core functionality such as security,
                    network management, and accessibility.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                    <li>Authentication tokens to keep you logged in</li>
                    <li>Session management cookies</li>
                    <li>Security cookies to prevent fraud</li>
                    <li>Load balancing cookies</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3">
                    Functional Cookies
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    These cookies enable enhanced functionality and
                    personalization, such as remembering your preferences and
                    settings.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                    <li>Language and region preferences</li>
                    <li>Theme and display settings</li>
                    <li>Form data you've entered</li>
                    <li>Recently viewed projects</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3">
                    Analytics Cookies
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    These cookies help us understand how visitors interact with
                    our website by collecting and reporting information
                    anonymously.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                    <li>Page views and user journeys</li>
                    <li>Time spent on different pages</li>
                    <li>Device and browser information</li>
                    <li>Error tracking and performance metrics</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3">
                    Marketing Cookies
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    These cookies are used to track visitors across websites to
                    display relevant advertisements and measure campaign
                    effectiveness.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>Social media integration</li>
                    <li>Advertising campaign tracking</li>
                    <li>Retargeting capabilities</li>
                    <li>Conversion tracking</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    3. Third-Party Cookies
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We may use third-party services that set their own cookies
                    on your device. These include:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>
                      <strong>Google Analytics:</strong> For website analytics
                      and usage tracking
                    </li>
                    <li>
                      <strong>Authentication Providers:</strong> For OAuth login
                      services (Google, GitHub)
                    </li>
                    <li>
                      <strong>Payment Processors:</strong> For secure payment
                      processing
                    </li>
                    <li>
                      <strong>Support Services:</strong> For customer support
                      and chat functionality
                    </li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    4. Cookie Duration
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Cookies can be either session cookies or persistent cookies:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>
                      <strong>Session Cookies:</strong> Temporary cookies that
                      are deleted when you close your browser
                    </li>
                    <li>
                      <strong>Persistent Cookies:</strong> Remain on your device
                      for a set period or until you delete them
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Most of our cookies are persistent and typically expire
                    after 30 days to 1 year, depending on their purpose.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    5. Managing Your Cookie Preferences
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    You have several options for managing cookies:
                  </p>

                  <h3 className="text-xl font-medium mb-3">Browser Settings</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Most browsers allow you to control cookies through their
                    settings preferences. You can:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-6">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Set cookies to expire when you close your browser</li>
                  </ul>

                  <h3 className="text-xl font-medium mb-3">
                    Our Cookie Preferences
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    When you first visit our website, you'll see a cookie
                    consent banner that allows you to choose which types of
                    non-essential cookies you want to accept. You can change
                    these preferences at any time by clicking the "Cookie
                    Settings" link in our footer.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    6. Impact of Disabling Cookies
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Please note that disabling certain cookies may impact your
                    experience on our website:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                    <li>You may need to log in repeatedly</li>
                    <li>Your preferences and settings may not be saved</li>
                    <li>Some features may not work properly</li>
                    <li>We won't be able to remember your choices</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4">
                    7. Updates to This Policy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Cookie Policy from time to time to
                    reflect changes in our practices or for other operational,
                    legal, or regulatory reasons. Please revisit this page
                    regularly to stay informed about our use of cookies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about our use of cookies or this
                    Cookie Policy, please contact us through our contact page.
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
