"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { Screen } from "../../types";
import { userTypes } from "../../constants";

interface NewScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddScreen: (newScreen: Screen) => void;
}

export function NewScreenDialog({
  open,
  onOpenChange,
  onAddScreen,
}: NewScreenDialogProps) {
  const [newScreen, setNewScreen] = useState<Screen>({
    name: "",
    description: "",
    route: "",
    user_types: ["all"],
    components: [],
  });
  const [selectedUserTypes, setSelectedUserTypes] = useState<
    Record<string, boolean>
  >({
    all: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Gather selected user types
    const userTypesArray = Object.entries(selectedUserTypes)
      .filter(([_, selected]) => selected)
      .map(([type]) => type);

    // Create the new screen with selected user types
    const screenToAdd: Screen = {
      ...newScreen,
      user_types: userTypesArray,
    };

    onAddScreen(screenToAdd);
    onOpenChange(false);

    // Reset form
    setNewScreen({
      name: "",
      description: "",
      route: "",
      user_types: ["all"],
      components: [],
    });
    setSelectedUserTypes({ all: true });
  };

  const handleUserTypeChange = (type: string, checked: boolean) => {
    // If "all" is selected, deselect others
    if (type === "all" && checked) {
      setSelectedUserTypes({ all: true });
      return;
    }

    // If another type is selected, deselect "all"
    const newSelectedTypes = {
      ...selectedUserTypes,
      [type]: checked,
      all: type === "all" ? checked : false,
    };

    setSelectedUserTypes(newSelectedTypes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Add New Screen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="screen-name">Screen Name</Label>
            <Input
              id="screen-name"
              required
              value={newScreen.name}
              onChange={(e) =>
                setNewScreen({ ...newScreen, name: e.target.value })
              }
              className="bg-primary-background"
              placeholder="e.g., Dashboard"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screen-route">Route</Label>
            <Input
              id="screen-route"
              required
              value={newScreen.route}
              onChange={(e) =>
                setNewScreen({ ...newScreen, route: e.target.value })
              }
              className="bg-primary-background"
              placeholder="e.g., /dashboard"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screen-description">Description</Label>
            <Textarea
              id="screen-description"
              value={newScreen.description}
              onChange={(e) =>
                setNewScreen({ ...newScreen, description: e.target.value })
              }
              className="bg-primary-background resize-none"
              placeholder="What is this screen for?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>User Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {userTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-type-${type}`}
                    checked={selectedUserTypes[type] || false}
                    onCheckedChange={(checked) =>
                      handleUserTypeChange(type, checked === true)
                    }
                  />
                  <Label htmlFor={`user-type-${type}`} className="capitalize">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Screen</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
