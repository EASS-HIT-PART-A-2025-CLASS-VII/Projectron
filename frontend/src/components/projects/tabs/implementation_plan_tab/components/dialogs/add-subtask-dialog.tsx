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

import { Subtask } from "../../types";

interface AddSubtaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (subtask: Subtask) => void;
  milestoneIndex: number;
  taskIndex: number;
}

export function AddSubtaskDialog({
  open,
  onOpenChange,
  onAdd,
  milestoneIndex,
  taskIndex,
}: AddSubtaskDialogProps) {
  const [newSubtask, setNewSubtask] = useState<Subtask>({
    name: "",
    description: "",
    status: "not_started",
  });

  const handleInputChange = (field: keyof Subtask, value: any) => {
    setNewSubtask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!newSubtask.name.trim()) {
      return; // Don't save if name is empty
    }

    onAdd(newSubtask);
    onOpenChange(false);

    // Reset form
    setNewSubtask({
      name: "",
      description: "",
      status: "not_started",
    });
  };

  const handleCancel = () => {
    setNewSubtask({
      name: "",
      description: "",
      status: "not_started",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Add New Subtask</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subtask-name">Name *</Label>
            <Input
              id="subtask-name"
              value={newSubtask.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-primary-background"
              placeholder="Enter subtask name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtask-description">Description</Label>
            <Textarea
              id="subtask-description"
              value={newSubtask.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-primary-background resize-none"
              rows={3}
              placeholder="Enter subtask description (optional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!newSubtask.name.trim()}
            className="text-black font-semibold hover:bg-cta-hover"
          >
            Add Subtask
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
