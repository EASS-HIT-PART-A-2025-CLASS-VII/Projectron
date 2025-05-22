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
import { STATUS_DISPLAY, PRIORITY_OPTIONS } from "../../constants";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdate: (updatedTask: Task) => void;
  milestoneIndex: number;
  taskIndex: number;
}

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  onUpdate,
  milestoneIndex,
  taskIndex,
}: EditTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task>({
    ...task,
  });

  const handleInputChange = (field: keyof Task, value: any) => {
    setEditedTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onUpdate(editedTask);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">Name</Label>
            <Input
              id="task-name"
              value={editedTask.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-primary-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={editedTask.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-primary-background resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                value={editedTask.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger
                  id="task-status"
                  className="bg-primary-background"
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_DISPLAY).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                value={editedTask.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger
                  id="task-priority"
                  className="bg-primary-background"
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-hours">Estimated Hours</Label>
            <Input
              id="task-hours"
              type="number"
              min={1}
              max={100}
              value={editedTask.estimated_hours}
              onChange={(e) =>
                handleInputChange(
                  "estimated_hours",
                  parseInt(e.target.value) || 1
                )
              }
              className="bg-primary-background"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
