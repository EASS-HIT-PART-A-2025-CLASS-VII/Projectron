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

import { Milestone } from "../../types";
import { STATUS_DISPLAY } from "../../constants";

interface EditMilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: Milestone;
  onUpdate: (updatedMilestone: Milestone) => void;
  milestoneIndex: number;
}

export function EditMilestoneDialog({
  open,
  onOpenChange,
  milestone,
  onUpdate,
  milestoneIndex,
}: EditMilestoneDialogProps) {
  const [editedMilestone, setEditedMilestone] = useState<Milestone>({
    ...milestone,
  });

  const handleInputChange = (field: keyof Milestone, value: any) => {
    setEditedMilestone((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onUpdate(editedMilestone);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditedMilestone({ ...milestone });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Edit Milestone</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="milestone-name">Name</Label>
            <Input
              id="milestone-name"
              value={editedMilestone.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-primary-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone-description">Description</Label>
            <Textarea
              id="milestone-description"
              value={editedMilestone.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-primary-background resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-status">Status</Label>
              <Select
                value={editedMilestone.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger
                  id="milestone-status"
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
              <Label htmlFor="milestone-due-date">Due Date Offset (days)</Label>
              <Input
                id="milestone-due-date"
                type="number"
                min={0}
                value={editedMilestone.due_date_offset}
                onChange={(e) =>
                  handleInputChange(
                    "due_date_offset",
                    parseInt(e.target.value) || 0
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
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
