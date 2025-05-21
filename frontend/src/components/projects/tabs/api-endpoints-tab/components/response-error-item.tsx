"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2 } from "lucide-react";
import { ResponseError } from "../types";
import { statusColors, errorCodes } from "../constants";

interface ResponseErrorItemProps {
  error: ResponseError;
  isEditing: boolean;
  onEdit?: (updatedError: ResponseError) => void;
  onDelete?: () => void;
}

export function ResponseErrorItem({
  error,
  isEditing,
  onEdit,
  onDelete,
}: ResponseErrorItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedError, setEditedError] = useState<ResponseError>({ ...error });

  // Save changes and exit edit mode
  const saveChanges = () => {
    if (onEdit) {
      onEdit(editedError);
    }
    setEditMode(false);
  };

  // Cancel editing and reset to original values
  const cancelEdit = () => {
    setEditedError({ ...error });
    setEditMode(false);
  };

  const statusColor =
    statusColors[Math.floor(error.status / 100) as keyof typeof statusColors] ||
    statusColors[5];

  if (!editMode) {
    return (
      <div className="border border-divider rounded-md overflow-hidden mb-3 last:mb-0">
        <div className="p-2 bg-primary-background flex items-center border-b border-divider">
          <Badge className={statusColor}>{error.status}</Badge>
          <span className="text-secondary-text font-medium ml-2 flex-grow">
            {error.description}
          </span>

          {isEditing && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setEditMode(true)}
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
          )}
        </div>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="border border-divider rounded-md overflow-hidden mb-3 last:mb-0 bg-hover-active/10">
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <Label htmlFor="error-status" className="text-xs mb-1">
              Status Code
            </Label>
            <Select
              value={editedError.status.toString()}
              onValueChange={(value) =>
                setEditedError({ ...editedError, status: parseInt(value) })
              }
            >
              <SelectTrigger
                id="error-status"
                className="h-8 bg-primary-background"
              >
                <SelectValue placeholder="Select status code" />
              </SelectTrigger>
              <SelectContent>
                {errorCodes.map((code) => (
                  <SelectItem key={code} value={code.toString()}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="error-description" className="text-xs mb-1">
              Description
            </Label>
            <Input
              id="error-description"
              value={editedError.description}
              onChange={(e) =>
                setEditedError({ ...editedError, description: e.target.value })
              }
              className="h-8 bg-primary-background"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3">
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
