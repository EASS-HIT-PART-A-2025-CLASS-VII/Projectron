"use client";

import { useState } from "react";
import { Edit, Save, Trash2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ExpandableText } from "./expandable-text";
import { Component } from "../types";
import { componentTypes } from "../constants";

interface ComponentItemProps {
  component: Component;
  isEditing: boolean;
  onEdit?: (updatedComponent: Component) => void;
  onDelete?: () => void;
}

export function ComponentItem({
  component,
  isEditing,
  onEdit,
  onDelete,
}: ComponentItemProps) {
  const [editing, setEditing] = useState(false);
  const [editedComponent, setEditedComponent] = useState<Component>({
    ...component,
  });
  const [newEndpoint, setNewEndpoint] = useState("");
  const [newDataItem, setNewDataItem] = useState("");

  if (!isEditing) {
    return (
      <div className="p-3 border-b border-divider last:border-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-primary-text">
                {component.name}
              </h4>
              <Badge className="bg-hover-active text-secondary-text">
                {component.type}
              </Badge>
            </div>
            {component.description && (
              <p className="text-xs text-secondary-text mb-2">
                <ExpandableText text={component.description} />
              </p>
            )}
            <p className="text-xs text-secondary-text mb-2">
              <span className="font-medium">Functionality:</span>{" "}
              <ExpandableText text={component.functionality} />
            </p>
          </div>
        </div>

        {/* API Endpoints */}
        {component.api_endpoints.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-medium text-secondary-text block mb-1">
              API Endpoints:
            </span>
            <div className="flex flex-wrap gap-1">
              {component.api_endpoints.map((endpoint, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-primary-background border-divider"
                >
                  {endpoint}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Data Displayed */}
        {component.data_displayed.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-medium text-secondary-text block mb-1">
              Data Displayed:
            </span>
            <div className="flex flex-wrap gap-1">
              {component.data_displayed.map((data, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs bg-primary-background border-divider text-primary-cta"
                >
                  {data}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Editing mode
  if (editing && onEdit) {
    const handleSave = () => {
      onEdit(editedComponent);
      setEditing(false);
    };

    const handleAddEndpoint = () => {
      if (newEndpoint.trim() === "") return;
      setEditedComponent({
        ...editedComponent,
        api_endpoints: [...editedComponent.api_endpoints, newEndpoint.trim()],
      });
      setNewEndpoint("");
    };

    const handleRemoveEndpoint = (index: number) => {
      const newEndpoints = [...editedComponent.api_endpoints];
      newEndpoints.splice(index, 1);
      setEditedComponent({
        ...editedComponent,
        api_endpoints: newEndpoints,
      });
    };

    const handleAddDataItem = () => {
      if (newDataItem.trim() === "") return;
      setEditedComponent({
        ...editedComponent,
        data_displayed: [...editedComponent.data_displayed, newDataItem.trim()],
      });
      setNewDataItem("");
    };

    const handleRemoveDataItem = (index: number) => {
      const newDataItems = [...editedComponent.data_displayed];
      newDataItems.splice(index, 1);
      setEditedComponent({
        ...editedComponent,
        data_displayed: newDataItems,
      });
    };

    return (
      <div className="p-3 border-b border-divider last:border-0 bg-hover-active/10">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs mb-1 block">Name</label>
            <Input
              value={editedComponent.name}
              onChange={(e) =>
                setEditedComponent({
                  ...editedComponent,
                  name: e.target.value,
                })
              }
              className="h-8 bg-primary-background"
            />
          </div>
          <div>
            <label className="text-xs mb-1 block">Type</label>
            <Select
              value={editedComponent.type}
              onValueChange={(value) =>
                setEditedComponent({
                  ...editedComponent,
                  type: value,
                })
              }
            >
              <SelectTrigger className="h-8 bg-primary-background">
                <SelectValue placeholder="Select type" />
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

        <div className="mb-3">
          <label className="text-xs mb-1 block">Description</label>
          <Textarea
            value={editedComponent.description}
            onChange={(e) =>
              setEditedComponent({
                ...editedComponent,
                description: e.target.value,
              })
            }
            className="resize-none bg-primary-background"
            rows={2}
          />
        </div>

        <div className="mb-3">
          <label className="text-xs mb-1 block">Functionality</label>
          <Textarea
            value={editedComponent.functionality}
            onChange={(e) =>
              setEditedComponent({
                ...editedComponent,
                functionality: e.target.value,
              })
            }
            className="resize-none bg-primary-background"
            rows={2}
          />
        </div>

        {/* API Endpoints Editor */}
        <div className="mb-3">
          <label className="text-xs mb-1 block">API Endpoints</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {editedComponent.api_endpoints.map((endpoint, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs bg-primary-background border-divider flex items-center gap-1"
              >
                {endpoint}
                <button onClick={() => handleRemoveEndpoint(idx)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
              placeholder="Add endpoint"
              className="h-8 bg-primary-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddEndpoint();
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddEndpoint}
              className="h-8"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Data Displayed Editor */}
        <div className="mb-3">
          <label className="text-xs mb-1 block">Data Displayed</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {editedComponent.data_displayed.map((data, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs bg-primary-background border-divider flex items-center gap-1 text-primary-cta"
              >
                {data}
                <button onClick={() => handleRemoveDataItem(idx)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newDataItem}
              onChange={(e) => setNewDataItem(e.target.value)}
              placeholder="Add data item"
              className="h-8 bg-primary-background"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDataItem();
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddDataItem}
              className="h-8"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditedComponent({ ...component });
              setEditing(false);
            }}
          >
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="h-3.5 w-3.5 mr-1" /> Save
          </Button>
        </div>
      </div>
    );
  }

  // Not editing, but editing is enabled
  return (
    <div className="p-3 border-b border-divider last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-primary-text">{component.name}</h4>
            <Badge className="bg-hover-active text-secondary-text">
              {component.type}
            </Badge>
          </div>
          {component.description && (
            <p className="text-xs text-secondary-text mb-2">
              <ExpandableText text={component.description} />
            </p>
          )}
          <p className="text-xs text-secondary-text mb-2">
            <span className="font-medium">Functionality:</span>{" "}
            <ExpandableText text={component.functionality} />
          </p>
        </div>

        <div className="flex items-center gap-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setEditing(true)}
          >
            <Edit className="h-3.5 w-3.5 text-secondary-text" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:text-red-400"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
            </Button>
          )}
        </div>
      </div>

      {/* API Endpoints */}
      {component.api_endpoints.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-secondary-text block mb-1">
            API Endpoints:
          </span>
          <div className="flex flex-wrap gap-1">
            {component.api_endpoints.map((endpoint, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs bg-primary-background border-divider"
              >
                {endpoint}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Data Displayed */}
      {component.data_displayed.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-secondary-text block mb-1">
            Data Displayed:
          </span>
          <div className="flex flex-wrap gap-1">
            {component.data_displayed.map((data, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="text-xs bg-primary-background border-divider text-primary-cta"
              >
                {data}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
