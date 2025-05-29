// src/app/about/page.tsx
"use client";

import { LandingLayout } from "@/components/layout/landing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Code,
  Lightbulb,
  Target,
  Users,
  Linkedin,
  Mail,
  Github,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <LandingLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
              About Projectron
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Bridging the gap between brilliant ideas and actionable
              development plans through the power of AI
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">
                      The Story Behind Projectron
                    </h2>
                    <p className="text-primary">
                      Born from a developer's frustration
                    </p>
                  </div>
                </div>

                <div className="prose prose-lg prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Hi, I'm Eden – a solo developer and AI enthusiast who
                    created Projectron out of necessity. As someone constantly
                    learning and building projects, I discovered a frustrating
                    bottleneck in modern software development.
                  </p>

                  <p className="text-muted-foreground leading-relaxed mb-6">
                    While AI tools like ChatGPT have revolutionized how we code,
                    there's still significant friction in providing sufficient
                    context to these tools. Repeatedly explaining my project's
                    background and existing codebase to the AI became
                    time-consuming, especially as projects grew in complexity.
                  </p>

                  <p className="text-muted-foreground leading-relaxed">
                    That's when I realized:{" "}
                    <strong className="text-primary">
                      What if the AI already understood your project from the
                      start?
                    </strong>{" "}
                    What if you could skip the repetitive explanations and get
                    straight to building amazing software?
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Solution Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The Projectron Solution
              </h2>
              <p className="text-xl text-muted-foreground">
                Two powerful features that transform how you build software
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* AI Project Planning */}
              <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-2xl font-bold">AI Project Planning</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Transform your textual project ideas into comprehensive
                    implementation plans. Our AI generates detailed
                    architecture, UI components, backend API endpoints, and
                    step-by-step development tasks.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Complete technical architecture
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Detailed API endpoint specifications
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      UI/UX component breakdown
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Actionable development milestones
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Context-Aware AI */}
              <Card className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                      <Code className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-2xl font-bold">
                      Context-Aware AI Assistant
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Generate a comprehensive development context that you can
                    share with any AI coding assistant. No more repetitive
                    explanations – the AI understands your project from day one.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Complete project context generation
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Eliminates repetitive AI explanations
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Works with any AI coding assistant
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Accelerates development workflow
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center">
                      <Users className="w-12 h-12 text-black" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">
                      Meet the Developer
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      I'm Eden, a passionate solo developer and AI enthusiast.
                      When I'm not building Projectron, you'll find me exploring
                      the latest in AI technology, contributing to open-source
                      projects, or sharing insights about the intersection of AI
                      and software development.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      Projectron represents my vision for the future of software
                      development – where AI truly understands and accelerates
                      the creative process, rather than just executing
                      individual tasks.
                    </p>
                    <div className="flex justify-center md:justify-start gap-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href="https://www.linkedin.com/in/eden-co/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/contact">
                          <Mail className="w-4 h-4 mr-2" />
                          Get in Touch
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Development Workflow?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the future of AI-powered project planning and development
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-primary hover:bg-primary/90"
              >
                <Link href="/auth/register">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Share Feedback</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
