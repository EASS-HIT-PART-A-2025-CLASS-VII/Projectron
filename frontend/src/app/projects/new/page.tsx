"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { PlanGenerationInput } from "@/components/projects/new/types";
import { PlanGenerationForm } from "@/components/projects/new/components/plan-generation-form";
import { ClarificationQuestionsSection } from "@/components/projects/new/components/clarification-questions-section";

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

  // Handle form submission to generate clarification questions
  const handleGenerateQuestions = async (formData: PlanGenerationInput) => {
    setIsGeneratingQuestions(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await apiClient<{ questions: string[] }>(
        "/plan/clarify",
        {
          method: "POST",
          body: formData,
          token,
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

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Not authenticated");
      }
      const requestBody = {
        name: projectInput.name,
        description: projectInput.description,
        tech_stack: projectInput.tech_stack,
        experience_level: projectInput.experience_level,
        team_size: projectInput.team_size,
        time_scale: projectInput.time_scale,
        custom_hours:
          projectInput.time_scale === "custom"
            ? projectInput.custom_hours
            : null,
        clarification_qa: questionAnswers,
      };
      console.log(requestBody);
      const response = await apiClient<{
        structured_plan: any;
        project_id: string;
      }>("/plan/generate-plan", {
        method: "POST",
        body: {
          input_data: { ...projectInput },
          clarification_qa: questionAnswers,
        },
        token,
      });

      // Redirect to the newly created project
      router.push(`/projects/${response.project_id}`);
    } catch (err) {
      console.error("Error generating plan:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate plan. Please try again."
      );
      setStep("clarification"); // Stay on the clarification step
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
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

        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-t-primary-cta rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Generating your project plan...</p>
            <p className="text-sm text-secondary-text mt-2">
              This may take a minute or two. We're crafting a comprehensive
              project plan for you.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
