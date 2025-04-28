"use client";

import { ProjectListItem, ProjectStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { CalendarIcon, FolderIcon, ListChecksIcon } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

// Define status badge variants
const statusVariants: Record<
  ProjectStatus,
  { variant: string; label: string }
> = {
  draft: { variant: "secondary", label: "Draft" },
  in_progress: { variant: "default", label: "In Progress" },
  completed: { variant: "success", label: "Completed" },
  cancelled: { variant: "destructive", label: "Cancelled" },
};

interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Default to draft if status isn't recognized
  const statusConfig =
    statusVariants[project.status as ProjectStatus] || statusVariants.draft;

  // Format date for display
  const createdDate = new Date(project.created_at);
  const formattedDate = formatDistanceToNow(createdDate, { addSuffix: true });

  // Calculate completion percentage if available, or default to 0
  const progressPercentage = project.completion_percentage || 0;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block transition-transform hover:scale-[1.02]"
    >
      <Card className="h-full overflow-hidden hover:bg-hover-active transition-colors duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold line-clamp-1">
              {project.name}
            </h3>
            <Badge
              variant={statusConfig.variant as any}
              className="gradient-border"
            >
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-text text-sm line-clamp-2 mb-4">
            {project.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-secondary-text">
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Created {formattedDate}</span>
            </div>

            {project.milestone_count !== undefined && (
              <div className="flex items-center text-sm text-secondary-text">
                <FolderIcon className="mr-2 h-4 w-4" />
                <span>{project.milestone_count} Milestones</span>
              </div>
            )}

            {project.task_count !== undefined && (
              <div className="flex items-center text-sm text-secondary-text">
                <ListChecksIcon className="mr-2 h-4 w-4" />
                <span>{project.task_count} Tasks</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-4">
          <div className="w-full bg-hover-active rounded-full h-2">
            <div
              className="bg-primary-cta h-full rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
