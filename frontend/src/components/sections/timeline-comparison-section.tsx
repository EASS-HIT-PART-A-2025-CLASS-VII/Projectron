"use client";

import React, { useRef, useMemo } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import TraditionalPlanning from "./traditional-planning";
import ProjectronPlanning from "./projectron-planning";
import MetricCard from "./metric-card";
import TimelineProgress from "../ui/timeline-progress";
import BackgroundGradient from "../ui/background-gradient";
import {
  XCircle,
  CheckCircle,
  RefreshCw,
  ListChecks,
  Package,
  Users,
  BrainCircuit,
  Layers,
  FileJson,
} from "lucide-react";

// Timeline item component for showing problem/solution pairs
// Extract to avoid recomputation
const getIconForIndex = (index: number, isProblems = true) => {
  const problemIcons = [
    <RefreshCw key="refresh" className="text-destructive" />,
    <ListChecks key="list" className="text-destructive" />,
    <Package key="package" className="text-destructive" />,
    <Users key="users" className="text-destructive" />,
  ];

  const solutionIcons = [
    <BrainCircuit key="brain" className="text-primary-cta" />,
    <ListChecks key="list" className="text-primary-cta" />,
    <Layers key="layers" className="text-primary-cta" />,
    <FileJson key="file" className="text-primary-cta" />,
  ];

  const safeIndex = Math.min(index, 3); // Ensure index is in bounds
  return isProblems ? problemIcons[safeIndex] : solutionIcons[safeIndex];
};
// Memoize the TimelineItem component to prevent unnecessary re-renders
const TimelineItem = React.memo(
  ({
    isEven,
    isInView,
    delay,
    problem,
    solution,
    index,
  }: {
    isEven: boolean;
    isInView: boolean;
    delay: number;
    problem: React.ReactNode;
    solution: React.ReactNode;
    index: number;
  }) => {
    return (
      <div className="relative min-h-[300px] flex items-center py-16">
        {/* Left side - Problem */}
        <motion.div
          className="w-[45%] pr-8"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.5, delay: delay }}
        >
          {problem}
        </motion.div>

        {/* Center vertical line with dot */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-divider -translate-x-1/2">
          {/* The dot itself - simplified animation */}
          <motion.div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 ${
              isEven
                ? "border-destructive bg-hover-active"
                : "border-primary-cta bg-hover-active"
            }`}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.3 }}
          />
        </div>

        {/* Right side - Solution */}
        <motion.div
          className="w-[45%] pl-8 ml-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.5, delay: delay + 0.1 }}
        >
          {solution}
        </motion.div>
      </div>
    );
  }
);

// Extract individual pain points and solutions from the components
const ProblemSolutionPairs = () => {
  // We'll extract these from the TraditionalPlanning and ProjectronPlanning components - simplified versions
  const problemComponents = [
    <div
      key="context"
      className="p-4 bg-hover-active bg-opacity-30 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <XCircle className="text-destructive mr-3 w-5 h-5" />
        <span>Wasted Time Re-surfacing Context</span>
      </h3>
      <p className="text-primary-text">
        Every new coding session requires re-explaining your codebase and
        requirements to the AI assistant
      </p>
    </div>,
    <div
      key="tasks"
      className="p-4 bg-hover-active bg-opacity-30 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <XCircle className="text-destructive mr-3 w-5 h-5" />
        <span>Lack of Actionable, Trackable Tasks</span>
      </h3>
      <p className="text-primary-text">
        High-level plans remain just documents—there's no clear task list or
        progress tracking
      </p>
    </div>,
    <div
      key="tools"
      className="p-4 bg-hover-active bg-opacity-30 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <XCircle className="text-destructive mr-3 w-5 h-5" />
        <span>Fragmented Tooling and Documentation</span>
      </h3>
      <p className="text-primary-text">
        Tools and documentation are scattered across multiple platforms, leading
        to version drift and inconsistencies
      </p>
    </div>,
    <div
      key="onboarding"
      className="p-4 bg-hover-active bg-opacity-30 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <XCircle className="text-destructive mr-3 w-5 h-5" />
        <span>Onboarding Friction for Collaborators</span>
      </h3>
      <p className="text-primary-text">
        New team members need extensive ramp-up time to understand the project
        structure
      </p>
    </div>,
  ];

  const solutionComponents = [
    <div
      key="context"
      className="p-4 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <CheckCircle className="text-primary-cta mr-3 w-5 h-5" />
        <span>Embedded Context for AI Coding</span>
      </h3>
      <p className="text-primary-text">
        By embedding the entire implementation plan as shared context, the
        assistant "knows" your project's structure from the start
      </p>
    </div>,
    <div
      key="tasks"
      className="p-4 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <CheckCircle className="text-primary-cta mr-3 w-5 h-5" />
        <span>Detailed, Trackable Task Breakdown</span>
      </h3>
      <p className="text-primary-text">
        The planner breaks the roadmap into detailed, ordered milestones and
        developer tasks, making it easy to track progress
      </p>
    </div>,
    <div
      key="tools"
      className="p-4 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <CheckCircle className="text-primary-cta mr-3 w-5 h-5" />
        <span>Single Source of Truth</span>
      </h3>
      <p className="text-primary-text">
        All diagrams, API specs, data models and UI component outlines are
        generated together—ensuring consistency
      </p>
    </div>,
    <div
      key="onboarding"
      className="p-4 bg-secondary-background rounded-lg shadow-md border-l-4 border-hover-active"
    >
      <h3 className="text-lg font-medium mb-3 text-primary-text flex items-center border-b border-divider pb-3">
        <CheckCircle className="text-primary-cta mr-3 w-5 h-5" />
        <span>Instant Onboarding for New Team Members</span>
      </h3>
      <p className="text-primary-text">
        A comprehensive hierarchy gives newcomers instant clarity on goals,
        design decisions and where to jump in
      </p>
    </div>,
  ];

  return { problemComponents, solutionComponents };
};

const ProblemSolutionTimelineSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  // Get problem/solution pairs
  const { problemComponents, solutionComponents } = ProblemSolutionPairs();

  // Track scroll progress for parallax effects
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start end", "end start"],
  });

  // Transform scroll progress into values for animation
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section
      ref={sectionRef}
      className="py-24 relative bg-gradient-to-b from-primary-background to-secondary-background overflow-hidden"
      id="problem-solution"
    >
      {/* Progress indicator (visible on desktop only) */}
      <div className="hidden lg:block">
        <TimelineProgress numberOfItems={problemComponents.length} />
      </div>

      {/* Animated background gradients */}
      <BackgroundGradient color="var(--primary)" opacity={0.07} />

      {/* Additional subtle gradient with parallax effect */}
      <motion.div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(18, 232, 143, 0.15) 0%, transparent 70%)",
          y: backgroundY,
        }}
      />

      <div className="container max-w-7xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary-cta">Transform</span> Your Development
            Workflow
          </h2>
          <p className="text-secondary-text max-w-2xl mx-auto text-lg">
            See how Projectron eliminates the pain points of traditional project
            planning with AI-powered automation.
          </p>
        </motion.div>

        {/* Timeline Section */}
        <div ref={timelineRef} className="relative mb-20">
          {/* Sticky Headers */}
          <div className="sticky top-24 z-10 flex justify-between mb-8 px-4">
            <motion.div
              className="flex items-center bg-primary-background bg-opacity-80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md"
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <XCircle className="text-destructive w-5 h-5 mr-2" />
              <span className="text-xl font-semibold">The Old Way</span>
            </motion.div>

            <motion.div
              className="flex items-center bg-primary-background bg-opacity-80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md"
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="text-primary-cta w-5 h-5 mr-2" />
              <span className="text-xl font-semibold">The Projectron Way</span>
            </motion.div>
          </div>

          {/* Timeline Items */}
          <div className="relative">
            {/* Vertical line that spans the entire section */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-divider -translate-x-1/2"></div>

            {/* Problem-Solution Pairs */}
            {problemComponents.map((problem, index) => (
              <TimelineItem
                key={index}
                isEven={index % 2 === 0}
                isInView={isInView}
                delay={index * 0.2}
                problem={problem}
                solution={solutionComponents[index]}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <MetricCard
            value="83%"
            label="Less Planning Time"
            description="Generate complete project plans in minutes instead of days"
            delay={0.1}
            isInView={isInView}
            icon="time"
          />
          <MetricCard
            value="95%"
            label="Fewer Planning Meetings"
            description="AI-generated plans reduce the need for alignment discussions"
            delay={0.2}
            isInView={isInView}
            icon="team"
          />
          <MetricCard
            value="2.7x"
            label="Faster Project Kickoff"
            description="Start development sooner with auto-generated, actionable tasks"
            delay={0.3}
            isInView={isInView}
            icon="speed"
          />
        </div>
      </div>
    </section>
  );
};

export default ProblemSolutionTimelineSection;
