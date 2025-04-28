// src/lib/projects.ts
import { Project, ProjectListItem, ProjectsResponse } from "@/types";
import { apiClient } from "./api";
import { getToken } from "./auth";

// Get all projects for the current user
export async function getProjects(): Promise<ProjectListItem[]> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<ProjectListItem[]>("/projects", { token });
}

// Create a new project
export async function createProject(
  projectData: Partial<ProjectListItem>
): Promise<ProjectListItem> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<ProjectListItem>("/projects", {
    token,
    method: "POST",
    body: JSON.stringify(projectData),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Get a single project by ID with all its details
export async function getProjectById(id: string): Promise<Project> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return apiClient<Project>(`/projects/${id}`, { token });
}

// Update project basic information
export async function updateProject(
  id: string,
  projectData: Partial<Project>
): Promise<Project> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return apiClient<Project>(`/projects/${id}`, {
    method: "PUT",
    body: projectData,
    token,
  });
}

// Delete a project
export async function deleteProject(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/projects/${id}`, {
    method: "DELETE",
  });
}
