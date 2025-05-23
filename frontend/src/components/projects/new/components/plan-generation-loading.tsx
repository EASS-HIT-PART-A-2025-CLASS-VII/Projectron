import React from "react";
import { Brain } from "lucide-react";
// Define the typical steps based on the plan generation process
const PLAN_GENERATION_STEPS = [
  {
    id: 1,
    title: "Analyzing Project Requirements",
    description: "Processing your project details and requirements",
    icon: "🔍",
  },
  {
    id: 2,
    title: "Creating High-Level Plan",
    description: "Defining project vision, objectives, and scope",
    icon: "📋",
  },
  {
    id: 3,
    title: "Generating Technical Architecture",
    description: "Designing system components and infrastructure",
    icon: "🏗️",
  },
  {
    id: 4,
    title: "Designing API Endpoints",
    description: "Creating RESTful API specifications",
    icon: "🔌",
  },
  {
    id: 5,
    title: "Modeling Data Structures",
    description: "Defining database schemas and relationships",
    icon: "🗄️",
  },
  {
    id: 6,
    title: "Planning UI Components",
    description: "Designing user interface and experience",
    icon: "🎨",
  },
  {
    id: 7,
    title: "Building Implementation Roadmap",
    description: "Creating detailed tasks and milestones",
    icon: "🛣️",
  },
];

interface StepIndicatorProps {
  step: (typeof PLAN_GENERATION_STEPS)[0];
  status: "pending" | "active" | "completed";
  isLast: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  step,
  status,
  isLast,
}) => {
  return (
    <div className="relative flex items-start">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-700">
          {status === "completed" && (
            <div className="w-full bg-primary-cta transition-all duration-1000 ease-out h-full" />
          )}
        </div>
      )}

      {/* Step content */}
      <div className="flex items-start space-x-4 relative z-10">
        {/* Step indicator */}
        <div
          className={`
          flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500
          ${
            status === "completed"
              ? "bg-primary-cta border-primary-cta text-primary-background"
              : status === "active"
              ? "bg-hover-active border-primary-cta text-primary-cta animate-pulse-slow"
              : "bg-secondary-background border-divider text-disabled-placeholder"
          }
        `}
        >
          {status === "completed" ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : status === "active" ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-lg">{step.icon}</span>
          )}
        </div>

        {/* Step details */}
        <div className="flex-1 min-w-0 pb-8">
          <div
            className={`
            text-lg font-semibold transition-colors duration-300
            ${
              status === "active"
                ? "text-primary-text"
                : status === "completed"
                ? "text-primary-cta"
                : "text-secondary-text"
            }
          `}
          >
            {step.title}
          </div>
          <p
            className={`
            text-sm mt-1 transition-colors duration-300
            ${
              status === "active"
                ? "text-secondary-text"
                : "text-disabled-placeholder"
            }
          `}
          >
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
};

interface PlanStatus {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  current_step: string;
  step_number: number;
  total_steps: number;
  error_message?: string;
  project_id?: string;
  result?: any;
}

interface PlanGenerationLoadingProps {
  planStatus?: PlanStatus | null;
}

export const PlanGenerationLoading: React.FC<PlanGenerationLoadingProps> = ({
  planStatus,
}) => {
  const getStepStatus = (stepId: number) => {
    if (!planStatus) return "pending";

    if (stepId < planStatus.step_number) return "completed";
    if (stepId === planStatus.step_number) return "active";
    return "pending";
  };

  const progressPercentage = planStatus
    ? (planStatus.step_number / planStatus.total_steps) * 100
    : 0;

  return (
    <div className="min-h-screen bg-primary-background flex items-center justify-center p-4 my-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-text mb-2">
            Crafting Your Project Plan
          </h2>
          <p className="text-secondary-text text-lg">
            Our AI is working on creating a comprehensive development roadmap
          </p>

          {/* Overall Progress Bar */}
          <div className="mt-8 relative">
            <div className="w-full bg-divider rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-cta to-cta-hover h-2 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-xs text-disabled-placeholder mt-2">
              <span>Started</span>
              <span className="text-primary-cta font-medium">
                {planStatus ? `${Math.round(progressPercentage)}%` : "0%"}
              </span>
              <span>Complete</span>
            </div>
          </div>
        </div>

        {/* Steps List */}
        <div className="bg-secondary-background rounded-xl p-8 border border-divider">
          <h3 className="text-xl font-semibold text-primary-text mb-8 flex items-center">
            <Brain className="w-5 h-5 mx-3 text-primary-cta" />
            Generation Progress
          </h3>

          <div className="space-y-0">
            {PLAN_GENERATION_STEPS.map((step, index) => (
              <StepIndicator
                key={step.id}
                step={step}
                status={getStepStatus(step.id)}
                isLast={index === PLAN_GENERATION_STEPS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Current Status */}
        {planStatus && (
          <div className="mt-8 text-center">
            <p className="text-disabled-placeholder text-sm mt-4">
              This usually takes 1-2 minutes. Hang tight while we build
              something amazing!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
