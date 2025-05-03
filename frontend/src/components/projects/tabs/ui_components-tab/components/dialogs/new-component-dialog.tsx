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

import { Component } from "../../types";
import { componentTypes, componentTypeIcons } from "../../constants";

interface NewComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddComponent: (newComponent: Component) => void;
}

export function NewComponentDialog({
  open,
  onOpenChange,
  onAddComponent,
}: NewComponentDialogProps) {
  const [newComponent, setNewComponent] = useState<Component>({
    name: "",
    type: "custom",
    description: "",
    functionality: "",
    api_endpoints: [],
    data_displayed: [],
  });

  const [apiEndpoint, setApiEndpoint] = useState("");
  const [dataItem, setDataItem] = useState("");

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset the form
      setNewComponent({
        name: "",
        type: "custom",
        description: "",
        functionality: "",
        api_endpoints: [],
        data_displayed: [],
      });
      setApiEndpoint("");
      setDataItem("");
    }
    onOpenChange(open);
  };

  // Add API endpoint
  const handleAddApiEndpoint = () => {
    if (apiEndpoint.trim() === "") return;

    setNewComponent({
      ...newComponent,
      api_endpoints: [...newComponent.api_endpoints, apiEndpoint.trim()],
    });

    setApiEndpoint("");
  };

  // Add data item
  const handleAddDataItem = () => {
    if (dataItem.trim() === "") return;

    setNewComponent({
      ...newComponent,
      data_displayed: [...newComponent.data_displayed, dataItem.trim()],
    });

    setDataItem("");
  };

  // Remove API endpoint
  const handleRemoveApiEndpoint = (index: number) => {
    setNewComponent({
      ...newComponent,
      api_endpoints: newComponent.api_endpoints.filter((_, i) => i !== index),
    });
  };

  // Remove data item
  const handleRemoveDataItem = (index: number) => {
    setNewComponent({
      ...newComponent,
      data_displayed: newComponent.data_displayed.filter((_, i) => i !== index),
    });
  };

  // Submit the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newComponent.name.trim() === "") return;

    onAddComponent(newComponent);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-secondary-background">
        <DialogHeader>
          <DialogTitle>Add New Component</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="component-name">Component Name</Label>
              <Input
                id="component-name"
                required
                value={newComponent.name}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, name: e.target.value })
                }
                className="bg-primary-background"
                placeholder="e.g., UserProfileCard"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="component-type">Component Type</Label>
              <Select
                value={newComponent.type}
                onValueChange={(value) =>
                  setNewComponent({ ...newComponent, type: value })
                }
              >
                <SelectTrigger
                  id="component-type"
                  className="bg-primary-background"
                >
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map((type) => {
                    const IconComponent =
                      componentTypeIcons[type] || componentTypeIcons.default;
                    return (
                      <SelectItem
                        key={type}
                        value={type}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span className="capitalize">{type}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="component-description">Description</Label>
            <Textarea
              id="component-description"
              value={newComponent.description}
              onChange={(e) =>
                setNewComponent({
                  ...newComponent,
                  description: e.target.value,
                })
              }
              className="bg-primary-background resize-none"
              placeholder="What does this component display or do?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="component-functionality">Functionality</Label>
            <Textarea
              id="component-functionality"
              value={newComponent.functionality}
              onChange={(e) =>
                setNewComponent({
                  ...newComponent,
                  functionality: e.target.value,
                })
              }
              className="bg-primary-background resize-none"
              placeholder="Describe how this component functions and what it enables users to do"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>API Endpoints</Label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[40px]">
                {newComponent.api_endpoints.map((endpoint, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-primary-background flex items-center gap-1"
                  >
                    {endpoint}
                    <button
                      type="button"
                      onClick={() => handleRemoveApiEndpoint(idx)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="bg-primary-background"
                  placeholder="/api/resource/{id}"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddApiEndpoint();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddApiEndpoint}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Displayed</Label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[40px]">
                {newComponent.data_displayed.map((data, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-primary-background text-primary-cta flex items-center gap-1"
                  >
                    {data}
                    <button
                      type="button"
                      onClick={() => handleRemoveDataItem(idx)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={dataItem}
                  onChange={(e) => setDataItem(e.target.value)}
                  className="bg-primary-background"
                  placeholder="user_profile, metrics, etc."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDataItem();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddDataItem}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Component</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
