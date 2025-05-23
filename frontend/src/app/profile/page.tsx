// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getUserProfile, UserProfileData } from "@/lib/profile";
import { AppLayout } from "@/components/layout/app-layout";
import { ProfileInfoCard } from "@/components/profile/profile-info-card";
import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Loading skeleton for profile page
function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch profile data on component mount
  useEffect(() => {
    async function fetchProfile() {
      if (authLoading) return;

      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login...");
        router.push("/auth/login");
        return;
      }

      try {
        setIsLoading(true);
        const profileData = await getUserProfile();
        setProfile(profileData);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile information. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [isAuthenticated, authLoading, router]);

  const handleProfileUpdate = (updatedProfile: UserProfileData) => {
    setProfile(updatedProfile);
  };

  if (authLoading || isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-2 py-8">
          <ProfileLoadingSkeleton />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto px-2 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="container mx-auto px-2 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Profile data not found.</AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-2 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-secondary-text">
            Manage your account information and security settings
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96 bg-secondary-background border-divider">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-hover-active"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-hover-active"
            >
              <Settings className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ProfileInfoCard profile={profile} />
              </div>
              <div>
                <EditProfileForm
                  profile={profile}
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ChangePasswordForm />
              </div>
              <div className="space-y-4">
                <div className="bg-secondary-background border border-divider rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary-text">
                    Security Tips
                  </h3>
                  <div className="space-y-3 text-sm text-secondary-text">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-cta rounded-full mt-2 flex-shrink-0"></div>
                      <p>Use a strong, unique password for your account</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-cta rounded-full mt-2 flex-shrink-0"></div>
                      <p>Avoid sharing your login credentials with others</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-cta rounded-full mt-2 flex-shrink-0"></div>
                      <p>Log out from shared or public computers</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-cta rounded-full mt-2 flex-shrink-0"></div>
                      <p>
                        Change your password if you suspect it's been
                        compromised
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary-background border border-divider rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-primary-text">
                    Account Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-divider">
                      <span className="text-sm text-secondary-text">
                        Account Status
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          profile.is_active ? "text-green-400" : "text-gray-400"
                        }`}
                      >
                        {profile.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-divider">
                      <span className="text-sm text-secondary-text">
                        User ID
                      </span>
                      <span className="text-sm font-mono text-primary-text">
                        {profile.id}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-secondary-text">
                        Last Updated
                      </span>
                      <span className="text-sm text-primary-text">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
