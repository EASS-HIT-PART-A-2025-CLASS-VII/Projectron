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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-card flex items-center">
        {/* Story Section */}
        <section className="container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto">
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
                Hi, I'm Eden, the developer behind Projectron. This tool emerged
                from a frustration many developers share: the gap between having
                a great idea and actually shipping it.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Most projects die in the planning phase. You have a vision for
                an app or system, but breaking it into concrete, buildable
                pieces is overwhelming. Where do you start? How do you structure
                the architecture? What APIs do you need? The excitement fades as
                you get lost in decisions before writing any code.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Once you overcome the planning complexity and begin development,
                a new challenge emerges. AI has transformed how we code,
                offering incredible power when given proper context. Throughout
                my development journey, I found myself exhaustively bringing AI
                assistants up to speed on my projects, repeating the same
                explanations over and over. This time-consuming context-setting
                becomes a major bottleneck as codebases grow
              </p>

              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-primary">
                  Projectron bridges that gap between idea and implementation.
                </strong>{" "}
                It transforms concepts into comprehensive development plans,
                then generates perfect context for AI-assisted development.
                Everything stays aligned in one place as your project evolves.
                Because the best development happens when you can focus on
                creating, not coordinating.
              </p>
            </div>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
