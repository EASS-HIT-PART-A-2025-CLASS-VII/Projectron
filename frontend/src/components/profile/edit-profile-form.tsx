// src/components/profile/edit-profile-form.tsx
"use client";

import { useState } from "react";
import {
  UserProfileData,
  UpdateProfileRequest,
  updateUserProfile,
} from "@/lib/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, User } from "lucide-react";
interface EditProfileFormProps {
  profile: UserProfileData;
  onProfileUpdate: (updatedProfile: UserProfileData) => void;
}

export function EditProfileForm({
  profile,
  onProfileUpdate,
}: EditProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullName, setFullName] = useState(profile.full_name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: UpdateProfileRequest = {
        full_name: fullName.trim(),
      };

      const updatedProfile = await updateUserProfile(updateData);
      onProfileUpdate(updatedProfile);

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = fullName.trim() !== profile.full_name;

  return (
    <Card className="bg-secondary-background border-divider">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-primary-background border-divider focus:border-primary-cta"
              placeholder="Enter your full name"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              className="bg-primary-background border-divider text-secondary-text"
              disabled
              readOnly
            />
            <p className="text-xs text-secondary-text">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-800 bg-green-900/20">
              <AlertDescription className="text-green-400">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isLoading || !hasChanges}
            className="w-full bg-primary-cta hover:bg-cta-hover text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
