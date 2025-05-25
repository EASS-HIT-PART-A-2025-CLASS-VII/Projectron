// src/lib/context.ts
import { apiClient } from "./api";

export interface ContextGenerationRequest {
  project_id: string;
}

export interface ContextGenerationResponse {
  success: boolean;
  context_message?: string;
  error?: string;
}

export interface UpdateContextNotesRequest {
  context_notes: string;
}

// Get context notes for a project
export async function getContextNotes(
  projectId: string
): Promise<{ context_notes: string }> {
  // No token check needed - cookies sent automatically
  // Server will return 401 if not authenticated, apiClient handles redirect
  return apiClient<{ context_notes: string }>(`/context/notes/${projectId}`);
}

// Update context notes for a project
export async function updateContextNotes(
  projectId: string,
  contextNotes: string
): Promise<{ message: string }> {
  // No token check needed - cookies sent automatically
  return apiClient<{ message: string }>(`/context/notes/${projectId}`, {
    method: "PUT",
    body: { context_notes: contextNotes }, // apiClient will stringify and set Content-Type
  });
}

// Generate context for a project (no user message needed)
export async function generateContext(
  projectId: string
): Promise<ContextGenerationResponse> {
  // No token check needed - cookies sent automatically
  return apiClient<ContextGenerationResponse>("/context/generate", {
    method: "POST",
    body: {
      project_id: projectId,
    }, // apiClient will stringify and set Content-Type
  });
}

// Get latest generated context for a project
export async function getLatestContext(
  projectId: string
): Promise<ContextGenerationResponse> {
  // No token check needed - cookies sent automatically
  return apiClient<ContextGenerationResponse>(`/context/latest/${projectId}`);
}
