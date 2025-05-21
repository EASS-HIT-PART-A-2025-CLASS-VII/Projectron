"use client";

import { ProjectListItem } from "@/types";
import { ProjectCard } from "./project-card";
import { EmptyProjects } from "./empty-projects";

interface ProjectsListProps {
  projects: ProjectListItem[];
}

export function ProjectsList({ projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return <EmptyProjects />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
