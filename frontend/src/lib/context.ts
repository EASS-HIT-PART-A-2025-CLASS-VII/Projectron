// src/lib/context.ts

import { apiClient } from "./api";
import { getToken } from "./auth";

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
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<{ context_notes: string }>(`/context/notes/${projectId}`, {
    token,
  });
}

// Update context notes for a project
export async function updateContextNotes(
  projectId: string,
  contextNotes: string
): Promise<{ message: string }> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<{ message: string }>(`/context/notes/${projectId}`, {
    token,
    method: "PUT",
    body: { context_notes: contextNotes },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Generate context for a project (no user message needed)
export async function generateContext(
  projectId: string
): Promise<ContextGenerationResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<ContextGenerationResponse>("/context/generate", {
    token,
    method: "POST",
    body: {
      project_id: projectId,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Get latest generated context for a project
export async function getLatestContext(
  projectId: string
): Promise<ContextGenerationResponse> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<ContextGenerationResponse>(`/context/latest/${projectId}`, {
    token,
  });
}
