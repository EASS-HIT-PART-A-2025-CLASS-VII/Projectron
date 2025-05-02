"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Entity } from "../../types";

interface NewEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEntity: (entity: Entity) => void;
}

export function NewEntityDialog({
  open,
  onOpenChange,
  onAddEntity,
}: NewEntityDialogProps) {
  const [newEntity, setNewEntity] = useState<Entity>({
    name: "",
    description: "",
    properties: [],
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewEntity({
        name: "",
        description: "",
        properties: [],
      });
    }
  }, [open]);

  // Handle submit
  const handleSubmit = () => {
    if (newEntity.name.trim() === "") {
      return;
    }

    onAddEntity(newEntity);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Entity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="entity-name">Entity Name</Label>
            <Input
              id="entity-name"
              placeholder="e.g., User, Product"
              value={newEntity.name}
              onChange={(e) =>
                setNewEntity({ ...newEntity, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entity-description">Description</Label>
            <Textarea
              id="entity-description"
              placeholder="What this entity represents"
              rows={3}
              value={newEntity.description}
              onChange={(e) =>
                setNewEntity({ ...newEntity, description: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Entity</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
