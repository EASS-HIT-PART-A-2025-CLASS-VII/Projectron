// src/components/profile/profile-info-card.tsx
"use client";

import { UserProfileData } from "@/lib/profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Mail, User, FolderOpen } from "lucide-react";

interface ProfileInfoCardProps {
  profile: UserProfileData;
}

export function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAccountAge = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  };

  return (
    <Card className="bg-secondary-background border-divider">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-transparent text-white gradient-border gradient-border-full text-2xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-primary-text">
              {profile.full_name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                variant={profile.is_active ? "default" : "secondary"}
                className={
                  profile.is_active
                    ? "bg-green-900/20 text-green-400 border-green-800"
                    : "bg-gray-900/20 text-gray-400 border-gray-800"
                }
              >
                {profile.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary-background">
            <Mail className="h-5 w-5 text-secondary-text" />
            <div>
              <p className="text-sm font-medium text-primary-text">Email</p>
              <p className="text-sm text-secondary-text">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary-background">
            <FolderOpen className="h-5 w-5 text-secondary-text" />
            <div>
              <p className="text-sm font-medium text-primary-text">
                Total Projects
              </p>
              <p className="text-sm text-secondary-text">
                {profile.total_projects} project
                {profile.total_projects !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary-background">
            <CalendarDays className="h-5 w-5 text-secondary-text" />
            <div>
              <p className="text-sm font-medium text-primary-text">
                Member Since
              </p>
              <p className="text-sm text-secondary-text">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary-background">
            <User className="h-5 w-5 text-secondary-text" />
            <div>
              <p className="text-sm font-medium text-primary-text">
                Account Age
              </p>
              <p className="text-sm text-secondary-text">
                {getAccountAge(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


