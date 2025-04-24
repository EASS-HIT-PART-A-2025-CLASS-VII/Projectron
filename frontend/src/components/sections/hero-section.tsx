"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import {
  ChevronRight,
  FileText,
  Database,
  Layers,
  Code,
  Link2,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();
  const [pipelineFinished, setPipelineFinished] = useState(false);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");

      // Set pipeline finished after animation completes
      const timer = setTimeout(() => {
        setPipelineFinished(true);
      }, 3200); // Extended to accommodate new animation sequence

      return () => clearTimeout(timer);
    }
  }, [isInView, controls]);

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        type: "spring",
        stiffness: 100, // More gentle spring
        damping: 15,
      },
    },
  };

  // Split headline for word-by-word animation
  const headlineWords = ["Idea", "to", "Delivery", "in", "Moments"];

  return (
    <section
      ref={sectionRef}
      className="relative pt-24 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-background"
    >
      {/* Background effects - static version */}
      <div className="absolute inset-0 bg-gradient-hero opacity-70" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, var(--secondary) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: 0.07,
        }}
      />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 filter blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-primary/10 filter blur-2xl" />
      </div>

      {/* Code snippet patterns - static */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 text-xs text-primary/5 whitespace-pre opacity-20 font-mono transform rotate-6">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                {i % 2 === 0
                  ? "function buildProject(requirements) {"
                  : "  return AI.generate(requirements);"}
              </div>
            ))}
        </div>
        <div className="absolute bottom-20 right-10 text-xs text-primary/5 whitespace-pre opacity-20 font-mono transform -rotate-3">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i}>
                {i % 3 === 0
                  ? "class ProjectPlan extends Blueprint {"
                  : i % 3 === 1
                  ? "  constructor(idea) {"
                  : "    super(idea.transform());"}
              </div>
            ))}
        </div>
      </div>

      {/* Main content container */}
      <motion.div
        className="container mx-auto px-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left column: Text content - kept the same as requested */}
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="mb-4 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
            >
              <motion.span
                initial={{ scale: 0.8 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mr-1"
              >
                ✨
              </motion.span>
              AI-Powered Project Planner
            </motion.div>

            <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight flex flex-wrap justify-center lg:justify-start">
              {headlineWords.map((word, index) => (
                <motion.span
                  key={index}
                  className="mr-4 inline-block"
                  initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  animate={
                    isInView
                      ? {
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                          transition: {
                            delay: 0.6 + index * 0.08,
                            duration: 0.5,
                            type: "spring",
                            stiffness:
                              index === headlineWords.length - 1 ? 500 : 300,
                            damping:
                              index === headlineWords.length - 1 ? 10 : 20,
                          },
                        }
                      : {}
                  }
                >
                  {index === 4 ? (
                    <span className="text-transparent bg-clip-text bg-gradient-cta relative">
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="text-xl text-muted-foreground mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                      transition: { delay: 1.2, duration: 0.7 },
                    }
                  : {}
              }
            >
              Plan Smarter, Ship Sooner.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 10 }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                      transition: { delay: 1.6, duration: 0.5 },
                    }
                  : {}
              }
            >
              <Link href="/auth/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="cta"
                    size="lg"
                    className="w-full sm:w-auto space-x-2 relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: "-100%", opacity: 0.5 }}
                      whileHover={{ x: "200%", opacity: 0.3 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                    />
                    <span>Start Planning</span>
                    <ChevronRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                  </Button>
                </motion.div>
              </Link>

              <Link href="#features">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto group"
                  >
                    <span>Explore Features</span>
                    <motion.span
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                      className="absolute bottom-0 left-0 h-[1px] bg-primary/30"
                    />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>

          {/* Right column: Enhanced Pipeline Illustration - now more responsive */}
          <div className="relative max-w-xl mx-auto lg:mx-0 h-[450px] md:h-[550px] hidden md:block">
            <EnhancedBlueprintPipeline
              isInView={isInView}
              pipelineFinished={pipelineFinished}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function EnhancedBlueprintPipeline({
  isInView,
  pipelineFinished,
}: {
  isInView: boolean;
  pipelineFinished: boolean;
}) {
  // Define the stage data with added icons
  const stages = [
    {
      title: "Define Requirements",
      callout: "Gather user stories",
      icon: FileText,
      description: "Define project scope and requirements",
      x: 50,
      y: 80,
      delay: 0.1,
    },
    {
      title: "Architect System",
      callout: "Design diagrams",
      icon: Layers,
      description: "Create system architecture",
      x: 200,
      y: 160,
      delay: 0.3,
    },
    {
      title: "Model Data",
      callout: "Structure information",
      icon: Database,
      description: "Design data models and schemas",
      x: 300,
      y: 60,
      delay: 0.5,
    },
    {
      title: "Build Components",
      callout: "Create interfaces",
      icon: Code,
      description: "Develop UI components",
      x: 400,
      y: 180,
      delay: 0.7,
    },
    {
      title: "Integrate APIs",
      callout: "Connect services",
      icon: Link2,
      description: "Implement API integrations",
      x: 500,
      y: 90,
      delay: 0.9,
    },
    {
      title: "Deploy & Monitor",
      callout: "Launch & observe",
      icon: Rocket,
      description: "Deploy and monitor app performance",
      x: 600,
      y: 200,
      delay: 1.1,
    },
  ];

  return (
    <div className="relative w-full h-full">
      {/* Enhanced glowing background for the pipeline */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-transparent"
        style={{ filter: "blur(40px)" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.8 } : {}}
        transition={{ delay: 0, duration: 1 }}
      />

      <div className="w-full h-full relative z-10">
        <svg
          viewBox="-50 -220 750 600" // Expanded viewBox to accommodate glow
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Enhanced Pipeline Path with gradient and extended glow effect */}
          <defs>
            <linearGradient
              id="pipelineGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="1" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main pipeline path - smoother animation */}
          <motion.path
            d="M30,75 
            C50,75 60,75 70,75 
            L130,75 
            C150,75 160,125 170,125 
            L230,125 
            C250,125 260,95 270,95 
            L330,95 
            C350,95 360,145 370,145 
            L430,145 
            C450,145 460,115 470,115 
            L530,115 
            C550,115 560,165 570,165 
            L630,165"
            stroke="url(#pipelineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="1000"
            strokeDashoffset="1000"
            filter="url(#glow)"
            initial={{ strokeDashoffset: 1000 }}
            animate={
              isInView
                ? {
                    strokeDashoffset: 0,
                    transition: {
                      delay: 1.5,
                      duration: 2.5, // Slightly shorter for better pacing
                      ease: "easeOut",
                    },
                  }
                : {}
            }
          />

          {/* Data flow particles along the path */}
          {pipelineFinished && (
            <>
              <motion.circle
                cx="0"
                cy="0"
                r="3"
                fill="var(--primary)"
                filter="url(#glow)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1],
                }}
                style={{
                  offsetPath: `path("M30,75 C50,75 60,75 70,75 L130,75 C150,75 160,125 170,125 L230,125 C250,125 260,95 270,95 L330,95 C350,95 360,145 370,145 L430,145 C450,145 460,115 470,115 L530,115 C550,115 560,165 570,165 L630,165")`,
                  offsetDistance: "0%",
                }}
                transition={{
                  offsetDistance: {
                    from: "0%",
                    to: "100%",
                    duration: 4,
                    repeat: Infinity,
                    delay: 0,
                    repeatDelay: 1,
                  },
                  opacity: {
                    duration: 4,
                    repeat: Infinity,
                    delay: 0,
                    repeatDelay: 1,
                  },
                }}
              />
              <motion.circle
                cx="0"
                cy="0"
                r="3"
                fill="var(--primary)"
                filter="url(#glow)"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                }}
                style={{
                  offsetPath: `path("M30,75 C50,75 60,75 70,75 L130,75 C150,75 160,125 170,125 L230,125 C250,125 260,95 270,95 L330,95 C350,95 360,145 370,145 L430,145 C450,145 460,115 470,115 L530,115 C550,115 560,165 570,165 L630,165")`,
                  offsetDistance: "0%",
                }}
                transition={{
                  offsetDistance: {
                    from: "0%",
                    to: "100%",
                    duration: 4,
                    repeat: Infinity,
                    delay: 2,
                    repeatDelay: 1,
                  },
                  opacity: {
                    duration: 4,
                    repeat: Infinity,
                    delay: 2,
                    repeatDelay: 1,
                  },
                }}
              />
            </>
          )}

          {/* Stage Cards with Hover Icons */}
          <TooltipProvider>
            {stages.map((stage, index) => (
              <g key={index} className="cursor-pointer">
                {/* Card and content */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? {
                          scale: 1,
                          opacity: 1,
                          filter:
                            "drop-shadow(0 8px 12px rgba(18, 232, 143, 0.2))",
                          transition: {
                            delay: 2 + stage.delay, // Start sooner after path completes
                            duration: 0.5,
                            type: "spring",
                            stiffness: 200,
                          },
                        }
                      : {}
                  }
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Linking element to connect tooltip trigger */}
                      <g>
                        {/* Card shadow for depth - enhanced */}
                        <rect
                          x={stage.x - 42}
                          y={stage.y - 42}
                          width="84"
                          height="84"
                          rx="12"
                          fill="black"
                          fillOpacity="0.3"
                          filter="blur(6px)"
                        />

                        {/* Main card - more rounded corners */}
                        <rect
                          x={stage.x - 40}
                          y={stage.y - 40}
                          width="80"
                          height="80"
                          rx="12"
                          fill="var(--card)"
                          stroke="var(--border)"
                        />

                        {/* Card content - custom for each stage */}
                        {index === 0 && (
                          <>
                            <rect
                              x={stage.x - 20}
                              y={stage.y - 15}
                              width="40"
                              height="5"
                              rx="2"
                              fill="var(--primary)"
                              fillOpacity="0.7"
                            />
                            <rect
                              x={stage.x - 20}
                              y={stage.y - 5}
                              width="30"
                              height="3"
                              rx="1.5"
                              fill="var(--muted)"
                            />
                            <rect
                              x={stage.x - 20}
                              y={stage.y + 3}
                              width="35"
                              height="3"
                              rx="1.5"
                              fill="var(--muted)"
                            />
                            <rect
                              x={stage.x - 20}
                              y={stage.y + 11}
                              width="25"
                              height="3"
                              rx="1.5"
                              fill="var(--muted)"
                            />
                          </>
                        )}

                        {index === 1 && (
                          <>
                            <circle
                              cx={stage.x}
                              cy={stage.y - 5}
                              r="14"
                              stroke="var(--primary)"
                              strokeWidth="2"
                              fill="transparent"
                            />
                            <motion.circle
                              cx={stage.x}
                              cy={stage.y - 5}
                              r="9"
                              stroke="var(--primary)"
                              strokeWidth="1.5"
                              fill="transparent"
                              strokeDasharray="30"
                              animate={
                                pipelineFinished
                                  ? {
                                      rotate: 360,
                                      transition: {
                                        duration: 8,
                                        repeat: Infinity,
                                        ease: "linear",
                                      },
                                    }
                                  : {}
                              }
                            />
                            <line
                              x1={stage.x - 15}
                              y1={stage.y + 15}
                              x2={stage.x + 15}
                              y2={stage.y + 15}
                              stroke="var(--primary)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </>
                        )}

                        {index === 2 && (
                          <>
                            <rect
                              x={stage.x - 18}
                              y={stage.y - 18}
                              width="36"
                              height="12"
                              rx="3"
                              stroke="var(--primary)"
                              strokeWidth="1.5"
                              fill="var(--card)"
                            />
                            <line
                              x1={stage.x - 12}
                              y1={stage.y + 5}
                              x2={stage.x + 12}
                              y2={stage.y + 5}
                              stroke="var(--muted)"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <line
                              x1={stage.x - 12}
                              y1={stage.y + 12}
                              x2={stage.x + 12}
                              y2={stage.y + 12}
                              stroke="var(--muted)"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </>
                        )}

                        {index === 3 && (
                          <>
                            <rect
                              x={stage.x - 18}
                              y={stage.y - 18}
                              width="15"
                              height="15"
                              rx="3"
                              fill="var(--primary)"
                              fillOpacity="0.6"
                            />
                            <rect
                              x={stage.x + 3}
                              y={stage.y - 18}
                              width="15"
                              height="15"
                              rx="3"
                              fill="var(--primary)"
                              fillOpacity="0.4"
                            />
                            <rect
                              x={stage.x - 18}
                              y={stage.y + 3}
                              width="15"
                              height="15"
                              rx="3"
                              fill="var(--primary)"
                              fillOpacity="0.3"
                            />
                            <rect
                              x={stage.x + 3}
                              y={stage.y + 3}
                              width="15"
                              height="15"
                              rx="3"
                              fill="var(--primary)"
                              fillOpacity="0.8"
                            />
                          </>
                        )}

                        {index === 4 && (
                          <>
                            <line
                              x1={stage.x - 18}
                              y1={stage.y - 10}
                              x2={stage.x + 18}
                              y2={stage.y - 10}
                              stroke="var(--primary)"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />
                            <circle
                              cx={stage.x - 10}
                              cy={stage.y + 5}
                              r="6"
                              fill="var(--primary)"
                              fillOpacity="0.8"
                            />
                            <line
                              x1={stage.x - 3}
                              y1={stage.y + 5}
                              x2={stage.x + 18}
                              y2={stage.y + 5}
                              stroke="var(--primary)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </>
                        )}

                        {index === 5 && (
                          <>
                            <rect
                              x={stage.x - 18}
                              y={stage.y - 15}
                              width="36"
                              height="6"
                              rx="2"
                              fill="var(--primary)"
                              fillOpacity="1"
                            />
                            <rect
                              x={stage.x - 18}
                              y={stage.y - 5}
                              width="24"
                              height="6"
                              rx="2"
                              fill="var(--primary)"
                              fillOpacity="0.7"
                            />
                            <rect
                              x={stage.x - 18}
                              y={stage.y + 5}
                              width="30"
                              height="6"
                              rx="2"
                              fill="var(--primary)"
                              fillOpacity="0.5"
                            />
                          </>
                        )}

                        {/* Icon background circle that appears on hover */}
                        <motion.circle
                          cx={stage.x}
                          cy={stage.y}
                          r="22"
                          fill="var(--card)"
                          opacity="0"
                          whileHover={{
                            opacity: 1,
                            transition: { duration: 0.2 },
                          }}
                        />

                        {/* Stage icon that appears on hover */}
                        <motion.g
                          opacity="0"
                          whileHover={{
                            opacity: 1,
                            scale: 1.1,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <foreignObject
                            x={stage.x - 10}
                            y={stage.y - 10}
                            width="20"
                            height="20"
                          >
                            <div className="w-full h-full flex items-center justify-center text-primary">
                              {React.createElement(stage.icon, { size: 18 })}
                            </div>
                          </foreignObject>
                        </motion.g>

                        {/* Highlight outline that pulses once animation is complete - enhanced */}
                        <motion.rect
                          x={stage.x - 40}
                          y={stage.y - 40}
                          width="80"
                          height="80"
                          rx="12"
                          stroke="var(--primary)"
                          strokeOpacity="0.5"
                          fill="transparent"
                          initial={{ strokeWidth: 0 }}
                          animate={
                            pipelineFinished
                              ? {
                                  strokeWidth: [0, 3, 0],
                                  transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3,
                                    delay: index * 0.5,
                                  },
                                }
                              : {}
                          }
                        />
                      </g>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="bg-card border border-primary/20 text-sm"
                    >
                      <p className="font-medium text-primary">{stage.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {stage.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </motion.g>
              </g>
            ))}
          </TooltipProvider>

          {/* Gradient definitions - enhanced */}
          <defs>
            <linearGradient
              id="nodeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}
