"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  ArrowUp,
  ChevronUp,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { apiClient } from "@/lib/api";
import {
  DetailedImplementationPlan,
  ImplementationPlanTabProps,
  Milestone,
  Subtask,
  Task,
  UpdateStatusPayload,
  EditItemPayload,
} from "./types";
import { CompletionBar } from "./components/completion-bar";
import { MilestoneItem } from "./components/milestone-item";

export function ImplementationPlanTab({
  project: initialProject,
}: ImplementationPlanTabProps) {
  // Keep track of the most up to date project version
  const [currentProject, setCurrentProject] =
    useState<ImplementationPlanTabProps["project"]>(initialProject);
  const [displayProject, setDisplayProject] =
    useState<ImplementationPlanTabProps["project"]>(initialProject);
  const [expandedMilestones, setExpandedMilestones] = useState<number[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  // Queue for processing updates sequentially
  const updateQueue = useRef<
    Array<{
      type: "status" | "edit";
      payload: UpdateStatusPayload | EditItemPayload;
      projectSnapshot: ImplementationPlanTabProps["project"];
    }>
  >([]);
  const isProcessingRef = useRef(false);

  // Get implementation plan data
  const implementationPlan =
    currentProject.implementation_plan as DetailedImplementationPlan;
  const displayImplementationPlan =
    displayProject.implementation_plan as DetailedImplementationPlan;

  // Initialize with all milestones expanded
  useEffect(() => {
    if (implementationPlan?.milestones) {
      const allIndices = implementationPlan.milestones.map((_, index) => index);
      setExpandedMilestones(allIndices);
    }
  }, []);

  // Reset saving status after showing "saved"
  useEffect(() => {
    if (savingStatus === "saved") {
      const timer = setTimeout(() => {
        if (updateQueue.current.length === 0) {
          setSavingStatus("idle");
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [savingStatus]);

  // Track scroll position for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate overall completion percentage
  const calculateCompletionPercentage = () => {
    if (
      !displayImplementationPlan ||
      !displayImplementationPlan.milestones.length
    )
      return 0;

    let totalItems = 0;
    let completedItems = 0;

    displayImplementationPlan.milestones.forEach((milestone) => {
      milestone.tasks.forEach((task) => {
        // Count subtasks
        task.subtasks.forEach((subtask) => {
          totalItems++;
          if (subtask.status === "completed") completedItems++;
        });
      });
    });

    return totalItems ? (completedItems / totalItems) * 100 : 0;
  };

  // Toggle milestone expansion
  const toggleMilestoneExpansion = (index: number) => {
    setExpandedMilestones((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Collapse all milestones
  const collapseAllMilestones = () => {
    setExpandedMilestones([]);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Process queue sequentially
  const processQueue = async () => {
    // Stop if queue is empty
    if (updateQueue.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = true;
    setSavingStatus("saving");

    // Get next update from queue
    const nextUpdate = updateQueue.current.shift();

    try {
      // Make sure nextUpdate exists
      if (!nextUpdate) {
        throw new Error("Update is undefined");
      }

      // Send to server
      const result = await apiClient<ImplementationPlanTabProps["project"]>(
        `/projects/${currentProject.id}`,
        {
          method: "PUT",
          body: nextUpdate.projectSnapshot,
          token: localStorage.getItem("token") || undefined,
        }
      );

      // Update current project with server response
      setCurrentProject(result);

      // Show saved status
      setSavingStatus("saved");
    } catch (error) {
      console.error("Error saving changes:", error);
      setSavingStatus("idle");

      // Revert display project on error if this was the last item
      if (updateQueue.current.length === 0) {
        setDisplayProject(currentProject);
      }
    } finally {
      // Continue processing queue
      if (updateQueue.current.length > 0) {
        processQueue();
      } else {
        isProcessingRef.current = false;
      }
    }
  };

  // Queue update with immediate UI feedback
  const queueUpdate = (
    type: "status" | "edit",
    payload: UpdateStatusPayload | EditItemPayload,
    updatedProject: ImplementationPlanTabProps["project"]
  ) => {
    // Update UI immediately
    setDisplayProject(updatedProject);

    // Create a deep copy of the project for the queue to prevent reference issues
    const projectSnapshot = JSON.parse(JSON.stringify(updatedProject));

    // Add update to queue
    updateQueue.current.push({
      type,
      payload,
      projectSnapshot,
    });

    // Start processing if not already processing
    if (!isProcessingRef.current) {
      processQueue();
    }
  };

  // Update status of a milestone, task, or subtask
  const updateStatus = (payload: UpdateStatusPayload) => {
    if (!displayImplementationPlan) return;

    // Create a deep copy of the project
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedPlan =
      updatedProject.implementation_plan as DetailedImplementationPlan;

    // Update the status based on the payload
    const { type, milestoneIndex, taskIndex, subtaskIndex, newStatus } =
      payload;

    if (type === "milestone") {
      // Update milestone status
      updatedPlan.milestones[milestoneIndex].status = newStatus;

      // If milestone is completed, complete all tasks and subtasks
      if (newStatus === "completed") {
        updatedPlan.milestones[milestoneIndex].tasks.forEach((task, tIdx) => {
          updatedPlan.milestones[milestoneIndex].tasks[tIdx].status =
            "completed";

          task.subtasks.forEach((_, stIdx) => {
            updatedPlan.milestones[milestoneIndex].tasks[tIdx].subtasks[
              stIdx
            ].status = "completed";
          });
        });
      }
    } else if (type === "task" && taskIndex !== undefined) {
      // Update task status
      updatedPlan.milestones[milestoneIndex].tasks[taskIndex].status =
        newStatus;

      // If task is completed, complete all subtasks
      if (newStatus === "completed") {
        updatedPlan.milestones[milestoneIndex].tasks[
          taskIndex
        ].subtasks.forEach((_, stIdx) => {
          updatedPlan.milestones[milestoneIndex].tasks[taskIndex].subtasks[
            stIdx
          ].status = "completed";
        });
      }

      // Check if all tasks are completed to update milestone status
      const allTasksCompleted = updatedPlan.milestones[
        milestoneIndex
      ].tasks.every((t) => t.status === "completed");

      if (allTasksCompleted) {
        updatedPlan.milestones[milestoneIndex].status = "completed";
      } else if (
        updatedPlan.milestones[milestoneIndex].status === "completed"
      ) {
        updatedPlan.milestones[milestoneIndex].status = "in_progress";
      }
    } else if (
      type === "subtask" &&
      taskIndex !== undefined &&
      subtaskIndex !== undefined
    ) {
      // Update subtask status
      updatedPlan.milestones[milestoneIndex].tasks[taskIndex].subtasks[
        subtaskIndex
      ].status = newStatus;

      // Check if all subtasks are completed to update task status
      const allSubtasksCompleted = updatedPlan.milestones[milestoneIndex].tasks[
        taskIndex
      ].subtasks.every((st) => st.status === "completed");

      if (allSubtasksCompleted) {
        updatedPlan.milestones[milestoneIndex].tasks[taskIndex].status =
          "completed";

        // Check if all tasks are completed to update milestone status
        const allTasksCompleted = updatedPlan.milestones[
          milestoneIndex
        ].tasks.every((t) => t.status === "completed");

        if (allTasksCompleted) {
          updatedPlan.milestones[milestoneIndex].status = "completed";
        }
      } else if (
        updatedPlan.milestones[milestoneIndex].tasks[taskIndex].status ===
        "completed"
      ) {
        updatedPlan.milestones[milestoneIndex].tasks[taskIndex].status =
          "in_progress";
      }
    }

    // Queue update for processing
    queueUpdate("status", payload, updatedProject);
  };

  // Update milestone, task, or subtask data
  const updateItem = (payload: EditItemPayload) => {
    if (!displayImplementationPlan) return;

    // Create a deep copy of the project
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedPlan =
      updatedProject.implementation_plan as DetailedImplementationPlan;

    // Update the item based on the payload
    const { type, milestoneIndex, taskIndex, subtaskIndex, updatedItem } =
      payload;

    if (type === "milestone") {
      updatedPlan.milestones[milestoneIndex] = updatedItem as Milestone;
    } else if (type === "task" && taskIndex !== undefined) {
      updatedPlan.milestones[milestoneIndex].tasks[taskIndex] =
        updatedItem as Task;
    } else if (
      type === "subtask" &&
      taskIndex !== undefined &&
      subtaskIndex !== undefined
    ) {
      updatedPlan.milestones[milestoneIndex].tasks[taskIndex].subtasks[
        subtaskIndex
      ] = updatedItem as Subtask;
    }

    // Queue update for processing
    queueUpdate("edit", payload, updatedProject);
  };

  // If implementation plan not available
  if (
    !implementationPlan ||
    !implementationPlan.milestones ||
    implementationPlan.milestones.length === 0
  ) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Implementation Plan Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have an implementation plan defined yet. You can
          generate one from the Plan Generation page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto sm:px-4">
      {/* Header with Completion Bar and Actions */}
      <div className="mb-6 flex flex-col">
        <div className="flex-1 flex-col">
          <CompletionBar
            completionPercentage={calculateCompletionPercentage()}
          />
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAllMilestones}
            className="h-9"
          >
            <ChevronUp className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Implementation Plan */}
      <div>
        {displayImplementationPlan.milestones.map(
          (milestone, milestoneIndex) => (
            <MilestoneItem
              key={milestoneIndex}
              milestone={milestone}
              milestoneIndex={milestoneIndex}
              expanded={expandedMilestones.includes(milestoneIndex)}
              onToggleExpand={() => toggleMilestoneExpansion(milestoneIndex)}
              onStatusChange={(status) =>
                updateStatus({
                  type: "milestone",
                  milestoneIndex,
                  newStatus: status,
                })
              }
              onTaskStatusChange={(taskIndex, status) =>
                updateStatus({
                  type: "task",
                  milestoneIndex,
                  taskIndex,
                  newStatus: status,
                })
              }
              onSubtaskStatusChange={(taskIndex, subtaskIndex, status) =>
                updateStatus({
                  type: "subtask",
                  milestoneIndex,
                  taskIndex,
                  subtaskIndex,
                  newStatus: status,
                })
              }
              onUpdate={(updatedMilestone) =>
                updateItem({
                  type: "milestone",
                  milestoneIndex,
                  updatedItem: updatedMilestone,
                })
              }
              onTaskUpdate={(taskIndex, updatedTask) =>
                updateItem({
                  type: "task",
                  milestoneIndex,
                  taskIndex,
                  updatedItem: updatedTask,
                })
              }
              onSubtaskUpdate={(taskIndex, subtaskIndex, updatedSubtask) =>
                updateItem({
                  type: "subtask",
                  milestoneIndex,
                  taskIndex,
                  subtaskIndex,
                  updatedItem: updatedSubtask,
                })
              }
            />
          )
        )}
      </div>

      {/* Back to Top Button (fixed) */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full p-0 bg-primary-cta/80 hover:bg-primary-cta shadow-md"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Saving Status Indicator */}
      {savingStatus !== "idle" && (
        <div className="fixed bottom-6 left-6 bg-transparent backdrop-blur-sm rounded-full p-2 shadow-sm">
          {savingStatus === "saving" ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-primary-cta animate-spin" />
              <span className="text-xs text-secondary-text">Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-xs text-secondary-text">Saved</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
