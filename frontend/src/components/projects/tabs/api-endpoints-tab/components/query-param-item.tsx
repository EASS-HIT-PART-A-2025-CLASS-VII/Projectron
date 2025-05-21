"use client";

import { useState } from "react";
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
import { Edit, Trash2 } from "lucide-react";
import { QueryParam } from "../types";
import { paramTypes } from "../constants";

interface QueryParamItemProps {
  param: QueryParam;
  isEditing: boolean;
  onEdit?: (updatedParam: QueryParam) => void;
  onDelete?: () => void;
}

export function QueryParamItem({
  param,
  isEditing,
  onEdit,
  onDelete,
}: QueryParamItemProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedParam, setEditedParam] = useState<QueryParam>({ ...param });

  // Save changes and exit edit mode
  const saveChanges = () => {
    if (onEdit) {
      onEdit(editedParam);
    }
    setEditMode(false);
  };

  // Cancel editing and reset to original values
  const cancelEdit = () => {
    setEditedParam({ ...param });
    setEditMode(false);
  };

  if (!isEditing || !editMode) {
    return (
      <tr className="border-b border-divider last:border-0">
        <td className="px-2 py-2 font-medium text-primary-text">
          <div className="truncate max-w-[100px] sm:max-w-none">
            {param.name}
          </div>
        </td>
        <td className="px-2 py-2 text-secondary-text">
          <code className="bg-hover-active/40 px-1.5 py-0.5 rounded text-xs">
            {param.type}
          </code>
        </td>
        <td className="px-2 py-2">
          {param.required ? (
            <Badge
              variant="outline"
              className="bg-amber-600/20 text-amber-400 border-0 whitespace-nowrap"
            >
              Required
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-blue-600/20 text-blue-400 border-0 whitespace-nowrap"
            >
              Optional
            </Badge>
          )}
        </td>
        <td className="px-2 py-2 text-secondary-text">
          <div className="truncate max-w-[120px] sm:max-w-none">
            {param.description}
          </div>
        </td>
        {isEditing && (
          <td className="px-2 py-2 text-right">
            <div className="flex items-center justify-end gap-1">
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
          </td>
        )}
      </tr>
    );
  }

  // Edit mode
  return (
    <tr className="border-b border-divider last:border-0 bg-hover-active/10">
      <td colSpan={isEditing ? 5 : 4} className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <Label htmlFor="param-name" className="text-xs mb-1 block">
              Parameter Name
            </Label>
            <Input
              id="param-name"
              value={editedParam.name}
              onChange={(e) =>
                setEditedParam({ ...editedParam, name: e.target.value })
              }
              className="h-8 bg-primary-background w-full"
            />
          </div>
          <div>
            <Label htmlFor="param-type" className="text-xs mb-1 block">
              Type
            </Label>
            <Select
              value={editedParam.type}
              onValueChange={(value) =>
                setEditedParam({ ...editedParam, type: value })
              }
            >
              <SelectTrigger
                id="param-type"
                className="h-8 bg-primary-background w-full"
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {paramTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-3">
          <Label htmlFor="param-description" className="text-xs mb-1 block">
            Description
          </Label>
          <Textarea
            id="param-description"
            value={editedParam.description}
            onChange={(e) =>
              setEditedParam({
                ...editedParam,
                description: e.target.value,
              })
            }
            rows={2}
            className="resize-none bg-primary-background w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2">
            <Checkbox
              id="param-required"
              checked={editedParam.required}
              onCheckedChange={(checked) =>
                setEditedParam({
                  ...editedParam,
                  required: checked === true,
                })
              }
            />
            <Label htmlFor="param-required" className="text-sm">
              Required
            </Label>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
      </td>
    </tr>
  );
}
