// src/lib/profile.ts
import { apiClient } from "./api";

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
  // No token check needed - cookies sent automatically
  // Server will return 401 if not authenticated, apiClient handles redirect
  return apiClient<UserProfileData>("/users/profile");
}

// Update user profile information
export async function updateUserProfile(
  profileData: UpdateProfileRequest
): Promise<UserProfileData> {
  // No token check needed - cookies sent automatically
  return apiClient<UserProfileData>("/users/profile", {
    method: "PUT",
    body: profileData, // apiClient will stringify and set Content-Type
  });
}

// Change user password
export async function changePassword(
  passwordData: ChangePasswordRequest
): Promise<{ message: string }> {
  // No token check needed - cookies sent automatically
  return apiClient<{ message: string }>("/users/change-password", {
    method: "POST",
    body: passwordData, // apiClient will stringify and set Content-Type
  });
}
