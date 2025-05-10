"use client";

import { useState } from "react";
import { Edit, Info } from "lucide-react";
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

import { Subtask } from "../types";
import { EditSubtaskDialog } from "./dialogs/edit-subtask-dialog";

interface SubtaskItemProps {
  subtask: Subtask;
  milestoneIndex: number;
  taskIndex: number;
  subtaskIndex: number;
  onStatusChange: (status: string) => void;
  onUpdate: (updatedSubtask: Subtask) => void;
}

export function SubtaskItem({
  subtask,
  milestoneIndex,
  taskIndex,
  subtaskIndex,
  onStatusChange,
  onUpdate,
}: SubtaskItemProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCheckChange = (checked: boolean) => {
    onStatusChange(checked ? "completed" : "not_started");
  };

  // Since subtasks don't expand/collapse, we just need to handle click events for buttons
  const handleSubtaskClick = (e: React.MouseEvent) => {
    // Just ensure button clicks don't propagate up
    if (
      e.target instanceof HTMLElement &&
      (e.target.closest("button") ||
        e.target.closest('input[type="checkbox"]') ||
        e.target.tagName.toLowerCase() === "button" ||
        e.target.tagName.toLowerCase() === "input")
    ) {
      e.stopPropagation();
    }
  };

  // Determine status badge color
  const getStatusBadgeColor = () => {
    switch (subtask.status) {
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
        className="border border-divider/40 bg-secondary-background/50 hover:shadow-sm transition-all duration-200 cursor-pointer pb-2 pt-2"
        onClick={handleSubtaskClick}
      >
        <div className="p-2 sm:p-3">
          <div className="flex items-start gap-2">
            <Checkbox
              checked={subtask.status === "completed"}
              onCheckedChange={handleCheckChange}
              className="data-[state=checked]:bg-primary-cta data-[state=checked]:border-primary-cta h-4 w-4 mt-0.5 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="flex-1 min-w-0">
              {/* Mobile-optimized layout with stacking items */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* Name and badge properly stacked on mobile, side by side on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mb-2 sm:mb-0 flex-1">
                  <span
                    className={`text-sm mb-1 sm:mb-0 line-clamp-2 sm:line-clamp-1 ${
                      subtask.status === "completed"
                        ? "line-through text-secondary-text"
                        : ""
                    }`}
                  >
                    {subtask.name}
                  </span>

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={`${getStatusBadgeColor()} text-xs self-start sm:self-auto whitespace-nowrap`}
                  >
                    {subtask.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Action buttons in a row for both mobile and desktop */}
                <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-0 self-end sm:self-auto">
                  {/* Description tooltip */}
                  {subtask.description && (
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
                            className="h-6 w-6 p-0 rounded-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Info className="h-3.5 w-3.5 text-secondary-text" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs p-3 bg-secondary-background/95 backdrop-blur-sm"
                        >
                          <p className="text-xs">{subtask.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {/* Edit button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 text-secondary-text" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <EditSubtaskDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        subtask={subtask}
        onUpdate={onUpdate}
        milestoneIndex={milestoneIndex}
        taskIndex={taskIndex}
        subtaskIndex={subtaskIndex}
      />
    </>
  );
}
