"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Project } from "@/types";
import { getProjectById } from "@/lib/projects";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { ContextGeneratorContainer } from "@/components/projects/context/context-generator-container";
import { ContextExplanation } from "@/components/projects/context/context-explanation";
import { ProjectLoadingSkeleton } from "@/components/projects/project-loading-skeleton";
import { ProjectError } from "@/components/projects/project-error";
import { useAuth } from "@/contexts/auth-context";

export default function ContextGeneratorPage() {
  const { id } = useParams() as { id: string };
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (isLoading) return;
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login...");
      router.push("/auth/login");
      return;
    }

    async function fetchProject() {
      try {
        console.log(`Fetching project for context generator: ${id}`);
        setIsLoadingProject(true);
        const projectData = await getProjectById(id);
        setProject(projectData);
      } catch (err) {
        console.error("Failed to fetch project for context generator:", err);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setIsLoadingProject(false);
      }
    }

    fetchProject();
  }, [id, isAuthenticated, router, isLoading]);

  const handleBackToProject = () => {
    router.push(`/projects/${id}`);
  };

  return (
    <AppLayout>
      <div className="container sm:px-4 px-[0.15rem] py-6 mx-auto">
        {isLoading || isLoadingProject ? (
          <ProjectLoadingSkeleton />
        ) : error ? (
          <ProjectError message={error} />
        ) : project ? (
          <div className="space-y-6 animate-fade-in">
            {/* Header with back button */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToProject}
                className="text-secondary-text hover:text-primary-text"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
            </div>

            {/* Context explanation */}
            <ContextExplanation />

            {/* Context generator container */}
            <ContextGeneratorContainer project={project} />
          </div>
        ) : (
          <ProjectError message="Project not found" />
        )}
      </div>
    </AppLayout>
  );
}
