"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Project } from "@/types";
import { getProjectById } from "@/lib/projects";
import { AppLayout } from "@/components/layout/app-layout";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectTabs } from "@/components/projects/project-tabs";
import { ProjectLoadingSkeleton } from "@/components/projects/project-loading-skeleton";
import { ProjectError } from "@/components/projects/project-error";
import { useAuth } from "@/contexts/auth-context";

export default function ProjectPage() {
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
        console.log(`Fetching project with ID: ${id}`);
        setIsLoadingProject(true);
        const projectData = await getProjectById(id);
        console.log(projectData);
        setProject(projectData);
      } catch (err) {
        console.error("Failed to fetch project:", err);
        setError("Failed to load project details. Please try again later.");
      } finally {
        setIsLoadingProject(false);
      }
    }

    fetchProject();
  }, [id, isAuthenticated, router, isLoading]);

  return (
    <AppLayout>
      <div className="container sm:px-4 px-[0.15rem] py-6 mx-auto">
        {isLoading || isLoadingProject ? (
          <ProjectLoadingSkeleton />
        ) : error ? (
          <ProjectError message={error} />
        ) : project ? (
          <div className="space-y-6 animate-fade-in">
            <ProjectHeader project={project} setProject={setProject} />
            <ProjectTabs project={project} />
          </div>
        ) : (
          <ProjectError message="Project not found" />
        )}
      </div>
    </AppLayout>
  );
}
