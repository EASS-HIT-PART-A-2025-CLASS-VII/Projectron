"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Resource } from "../../types";

interface NewResourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddResource: (resource: Resource) => void;
}

export function NewResourceDialog({
  open,
  onOpenChange,
  onAddResource,
}: NewResourceDialogProps) {
  const [newResource, setNewResource] = useState<Resource>({
    name: "",
    description: "",
    endpoints: [],
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewResource({
        name: "",
        description: "",
        endpoints: [],
      });
    }
  }, [open]);

  // Handle submit
  const handleSubmit = () => {
    if (newResource.name.trim() === "") {
      return;
    }

    onAddResource(newResource);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Resource</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resource-name">Resource Name</Label>
            <Input
              id="resource-name"
              placeholder="e.g., Users, Orders, Products"
              value={newResource.name}
              onChange={(e) =>
                setNewResource({ ...newResource, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-description">Description</Label>
            <Textarea
              id="resource-description"
              placeholder="What this resource represents"
              rows={3}
              value={newResource.description}
              onChange={(e) =>
                setNewResource({ ...newResource, description: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Resource</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
