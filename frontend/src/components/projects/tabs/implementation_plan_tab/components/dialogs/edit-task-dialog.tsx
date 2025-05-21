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
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Task } from "../../types";
import { STATUS_DISPLAY, PRIORITY_DISPLAY } from "../../constants";

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
  const [editedTask, setEditedTask] = useState<Task>({ ...task });
  const [newDependency, setNewDependency] = useState("");
  const [newComponent, setNewComponent] = useState("");
  const [newApi, setNewApi] = useState("");

  const handleInputChange = (field: keyof Task, value: any) => {
    setEditedTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddDependency = () => {
    if (!newDependency.trim()) return;

    const updatedDependencies = [
      ...editedTask.dependencies,
      newDependency.trim(),
    ];
    setEditedTask((prev) => ({
      ...prev,
      dependencies: updatedDependencies,
    }));
    setNewDependency("");
  };

  const handleRemoveDependency = (index: number) => {
    const updatedDependencies = [...editedTask.dependencies];
    updatedDependencies.splice(index, 1);
    setEditedTask((prev) => ({
      ...prev,
      dependencies: updatedDependencies,
    }));
  };

  const handleAddComponent = () => {
    if (!newComponent.trim()) return;

    const updatedComponents = [
      ...editedTask.components_affected,
      newComponent.trim(),
    ];
    setEditedTask((prev) => ({
      ...prev,
      components_affected: updatedComponents,
    }));
    setNewComponent("");
  };

  const handleRemoveComponent = (index: number) => {
    const updatedComponents = [...editedTask.components_affected];
    updatedComponents.splice(index, 1);
    setEditedTask((prev) => ({
      ...prev,
      components_affected: updatedComponents,
    }));
  };

  const handleAddApi = () => {
    if (!newApi.trim()) return;

    const updatedApis = [...editedTask.apis_affected, newApi.trim()];
    setEditedTask((prev) => ({
      ...prev,
      apis_affected: updatedApis,
    }));
    setNewApi("");
  };

  const handleRemoveApi = (index: number) => {
    const updatedApis = [...editedTask.apis_affected];
    updatedApis.splice(index, 1);
    setEditedTask((prev) => ({
      ...prev,
      apis_affected: updatedApis,
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
      <DialogContent className="sm:max-w-lg bg-secondary-background max-h-[90vh] overflow-y-auto">
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
                  {Object.entries(PRIORITY_DISPLAY).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
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
              max={300}
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

          {/* Dependencies */}
          <div className="space-y-2">
            <Label>Dependencies</Label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
              {editedTask.dependencies.map((dep, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-primary-background text-secondary-text flex items-center gap-1"
                >
                  {dep}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:text-red-400"
                    onClick={() => handleRemoveDependency(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add dependency..."
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                className="bg-primary-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDependency();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddDependency}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Components Affected */}
          <div className="space-y-2">
            <Label>Components Affected</Label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
              {editedTask.components_affected.map((comp, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-primary-background text-primary-cta flex items-center gap-1"
                >
                  {comp}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:text-red-400"
                    onClick={() => handleRemoveComponent(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add component..."
                value={newComponent}
                onChange={(e) => setNewComponent(e.target.value)}
                className="bg-primary-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddComponent();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddComponent}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* APIs Affected */}
          <div className="space-y-2">
            <Label>APIs Affected</Label>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
              {editedTask.apis_affected.map((api, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-primary-background text-blue-500 flex items-center gap-1"
                >
                  {api}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:text-red-400"
                    onClick={() => handleRemoveApi(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add API..."
                value={newApi}
                onChange={(e) => setNewApi(e.target.value)}
                className="bg-primary-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddApi();
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddApi}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
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
