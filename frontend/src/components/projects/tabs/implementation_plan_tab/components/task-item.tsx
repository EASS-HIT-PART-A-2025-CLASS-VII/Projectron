"use client";

import { useState } from "react";
import { Edit, ChevronDown, ChevronUp, Info, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Task } from "../types";
import { SubtaskItem } from "./subtask-item";
import { PRIORITY_COLORS } from "../constants";
import { EditTaskDialog } from "./dialogs/edit-task-dialog";

interface TaskItemProps {
  task: Task;
  milestoneIndex: number;
  taskIndex: number;
  onStatusChange: (status: string) => void;
  onSubtaskStatusChange: (subtaskIndex: number, status: string) => void;
  onUpdate: (updatedTask: Task) => void;
  onSubtaskUpdate: (subtaskIndex: number, updatedSubtask: any) => void;
}

export function TaskItem({
  task,
  milestoneIndex,
  taskIndex,
  onStatusChange,
  onSubtaskStatusChange,
  onUpdate,
  onSubtaskUpdate,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleExpanded = () => setExpanded(!expanded);

  const handleCheckChange = (checked: boolean) => {
    onStatusChange(checked ? "completed" : "not_started");
  };

  // Handle click on the task card
  const handleTaskClick = (e: React.MouseEvent) => {
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

    toggleExpanded();
  };

  // Determine status badge color
  const getStatusBadgeColor = () => {
    switch (task.status) {
      case "completed":
        return "bg-green-950/20 text-green-400 border-green-600/30";
      case "in_progress":
        return "bg-blue-950/20 text-blue-400 border-blue-600/30";
      default:
        return "bg-secondary-background text-secondary-text border-gray-600";
    }
  };

  return (
    <>
      <Card
        className="border border-divider/60 bg-secondary-background/70 hover:shadow-sm transition-all duration-200 cursor-pointer pb-0 pt-2"
        onClick={handleTaskClick}
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Checkbox
              checked={task.status === "completed"}
              onCheckedChange={handleCheckChange}
              className="data-[state=checked]:bg-primary-cta data-[state=checked]:border-primary-cta h-4 w-4 sm:h-4 sm:w-4 mt-[0.14rem] flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex-1 min-w-0">
              {/* Main content area with improved mobile layout */}
              <div className="flex flex-col justify-between w-full">
                {/* Task name and metadata */}
                <div className="flex-1 mb-2">
                  {/* Task name - full width on mobile */}
                  <div className="flex items-center mb-1.5">
                    <span
                      className={`font-medium mr-2 ${
                        task.status === "completed"
                          ? "line-through text-secondary-text"
                          : ""
                      }`}
                    >
                      {task.name}
                    </span>
                  </div>
                  {/* Badges and metadata in a wrapping flex row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={`${getStatusBadgeColor()} text-xs whitespace-nowrap`}
                    >
                      {task.status.replace("_", " ")}
                    </Badge>

                    {/* Priority Badge - visible on all screens */}
                    <Badge
                      className={`${
                        PRIORITY_COLORS[
                          task.priority as keyof typeof PRIORITY_COLORS
                        ] || PRIORITY_COLORS.medium
                      } text-xs whitespace-nowrap`}
                      variant="outline"
                    >
                      {task.priority}
                    </Badge>

                    {/* Estimated Hours */}
                    <div className="flex items-center text-secondary-text text-xs whitespace-nowrap">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span>{task.estimated_hours}h</span>
                    </div>
                    {/* Action buttons in a row for both mobile and desktop */}
                    <div className="flex items-center justify-end sm:gap-0 mt-1 sm:mt-0 ml-auto">
                      {/* Description tooltip */}
                      {task.description && (
                        <TooltipProvider>
                          <Tooltip
                            open={showTooltip}
                            onOpenChange={setShowTooltip}
                          >
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
                                className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary-text" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-xs p-3 bg-secondary-background/95 backdrop-blur-sm"
                            >
                              <p className="text-sm">{task.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {/* Edit button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary-text" />
                      </Button>

                      {/* Expand/collapse button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded();
                        }}
                      >
                        {expanded ? (
                          <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary-text" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary-text" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Subtasks */}
      {expanded && task.subtasks.length > 0 && (
        <div className="ml-3 sm:ml-6 pl-2 sm:pl-4 border-l border-divider/30 mt-2 space-y-2">
          {task.subtasks.map((subtask, subtaskIndex) => (
            <SubtaskItem
              key={subtaskIndex}
              subtask={subtask}
              milestoneIndex={milestoneIndex}
              taskIndex={taskIndex}
              subtaskIndex={subtaskIndex}
              onStatusChange={(status) =>
                onSubtaskStatusChange(subtaskIndex, status)
              }
              onUpdate={(updatedSubtask) =>
                onSubtaskUpdate(subtaskIndex, updatedSubtask)
              }
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <EditTaskDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        task={task}
        onUpdate={onUpdate}
        milestoneIndex={milestoneIndex}
        taskIndex={taskIndex}
      />
    </>
  );
}
