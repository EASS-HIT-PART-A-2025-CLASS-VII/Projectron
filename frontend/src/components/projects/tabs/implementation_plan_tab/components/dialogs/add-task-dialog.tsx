"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Task } from "../../types";
import { PRIORITY_OPTIONS } from "../../constants";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (task: Task) => void;
  milestoneIndex: number;
}

export function AddTaskDialog({
  open,
  onOpenChange,
  onAdd,
  milestoneIndex,
}: AddTaskDialogProps) {
  const [newTask, setNewTask] = useState<Task>({
    name: "",
    description: "",
    status: "not_started",
    priority: "medium",
    estimated_hours: 8,
    dependencies: [],
    components_affected: [],
    apis_affected: [],
    subtasks: [],
  });

  const handleInputChange = (field: keyof Task, value: any) => {
    setNewTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!newTask.name.trim()) {
      return; // Don't save if name is empty
    }

    onAdd(newTask);
    onOpenChange(false);

    // Reset form
    setNewTask({
      name: "",
      description: "",
      status: "not_started",
      priority: "medium",
      estimated_hours: 8,
      dependencies: [],
      components_affected: [],
      apis_affected: [],
      subtasks: [],
    });
  };

  const handleCancel = () => {
    setNewTask({
      name: "",
      description: "",
      status: "not_started",
      priority: "medium",
      estimated_hours: 8,
      dependencies: [],
      components_affected: [],
      apis_affected: [],
      subtasks: [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Name *</Label>
            <Input
              id="task-name"
              value={newTask.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-primary-background"
              placeholder="Enter task name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-primary-background resize-none"
              rows={3}
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger
                  id="task-priority"
                  className="bg-primary-background"
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option:any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-hours">Estimated Hours</Label>
              <Input
                id="task-hours"
                type="number"
                min={1}
                max={100}
                value={newTask.estimated_hours}
                onChange={(e) =>
                  handleInputChange(
                    "estimated_hours",
                    parseInt(e.target.value) || 8
                  )
                }
                className="bg-primary-background"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!newTask.name.trim()}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
