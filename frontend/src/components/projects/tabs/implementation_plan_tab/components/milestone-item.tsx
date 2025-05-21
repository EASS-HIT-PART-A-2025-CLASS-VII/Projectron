"use client";

import { useState, useRef } from "react";
import { Edit, ChevronDown, ChevronUp, Calendar, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Milestone, Subtask, Task } from "../types";
import { TaskItem } from "./task-item";
import { EditMilestoneDialog } from "./dialogs/edit-milestone-dialog";

interface MilestoneItemProps {
  milestone: Milestone;
  milestoneIndex: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onStatusChange: (status: string) => void;
  onTaskStatusChange: (taskIndex: number, status: string) => void;
  onSubtaskStatusChange: (
    taskIndex: number,
    subtaskIndex: number,
    status: string
  ) => void;
  onUpdate: (updatedMilestone: Milestone) => void;
  onTaskUpdate: (taskIndex: number, updatedTask: Task) => void;
  onSubtaskUpdate: (
    taskIndex: number,
    subtaskIndex: number,
    updatedSubtask: Subtask
  ) => void;
}

export function MilestoneItem({
  milestone,
  milestoneIndex,
  expanded,
  onToggleExpand,
  onStatusChange,
  onTaskStatusChange,
  onSubtaskStatusChange,
  onUpdate,
  onTaskUpdate,
  onSubtaskUpdate,
}: MilestoneItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const milestoneRef = useRef<HTMLDivElement>(null);

  const handleCheckChange = (checked: boolean) => {
    onStatusChange(checked ? "completed" : "not_started");
  };

  // Handle click on the milestone card
  const handleMilestoneClick = (e: React.MouseEvent) => {
    // Don't toggle if the click was on a button or checkbox
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest("button") ||
        e.target.closest('input[type="checkbox"]') ||
        e.target.tagName.toLowerCase() === "button" ||
        e.target.tagName.toLowerCase() === "input")
    ) {
      return;
    }

    onToggleExpand();
  };

  // Calculate completion statistics
  const completedTasks = milestone.tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const totalTasks = milestone.tasks.length;
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Determine status badge color
  const getStatusBadgeColor = () => {
    switch (milestone.status) {
      case "completed":
        return "bg-green-950/20 text-green-400 border-green-600/30";
      case "in_progress":
        return "bg-blue-950/20 text-blue-400 border-blue-600/30";
      default:
        return "bg-secondary-background text-secondary-text border-gray-600";
    }
  };

  return (
    <div
      ref={milestoneRef}
      id={`milestone-${milestoneIndex}`}
      className="mb-6 overflow-hidden"
    >
      <Card
        className="border border-divider bg-secondary-background hover:shadow-md transition-all duration-200 cursor-pointer pb-2"
        onClick={handleMilestoneClick}
      >
        <div className="p-2 sm:px-4 flex sm:flex-row flex-col justify-between">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={milestone.status === "completed"}
              onCheckedChange={handleCheckChange}
              className="data-[state=checked]:bg-primary-cta data-[state=checked]:border-primary-cta h-4 w-4 mt-[0.3rem]"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex-1">
              {/* Mobile-optimized header section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex-1">
                  {/* Title and badge in flex row for mobile and desktop */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3
                      className={`text-lg font-semibold ${
                        milestone.status === "completed"
                          ? "line-through text-secondary-text"
                          : ""
                      }`}
                    >
                      {milestone.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`${getStatusBadgeColor()} whitespace-nowrap`}
                    >
                      {milestone.status.replace("_", " ")}
                    </Badge>
                  </div>

                  {/* Due date and progress info stacked for better mobile readability */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-sm">
                    <div className="text-secondary-text flex items-center">
                      <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span>Due in {milestone.due_date_offset} days</span>
                    </div>

                    <div className="hidden sm:block text-secondary-text">•</div>

                    <div className="text-secondary-text">
                      Progress: {completedTasks}/{totalTasks} tasks (
                      {completionPercent}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-primary-background/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      completionPercent === 100
                        ? "bg-green-500/80"
                        : completionPercent > 0
                        ? "bg-primary-cta/60"
                        : ""
                    }`}
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Action buttons positioned in a row for both mobile and desktop */}
          <div className="flex items-center gap-3 mt-auto bottom-0 w-fit right-0 relative h-fit ml-auto">
            {/* Description tooltip */}
            {milestone.description && (
              <TooltipProvider>
                <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
                  <TooltipTrigger
                    asChild
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip(!showTooltip);
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 rounded-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="h-4.5 w-4.5 text-secondary-text" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs p-4 bg-secondary-background/95 backdrop-blur-sm"
                  >
                    <p>{milestone.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Edit button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditDialog(true);
              }}
            >
              <Edit className="h-4.5 w-4.5 text-secondary-text" />
            </Button>

            {/* Expand/collapse button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
            >
              {expanded ? (
                <ChevronUp className="h-5 w-5 text-secondary-text" />
              ) : (
                <ChevronDown className="h-5 w-5 text-secondary-text" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Tasks */}
      {expanded && milestone.tasks.length > 0 && (
        <div className="mt-2 ml-3 sm:ml-6 border-l border-divider/40 pl-2 sm:pl-4 space-y-3">
          {milestone.tasks.map((task, taskIndex) => (
            <TaskItem
              key={taskIndex}
              task={task}
              milestoneIndex={milestoneIndex}
              taskIndex={taskIndex}
              onStatusChange={(status) => onTaskStatusChange(taskIndex, status)}
              onSubtaskStatusChange={(subtaskIndex, status) =>
                onSubtaskStatusChange(taskIndex, subtaskIndex, status)
              }
              onUpdate={(updatedTask) => onTaskUpdate(taskIndex, updatedTask)}
              onSubtaskUpdate={(subtaskIndex, updatedSubtask) =>
                onSubtaskUpdate(taskIndex, subtaskIndex, updatedSubtask)
              }
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <EditMilestoneDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        milestone={milestone}
        onUpdate={onUpdate}
        milestoneIndex={milestoneIndex}
      />
    </div>
  );
}
