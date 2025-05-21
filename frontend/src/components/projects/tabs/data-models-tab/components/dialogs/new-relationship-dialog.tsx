"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Entity, Relationship } from "../../types";
import { relationshipTypes } from "../../constants";

interface NewRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRelationship: (relationship: Relationship) => void;
  entities: Entity[];
}

export function NewRelationshipDialog({
  open,
  onOpenChange,
  onAddRelationship,
  entities,
}: NewRelationshipDialogProps) {
  const [newRelationship, setNewRelationship] = useState<Relationship>({
    source_entity: "",
    target_entity: "",
    type: "one-to-many",
    description: "",
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open && entities.length > 0) {
      setNewRelationship({
        source_entity: entities[0].name,
        target_entity:
          entities.length > 1 ? entities[1].name : entities[0].name,
        type: "one-to-many",
        description: "",
      });
    }
  }, [open, entities]);

  // Handle submit
  const handleSubmit = () => {
    if (
      newRelationship.source_entity === "" ||
      newRelationship.target_entity === ""
    ) {
      return;
    }

    if (newRelationship.source_entity === newRelationship.target_entity) {
      return;
    }

    onAddRelationship(newRelationship);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Relationship</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="relationship-source">Source Entity</Label>
            <Select
              value={newRelationship.source_entity}
              onValueChange={(value) =>
                setNewRelationship({ ...newRelationship, source_entity: value })
              }
            >
              <SelectTrigger id="relationship-source">
                <SelectValue placeholder="Select source entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.name} value={entity.name}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship-type">Relationship Type</Label>
            <Select
              value={newRelationship.type}
              onValueChange={(value) =>
                setNewRelationship({ ...newRelationship, type: value })
              }
            >
              <SelectTrigger id="relationship-type">
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship-target">Target Entity</Label>
            <Select
              value={newRelationship.target_entity}
              onValueChange={(value) =>
                setNewRelationship({ ...newRelationship, target_entity: value })
              }
            >
              <SelectTrigger id="relationship-target">
                <SelectValue placeholder="Select target entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.name} value={entity.name}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship-description">Description</Label>
            <Textarea
              id="relationship-description"
              placeholder="e.g., Each User can have many Orders"
              rows={2}
              value={newRelationship.description}
              onChange={(e) =>
                setNewRelationship({
                  ...newRelationship,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Create Relationship</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
