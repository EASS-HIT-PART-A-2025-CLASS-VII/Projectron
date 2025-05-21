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
  isEditing: boolean;
  onUpdate: (updatedComponent: Component) => void;
  onDelete: () => void;
}

export function ComponentCard({
  component,
  isEditing,
  onUpdate,
  onDelete,
}: ComponentCardProps) {
  const [editing, setEditing] = useState(false);
  const [editedComponent, setEditedComponent] = useState<Component>({
    ...component,
  });
  const [newItem, setNewItem] = useState("");
  const [newItemType, setNewItemType] = useState<
    "api_endpoints" | "data_displayed"
  >("api_endpoints");

  // Get the component icon based on its type
  const getComponentIcon = () => {
    const IconComponent =
      componentTypeIcons[component.type] || componentTypeIcons.default;
    return <IconComponent className="h-5 w-5" />;
  };

  // Get component color accent based on type
  const getComponentColorClass = () => {
    switch (component.type) {
      // case "form":
      //   return "border-purple-600/30 bg-purple-950/10";
      // case "table":
      //   return "border-red-600/30 bg-red-950/10";
      // case "chart":
      //   return "border-orange-600/30 bg-orange-950/10";
      // case "navigation":
      //   return "border-green-600/30 bg-green-950/10";
      // case "input":
      //   return "border-yellow-600/30 bg-yellow-950/10";
      // case "button":
      //   return "border-blue-600/30 bg-blue-950/10 ";
      default:
        return "border-gray-600 gradient-border";
    }
  };

  // Add new item (API endpoint or data item)
  const handleAddItem = () => {
    if (!newItem.trim()) return;

    const updatedComponent = { ...editedComponent };

    if (newItemType === "api_endpoints") {
      updatedComponent.api_endpoints = [
        ...updatedComponent.api_endpoints,
        newItem,
      ];
    } else {
      updatedComponent.data_displayed = [
        ...updatedComponent.data_displayed,
        newItem,
      ];
    }

    setEditedComponent(updatedComponent);
    setNewItem("");
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

  if (!isEditing) {
    // View mode
    return (
      <Card className={`border overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {getComponentIcon()}
            <h3 className="font-semibold">{component.name}</h3>
            <Badge
              variant="outline"
              className={`ml-auto border ${getComponentColorClass()}`}
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
      </Card>
    );
  }

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
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-secondary-text">
                  API Endpoints
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setNewItemType("api_endpoints");
                    setNewItem("");
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Endpoint
                </Button>
              </div>

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

              {newItemType === "api_endpoints" && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Enter API endpoint"
                    className="bg-primary-background text-sm h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleAddItem}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-secondary-text">
                  Data Displayed
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    setNewItemType("data_displayed");
                    setNewItem("");
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Data
                </Button>
              </div>

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

              {newItemType === "data_displayed" && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Enter data item"
                    className="bg-primary-background text-sm h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleAddItem}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                <Save className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // View mode with edit buttons
  return (
    <Card className={`border overflow-hidden`}>
      <div className="p-4">
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

        <div className="flex justify-end gap-2 mt-4">
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
      </div>
    </Card>
  );
}
