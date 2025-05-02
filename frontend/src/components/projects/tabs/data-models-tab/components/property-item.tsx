"use client";

import { useState } from "react";
import { CircleDot, Edit, Key, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Property } from "../types";
import { typeColors, availableTypes } from "../constants";
import { ExpandableText } from "./expandable-text";

interface PropertyItemProps {
  property: Property;
  isEditing: boolean;
  onEdit?: (updatedProperty: Property) => void;
  onDelete?: () => void;
}

export function PropertyItem({
  property,
  isEditing,
  onEdit,
  onDelete,
}: PropertyItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedProperty, setEditedProperty] = useState<Property>({
    ...property,
  });

  const typeColor =
    property.type in typeColors
      ? typeColors[property.type]
      : typeColors.default;

  // Save changes and exit edit mode
  const saveChanges = () => {
    if (onEdit) {
      onEdit(editedProperty);
    }
    setEditMode(false);
  };

  // Cancel editing and reset to original values
  const cancelEdit = () => {
    setEditedProperty({ ...property });
    setEditMode(false);
  };

  // Non-editing view
  if (!editMode) {
    return (
      <div className="py-2 px-3 border-b border-divider last:border-0 flex items-center gap-3 hover:bg-hover-active/20 transition-colors">
        <div className="flex-grow min-w-0 flex items-center">
          <CircleDot className="h-3 w-3 text-secondary-text/40 flex-shrink-0 mr-2" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-medium truncate">{property.name}</span>
              {property.name.toLowerCase().includes("id") &&
                property.name.length < 5 && (
                  <Key className="h-3 w-3 text-secondary-text ml-1" />
                )}
              {property.required && (
                <span className="text-xs text-amber-400 ml-1">*</span>
              )}
            </div>
            {property.description && (
              <p className="text-xs text-secondary-text">
                <ExpandableText text={property.description} maxLength={45} />
              </p>
            )}
          </div>
        </div>

        <code
          className={`text-xs px-2 py-0.5 rounded bg-secondary-background ${typeColor} flex-shrink-0`}
        >
          {property.type}
        </code>

        {isEditing && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setEditMode(true)}
              >
                <Edit className="h-3.5 w-3.5 text-secondary-text" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:text-red-400"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5 text-secondary-text" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="p-3 border-b border-divider last:border-0 bg-hover-active/10">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <Label htmlFor="property-name" className="text-xs mb-1">
            Name
          </Label>
          <Input
            id="property-name"
            value={editedProperty.name}
            onChange={(e) =>
              setEditedProperty({ ...editedProperty, name: e.target.value })
            }
            className="h-8 bg-primary-background"
          />
        </div>
        <div>
          <Label htmlFor="property-type" className="text-xs mb-1">
            Type
          </Label>
          <Select
            value={editedProperty.type}
            onValueChange={(value) =>
              setEditedProperty({ ...editedProperty, type: value })
            }
          >
            <SelectTrigger
              id="property-type"
              className="h-8 bg-primary-background"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-3">
        <Label htmlFor="property-description" className="text-xs mb-1">
          Description
        </Label>
        <Textarea
          id="property-description"
          value={editedProperty.description}
          onChange={(e) =>
            setEditedProperty({
              ...editedProperty,
              description: e.target.value,
            })
          }
          rows={2}
          className="resize-none bg-primary-background"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="property-required"
            checked={editedProperty.required}
            onCheckedChange={(checked) =>
              setEditedProperty({
                ...editedProperty,
                required: checked === true,
              })
            }
          />
          <Label htmlFor="property-required" className="text-sm">
            Required
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7"
            onClick={cancelEdit}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-7"
            onClick={saveChanges}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
