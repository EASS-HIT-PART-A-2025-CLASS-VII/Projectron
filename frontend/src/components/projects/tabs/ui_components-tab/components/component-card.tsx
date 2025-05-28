"use client";

import { useState } from "react";
import { Edit, Save, Trash2, X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Component } from "../types";
import { componentTypeIcons, componentTypes } from "../constants";

interface ComponentCardProps {
  component: Component;
  onUpdate: (updatedComponent: Component) => void;
  onDelete: () => void;
}

export function ComponentCard({
  component,
  onUpdate,
  onDelete,
}: ComponentCardProps) {
  const [editing, setEditing] = useState(false);
  const [editedComponent, setEditedComponent] = useState<Component>({
    ...component,
  });
  const [newApiEndpoint, setNewApiEndpoint] = useState("");
  const [newDataItem, setNewDataItem] = useState("");

  // Get the component icon based on its type
  const getComponentIcon = () => {
    const IconComponent =
      componentTypeIcons[component.type] || componentTypeIcons.default;
    return <IconComponent className="h-5 w-5" />;
  };

  // Get component color accent based on type
  const getComponentColorClass = () => {
    return "border-gray-600 gradient-border";
  };

  // Add new API endpoint
  const handleAddApiEndpoint = () => {
    if (!newApiEndpoint.trim()) return;

    const updatedComponent = { ...editedComponent };
    updatedComponent.api_endpoints = [
      ...updatedComponent.api_endpoints,
      newApiEndpoint,
    ];

    setEditedComponent(updatedComponent);
    setNewApiEndpoint("");
  };

  // Add new data item
  const handleAddDataItem = () => {
    if (!newDataItem.trim()) return;

    const updatedComponent = { ...editedComponent };
    updatedComponent.data_displayed = [
      ...updatedComponent.data_displayed,
      newDataItem,
    ];

    setEditedComponent(updatedComponent);
    setNewDataItem("");
  };

  // Remove item
  const handleRemoveItem = (
    type: "api_endpoints" | "data_displayed",
    index: number
  ) => {
    const updatedComponent = { ...editedComponent };

    if (type === "api_endpoints") {
      updatedComponent.api_endpoints = updatedComponent.api_endpoints.filter(
        (_, i) => i !== index
      );
    } else {
      updatedComponent.data_displayed = updatedComponent.data_displayed.filter(
        (_, i) => i !== index
      );
    }

    setEditedComponent(updatedComponent);
  };

  // Save changes
  const handleSave = () => {
    onUpdate(editedComponent);
    setEditing(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedComponent({ ...component });
    setEditing(false);
  };

  if (editing) {
    // Edit mode
    return (
      <Card className="border border-divider bg-secondary-background overflow-hidden">
        <div className="p-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-secondary-text block mb-1">
                  Component Name
                </label>
                <Input
                  value={editedComponent.name}
                  onChange={(e) =>
                    setEditedComponent({
                      ...editedComponent,
                      name: e.target.value,
                    })
                  }
                  className="bg-primary-background"
                />
              </div>
              <div>
                <label className="text-xs text-secondary-text block mb-1">
                  Component Type
                </label>
                <Select
                  value={editedComponent.type}
                  onValueChange={(value) =>
                    setEditedComponent({
                      ...editedComponent,
                      type: value,
                    })
                  }
                >
                  <SelectTrigger className="bg-primary-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs text-secondary-text block mb-1">
                Description
              </label>
              <Textarea
                value={editedComponent.description}
                onChange={(e) =>
                  setEditedComponent({
                    ...editedComponent,
                    description: e.target.value,
                  })
                }
                className="bg-primary-background min-h-[60px] resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-secondary-text block mb-1">
                Functionality
              </label>
              <Textarea
                value={editedComponent.functionality}
                onChange={(e) =>
                  setEditedComponent({
                    ...editedComponent,
                    functionality: e.target.value,
                  })
                }
                className="bg-primary-background min-h-[60px] resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-secondary-text block mb-1">
                API Endpoints
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {editedComponent.api_endpoints.map((endpoint, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-primary-background flex items-center gap-1"
                  >
                    {endpoint}
                    <button
                      onClick={() => handleRemoveItem("api_endpoints", idx)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <Input
                  value={newApiEndpoint}
                  onChange={(e) => setNewApiEndpoint(e.target.value)}
                  placeholder="Enter API endpoint"
                  className="bg-primary-background text-sm h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddApiEndpoint();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleAddApiEndpoint}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs text-secondary-text block mb-1">
                Data Displayed
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {editedComponent.data_displayed.map((data, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs text-primary-text font-thin bg-primary-cta/5 border-gray-600"
                  >
                    {data}
                    <button
                      onClick={() => handleRemoveItem("data_displayed", idx)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 mb-3">
                <Input
                  value={newDataItem}
                  onChange={(e) => setNewDataItem(e.target.value)}
                  placeholder="Enter data item"
                  className="bg-primary-background text-sm h-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddDataItem();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleAddDataItem}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 mt-auto mr-4">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
        </div>
      </Card>
    );
  }

  // View mode
  return (
    <Card className={`border overflow-hidden p-4`}>
      <div className="">
        <div className="flex items-center gap-2 mb-2">
          {getComponentIcon()}
          <h3 className="font-semibold">{component.name}</h3>
          <Badge
            variant="outline"
            className={`ml-auto ${getComponentColorClass()}`}
          >
            {component.type}
          </Badge>
        </div>

        {component.description && (
          <p className="text-sm text-secondary-text mb-3">
            {component.description}
          </p>
        )}

        <p className="text-sm text-secondary-text mb-3">
          <span className="font-medium">Functionality:</span>{" "}
          {component.functionality}
        </p>

        {component.api_endpoints.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold mb-1">API Endpoints:</h4>
            <div className="flex flex-wrap gap-1.5">
              {component.api_endpoints.map((endpoint, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {endpoint}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {component.data_displayed.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Data Displayed:</h4>
            <div className="flex flex-wrap gap-1.5">
              {component.data_displayed.map((data, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs text-primary-text font-thin bg-primary-cta/5 border-gray-600"
                >
                  {data}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-auto bottom-0">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-400 hover:bg-red-950/20"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
        </Button>
      </div>
    </Card>
  );
}
