// src/components/sections/HowItWorks.tsx
"use client";
import React, { useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
  PenLine,
  Cpu,
  Layers,
  Code,
  BarChart,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Process steps data
const processSteps = [
  {
    id: 1,
    title: "Define Requirements",
    description:
      "Describe your project specifications, technical stack, and business requirements in natural language.",
    icon: PenLine,
    highlight: "AI understands both technical and business contexts",
  },
  {
    id: 2,
    title: "AI Plan Generation",
    description:
      "Projectron's AI analyzes your requirements and produces a comprehensive development plan within minutes.",
    icon: Cpu,
    highlight: "90% reduction in planning time compared to manual methods",
  },
  {
    id: 3,
    title: "Review & Refine",
    description:
      "Examine AI-generated plans across all tabs and make adjustments to align with your specific needs.",
    icon: Layers,
    highlight: "Fully customizable plans with version history",
  },
  {
    id: 4,
    title: "Context-Aware AI Code Assistance",
    description:
      "Generate code snippets and implementation guidance directly from your project plan with built-in AI assistance.",
    icon: ChevronRight,
    highlight: "Intelligent code generation aligned with your architecture",
  },
  {
    id: 5,
    title: "Track Progress",
    description:
      "Monitor implementation status, milestone completion, and overall project health throughout development.",
    icon: BarChart,
    highlight: "Automated dependency tracking and critical path analysis",
  },
];

// Individual process step component
const ProcessStep = ({
  step,
  index,
  total,
}: {
  step: (typeof processSteps)[0];
  index: number;
  total: number;
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const Icon = step.icon;

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Simplified layout - vertical timeline on both mobile and desktop
  return (
    <motion.div
      ref={ref}
      className="relative"
      initial="hidden"
      animate={controls}
    >
      {/* Connected line between steps (not on last item) */}
      {index < total - 1 && (
        <div className="relative top-12 left-8 ml-0.5 w-[1px] border-l border-dashed border-divider h-[calc(100%-48px)]"></div>
      )}

      <div className="flex mb-12">
        {/* Icon column */}
        <div className="flex-shrink-0">
          <motion.div
            className="relative"
            variants={{
              hidden: { scale: 0.8, opacity: 0 },
              visible: {
                scale: 1,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1,
                },
              },
            }}
          >
            {/* Numbered circle with icon */}
            <div className="w-16 h-16 rounded-full bg-secondary-background border border-divider flex items-center justify-center z-10">
              <Icon className="h-6 w-6 text-primary-cta" />
            </div>

            {/* Step number */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-background border border-divider flex items-center justify-center text-xs font-mono text-secondary-text">
              {step.id}
            </div>
          </motion.div>
        </div>

        {/* Content column */}
        <div className="ml-12 pt-3">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, delay: 0.2 },
              },
            }}
          >
            <h3 className="text-xl font-semibold mb-2 text-primary-text">
              {step.title}
            </h3>
            <p className="text-secondary-text text-sm max-w-xl">
              {step.description}
            </p>
            <div className="mt-3">
              <span className="text-xs inline-flex items-center text-primary-text/70 bg-secondary-background px-3 py-1 rounded-sm border border-divider">
                {step.highlight}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export const HowItWorks = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-secondary-background">
      {/* Subtle background elements */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-secondary-background to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-secondary-background to-transparent"></div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary-text">
            How Projectron Works
          </h2>
          <p className="text-secondary-text max-w-2xl mx-auto">
            A streamlined workflow that transforms project concepts into
            detailed implementation plans in minutes, not days.
          </p>

          {/* Section divider */}
          <div className="flex items-center justify-center mt-8">
            <div className="h-[1px] w-12 bg-gradient-cta opacity-50"></div>
            <div className="mx-3 text-secondary-text text-xs font-mono">
              WORKFLOW
            </div>
            <div className="h-[1px] w-12 bg-gradient-cta opacity-50"></div>
          </div>
        </div>

        {/* Process timeline - simplified vertical timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative pb-8">
            {/* Process steps */}
            {processSteps.map((step, index) => (
              <ProcessStep
                key={step.id}
                step={step}
                index={index}
                total={processSteps.length}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
