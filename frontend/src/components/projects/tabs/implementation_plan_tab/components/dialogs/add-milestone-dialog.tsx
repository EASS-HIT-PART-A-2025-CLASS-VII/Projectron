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

import { Milestone } from "../../types";

interface AddMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (milestone: Milestone) => void;
}

export function AddMilestoneDialog({
  open,
  onOpenChange,
  onAdd,
}: AddMilestoneDialogProps) {
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    name: "",
    description: "",
    status: "not_started",
    due_date_offset: 7,
    tasks: [],
  });

  const handleInputChange = (field: keyof Milestone, value: any) => {
    setNewMilestone((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!newMilestone.name.trim()) {
      return; // Don't save if name is empty
    }

    onAdd(newMilestone);
    onOpenChange(false);

    // Reset form
    setNewMilestone({
      name: "",
      description: "",
      status: "not_started",
      due_date_offset: 7,
      tasks: [],
    });
  };

  const handleCancel = () => {
    setNewMilestone({
      name: "",
      description: "",
      status: "not_started",
      due_date_offset: 7,
      tasks: [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="milestone-name">Name *</Label>
            <Input
              id="milestone-name"
              value={newMilestone.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-primary-background"
              placeholder="Enter milestone name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-description">Description</Label>
            <Textarea
              id="milestone-description"
              value={newMilestone.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-primary-background resize-none"
              rows={3}
              placeholder="Enter milestone description (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-due-date">Due Date Offset (days)</Label>
            <Input
              id="milestone-due-date"
              type="number"
              min={1}
              value={newMilestone.due_date_offset}
              onChange={(e) =>
                handleInputChange(
                  "due_date_offset",
                  parseInt(e.target.value) || 7
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
          <Button
            onClick={handleSave}
            disabled={!newMilestone.name.trim()}
            className="text-black font-semibold hover:bg-cta-hover"
          >
            Add Milestone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
