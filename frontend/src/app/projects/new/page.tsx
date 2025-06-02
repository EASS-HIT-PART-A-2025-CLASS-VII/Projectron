"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { PlanGenerationInput } from "@/components/projects/new/types";
import { PlanGenerationForm } from "@/components/projects/new/components/plan-generation-form";
import { ClarificationQuestionsSection } from "@/components/projects/new/components/clarification-questions-section";
import { PlanGenerationLoading } from "@/components/projects/new/components/plan-generation-loading";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/google-analytics";

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

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "clarification" | "generating">(
    "input"
  );
  const [projectInput, setProjectInput] = useState<PlanGenerationInput | null>(
    null
  );
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New states for progress tracking
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Poll for plan status
  const pollPlanStatus = async (taskId: string) => {
    try {
      // No token check needed - cookies sent automatically
      // If not authenticated, apiClient will handle 401 and redirect
      const status = await apiClient<PlanStatus>(`/plan/status/${taskId}`, {
        method: "GET",
      });

      setPlanStatus(status);

      if (status.status === "completed" && status.project_id) {
        analytics.trackPlanGenerated();
        // Stop polling and redirect
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        router.push(`/projects/${status.project_id}`);
      } else if (status.status === "failed") {
        // Stop polling and show error
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setError(status.error_message || "Plan generation failed");
        setIsGeneratingPlan(false);
        setStep("clarification");
      }
    } catch (err) {
      console.error("Error polling status:", err);
      // apiClient already handles 401 redirects, so this is likely a network error
      setError("Failed to check plan status. Please refresh the page.");
    }
  };

  // Start polling when task starts
  const startPolling = (taskId: string) => {
    setTaskId(taskId);

    // Poll immediately
    pollPlanStatus(taskId);

    // Then poll every 2 seconds
    pollingRef.current = setInterval(() => {
      pollPlanStatus(taskId);
    }, 2000);
  };

  // Handle form submission to generate clarification questions
  const handleGenerateQuestions = async (formData: PlanGenerationInput) => {
    setIsGeneratingQuestions(true);
    setError(null);

    try {
      // No token check needed - cookies sent automatically
      // If not authenticated, apiClient will handle 401 and redirect to login
      const response = await apiClient<{ questions: string[] }>(
        "/plan/clarify",
        {
          method: "POST",
          body: formData, // apiClient will stringify this
        }
      );

      setProjectInput(formData);
      setQuestions(response.questions);
      setStep("clarification");
    } catch (err) {
      console.error("Error generating questions:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate questions. Please try again."
      );
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Handle submission of clarification answers to generate the plan
  const handleGeneratePlan = async (
    questionAnswers: Record<string, string>
  ) => {
    if (!projectInput) return;

    setIsGeneratingPlan(true);
    setError(null);
    setStep("generating");
    setPlanStatus(null);

    try {
      const response = await apiClient<{
        task_id: string;
        status: string;
      }>("/plan/generate-plan", {
        method: "POST",
        body: {
          input_data: { ...projectInput },
          clarification_qa: {
            qa_pairs: questionAnswers,
          },
        },
      });

      // Start polling for status
      startPolling(response.task_id);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate plan. Please try again."
      );
      setStep("clarification");
      setIsGeneratingPlan(false);
    }
  };

  // If we're in the generating step, show the full-screen loading component
  if (step === "generating") {
    return <PlanGenerationLoading planStatus={planStatus} />;
  }

  return (
    <div className="container max-w-4xl mx-auto py-16 px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/projects")}
          className="text-secondary-text hover:text-primary-text"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Create New Project
      </h1>

      {error && (
        <div className="bg-red-950/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <Card className="border border-divider bg-secondary-background p-6">
        {step === "input" && (
          <PlanGenerationForm
            onSubmit={handleGenerateQuestions}
            isLoading={isGeneratingQuestions}
          />
        )}

        {step === "clarification" && (
          <ClarificationQuestionsSection
            questions={questions}
            onSubmit={handleGeneratePlan}
            isLoading={isGeneratingPlan}
          />
        )}
      </Card>
    </div>
  );
}
