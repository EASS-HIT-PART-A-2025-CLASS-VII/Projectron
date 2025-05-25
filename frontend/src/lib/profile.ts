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
  try {
    return await apiClient<{ message: string }>("/users/change-password", {
      method: "POST",
      body: passwordData,
    });
  } catch (error) {
    // The error handling in apiClient should already extract the detail message
    // but we can add specific handling here if needed
    if (error instanceof Error) {
      // Check for specific error patterns
      if (error.message.includes("Current password is incorrect")) {
        throw new Error(
          "The current password you entered is incorrect. Please try again."
        );
      } else if (error.message.includes("must be different")) {
        throw new Error(
          "Your new password must be different from your current password."
        );
      } else if (error.message.includes("at least 8 characters")) {
        throw new Error(
          "Your new password must be at least 8 characters long."
        );
      }
    }

    // Re-throw the original error if no specific handling
    throw error;
  }
}
