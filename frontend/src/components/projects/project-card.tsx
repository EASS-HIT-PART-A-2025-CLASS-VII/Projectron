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

// Define status badge variants with custom colors matching the dark theme
const statusVariants: Record<
  ProjectStatus,
  { className: string; label: string; progressColor: string }
> = {
  draft: {
    className: "bg-transparent text-blue-400 border-blue-500/30",
    label: "Draft",
    progressColor: "bg-transparent",
  },
  active: {
    className: "bg-transparent text-amber-400 border-amber-500/30 0",
    label: "Active",
    progressColor: "bg-amber-500",
  },
  completed: {
    className: "bg-transparent text-emerald-400 border-emerald-500/30 ",
    label: "Completed",
    progressColor: "bg-emerald-500",
  },
  cancelled: {
    className: "bg-transparent text-red-400 border-red-500/30",
    label: "Cancelled",
    progressColor: "bg-red-500",
  },
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
      className="block transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20"
    >
      <Card className="h-full overflow-hidden hover:bg-hover-active transition-all duration-200 border border-secondary-background/50 hover:border-secondary-background">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold line-clamp-1">
              {project.name}
            </h3>
            <Badge
              className={`${statusConfig.className} transition-all duration-200 font-medium`}
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
              className={`${statusConfig.progressColor} h-full rounded-full transition-all duration-300`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
