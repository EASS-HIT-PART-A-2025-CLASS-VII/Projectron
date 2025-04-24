// src/components/sections/problem-solution-section.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import TraditionalPlanning from "./traditional-planning";
import ProjectronPlanning from "./projectron-planning";
import MetricCard from "./metric-card";
import ComparisonSlider from "../ui/comparison-slider";

const ProblemSolutionSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="py-24 relative bg-gradient-to-b from-primary-background to-secondary-background overflow-hidden"
      id="problem-solution"
    >
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

        {/* Comparison Slider */}
        <div className="mb-20">
          <ComparisonSlider
            beforeLabel="Traditional Planning"
            afterLabel="With Projectron"
            beforeContent={<TraditionalPlanning />}
            afterContent={<ProjectronPlanning />}
          />
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

export default ProblemSolutionSection;
