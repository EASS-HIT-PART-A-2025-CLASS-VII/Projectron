// src/lib/projects.ts
import { Project, ProjectListItem, ProjectsResponse } from "@/types";
import { apiClient } from "./api";

// Get all projects for the current user
export async function getProjects(): Promise<ProjectListItem[]> {
  // No token check needed - cookies sent automatically
  // Server will return 401 if not authenticated, apiClient handles redirect
  return apiClient<ProjectListItem[]>("/projects");
}

// Create a new project
export async function createProject(
  projectData: Partial<ProjectListItem>
): Promise<ProjectListItem> {
  // No token check needed - cookies sent automatically
  return apiClient<ProjectListItem>("/projects", {
    method: "POST",
    body: projectData, // apiClient will stringify this
  });
}

// Get a single project by ID with all its details
export async function getProjectById(id: string): Promise<Project> {
  // No token check needed - cookies sent automatically
  return apiClient<Project>(`/projects/${id}`);
}

// Update project basic information
export async function updateProject(
  id: string,
  projectData: Partial<Project>
): Promise<Project> {
  // No token check needed - cookies sent automatically
  return apiClient<Project>(`/projects/${id}`, {
    method: "PUT",
    body: projectData,
  });
}

// Delete a project
export async function deleteProject(id: string): Promise<{ message: string }> {
  // No token check needed - cookies sent automatically
  return apiClient<{ message: string }>(`/projects/${id}`, {
    method: "DELETE",
  });
}
