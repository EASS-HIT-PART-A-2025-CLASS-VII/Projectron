// src/lib/profile.ts
import { apiClient } from "./api";
import { getToken } from "./auth";

export interface UserProfileData {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
  total_projects: number;
}

export interface UpdateProfileRequest {
  full_name: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Get user profile data
export async function getUserProfile(): Promise<UserProfileData> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<UserProfileData>("/users/profile", { token });
}

// Update user profile information
export async function updateUserProfile(
  profileData: UpdateProfileRequest
): Promise<UserProfileData> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<UserProfileData>("/users/profile", {
    token,
    method: "PUT",
    body: profileData,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Change user password
export async function changePassword(
  passwordData: ChangePasswordRequest
): Promise<{ message: string }> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return apiClient<{ message: string }>("/users/change-password", {
    token,
    method: "POST",
    body: passwordData,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
