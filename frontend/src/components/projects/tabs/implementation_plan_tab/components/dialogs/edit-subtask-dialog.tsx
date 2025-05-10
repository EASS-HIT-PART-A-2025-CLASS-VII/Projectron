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

import { Subtask } from "../../types";
import { STATUS_DISPLAY } from "../../constants";

interface EditSubtaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtask: Subtask;
  onUpdate: (updatedSubtask: Subtask) => void;
  milestoneIndex: number;
  taskIndex: number;
  subtaskIndex: number;
}

export function EditSubtaskDialog({
  open,
  onOpenChange,
  subtask,
  onUpdate,
  milestoneIndex,
  taskIndex,
  subtaskIndex,
}: EditSubtaskDialogProps) {
  const [editedSubtask, setEditedSubtask] = useState<Subtask>({ ...subtask });

  const handleInputChange = (field: keyof Subtask, value: any) => {
    setEditedSubtask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onUpdate(editedSubtask);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditedSubtask({ ...subtask });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Edit Subtask</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subtask-name">Name</Label>
            <Input
              id="subtask-name"
              value={editedSubtask.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-primary-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtask-description">Description</Label>
            <Textarea
              id="subtask-description"
              value={editedSubtask.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-primary-background resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtask-status">Status</Label>
            <Select
              value={editedSubtask.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger
                id="subtask-status"
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
