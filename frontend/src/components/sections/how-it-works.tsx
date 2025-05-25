// src/components/sections/HowItWorks.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useAnimation,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  PenLine,
  Cpu,
  Layers,
  Code,
  BarChart,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

// Process steps data with toned down colors
const processSteps = [
  {
    id: 1,
    title: "Define Requirements",
    description:
      "Describe your project specifications, technical stack, and business requirements in natural language.",
    icon: PenLine,
    highlight: "AI understands both technical and business contexts",
    color: "from-slate-500/30 to-slate-400/30",
    shadowColor: "shadow-slate-500/10",
  },
  {
    id: 2,
    title: "AI Plan Generation",
    description:
      "Projectron's AI analyzes your requirements and produces a comprehensive development plan within minutes.",
    icon: Cpu,
    highlight: "90% reduction in planning time",
    color: "from-green-500/30 to-emerald-400/30",
    shadowColor: "shadow-primary-cta/10",
  },
  {
    id: 3,
    title: "Review & Refine",
    description:
      "Examine AI-generated plans across all tabs and make adjustments to align with your specific needs.",
    icon: Layers,
    highlight: "Fully customizable with version history",
    color: "from-violet-500/60 to-violet-400/30",
    shadowColor: "shadow-violet-500/10",
  },
  {
    id: 4,
    title: "AI Code Assistance",
    description:
      "Generate code snippets and implementation guidance directly from your project plan with built-in AI assistance.",
    icon: Code,
    highlight: "Context-aware code generation",
    color: "from-amber-500/30 to-amber-400/30",
    shadowColor: "shadow-amber-500/10",
  },
  {
    id: 5,
    title: "Track Progress",
    description:
      "Monitor implementation status, milestone completion, and overall project health throughout development.",
    icon: BarChart,
    highlight: "Real-time progress analytics",
    color: "from-indigo-500/30 to-indigo-400/30",
    shadowColor: "shadow-indigo-500/10",
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
  const [isHovered, setIsHovered] = useState(false);
  const Icon = step.icon;

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      className="relative"
      initial="hidden"
      animate={controls}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated connection line - more subtle */}
      {index < total - 1 && (
        <motion.div
          className="absolute top-20 left-10 w-[1px] h-32"
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ originY: 0 }}
        >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-divider/40 to-transparent"></div>
          </div>
        </motion.div>
      )}

      <div className="flex gap-6 mb-16 group">
        {/* Icon section with enhanced effects */}
        <div className="relative flex-shrink-0">
          <motion.div
            className="relative"
            variants={{
              hidden: { scale: 0.9, opacity: 0 },
              visible: {
                scale: 1,
                opacity: 1,
                transition: {
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  delay: index * 0.1,
                },
              },
            }}
          >
            {/* Subtle glowing background */}
            <motion.div
              className={cn(
                "absolute inset-0 rounded-xl blur-2xl opacity-20",
                `bg-gradient-to-br ${step.color}`
              )}
              animate={{
                scale: isHovered ? 1.1 : 1,
                opacity: isHovered ? 0.4 : 0.2,
              }}
              transition={{ duration: 0.3 }}
            />

            {/* Icon container  */}
            <motion.div
              className={cn(
                "relative w-20 h-20 rounded-xl flex items-center justify-center",
                "bg-secondary-background/50 backdrop-blur-sm",
                "border border-divider/30",
                "shadow-lg",
                isHovered && step.shadowColor
              )}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className={cn("h-7 w-7", `text-primary-cta/70`)} />
            </motion.div>

            {/* Step number */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
            >
              <span className="text-xs font-mono text-secondary-text/60">
                {String(step.id).padStart(2, "0")}
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Content section with cleaner card design */}
        <motion.div
          className="flex-1"
          variants={{
            hidden: { opacity: 0, x: -30 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { duration: 0.5, delay: index * 0.1 + 0.2 },
            },
          }}
        >
          <motion.div
            className={cn(
              "p-6 rounded-xl",
              "bg-secondary-background/30 backdrop-blur-sm",
              "border border-divider/20",
              "shadow-sm hover:shadow-md transition-all duration-300"
            )}
            whileHover={{ y: -1 }}
          >
            {/* Title */}
            <h3 className="text-xl font-semibold mb-3 text-primary-text">
              {step.title}
            </h3>

            {/* Description */}
            <p className="text-secondary-text text-sm mb-4 leading-relaxed">
              {step.description}
            </p>

            {/* Highlight - minimal design */}
            <div className="inline-flex items-center">
              <span
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md",
                  "bg-primary-cta/5 border border-primary-cta/20",
                  "text-primary-cta/80 font-medium"
                )}
              >
                {step.highlight}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Main component
export const HowItWorks = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-32 relative overflow-hidden bg-primary-background"
    >
      {/* Fade transitions at section boundaries */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-background to-transparet z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-primary-background to-transparent z-20 pointer-events-none" />

      {/* Background pattern - more subtle */}
      {/* Subtle animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{ y, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-cta/5 via-transparent to-violet-500/5" />
      </motion.div>

      {/* Grid pattern overlay - more subtle */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(to right, #12E88F 1px, transparent 1px),
                           linear-gradient(to bottom, #12E88F 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with animations */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div className="inline-flex items-center gap-2 mb-6">
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-white" />

            <span className="text-white text-sm font-mono uppercase tracking-wider">
              Workflow
            </span>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-white" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary-text">
            How Projectron Works
          </h2>

          <p className="text-secondary-text text-lg max-w-3xl mx-auto leading-relaxed">
            A streamlined workflow that transforms project concepts into
            detailed implementation plans in{" "}
            <span className="text-primary-cta/90 font-medium">
              minutes, not days
            </span>
            .
          </p>
        </motion.div>

        {/* Process timeline with enhanced layout */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Subtle background glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-cta/5 rounded-full blur-3xl" />

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

        {/* CTA section - more refined */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            className={cn(
              "px-6 py-6 rounded-lg hover:scale-[1.02] transition-all"
            )}
            variant={"outlineGradient"}
          >
            Start Your Project Journey
            <ChevronRight className="inline-block ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
