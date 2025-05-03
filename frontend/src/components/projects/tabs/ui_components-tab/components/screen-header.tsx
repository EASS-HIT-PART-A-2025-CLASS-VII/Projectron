"use client";

import { useEffect, useState } from "react";
import { Layout, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Screen } from "../types";

interface ScreenHeaderProps {
  screen: Screen;
  isEditing: boolean;
  onUpdateScreen: (updatedScreen: Screen) => void;
}

export function ScreenHeader({
  screen,
  isEditing,
  onUpdateScreen,
}: ScreenHeaderProps) {
  const [editedScreen, setEditedScreen] = useState<Screen>({ ...screen });
  const [newUserType, setNewUserType] = useState("");

  useEffect(() => {
    setEditedScreen({ ...screen });
  }, [screen]);

  const handleInputChange = (field: keyof Screen, value: string) => {
    setEditedScreen((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onUpdateScreen(editedScreen);
  };

  const handleCancel = () => {
    setEditedScreen({ ...screen });
  };

  const handleAddUserType = () => {
    if (!newUserType.trim()) return;

    const updatedUserTypes = [...editedScreen.user_types, newUserType.trim()];
    setEditedScreen((prev) => ({
      ...prev,
      user_types: updatedUserTypes,
    }));
    setNewUserType("");
  };

  const handleRemoveUserType = (index: number) => {
    const updatedUserTypes = [...editedScreen.user_types];
    updatedUserTypes.splice(index, 1);
    setEditedScreen((prev) => ({
      ...prev,
      user_types: updatedUserTypes,
    }));
  };

  if (isEditing) {
    return (
      <div className="bg-secondary-background border border-divider rounded-md p-4 ">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-secondary-text block mb-1">
                Screen Name
              </label>
              <Input
                value={editedScreen.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-primary-background"
              />
            </div>
            <div>
              <label className="text-xs text-secondary-text block mb-1">
                Route Path
              </label>
              <Input
                value={editedScreen.route}
                onChange={(e) => handleInputChange("route", e.target.value)}
                className="bg-primary-background"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-secondary-text block mb-1">
              Description
            </label>
            <Input
              value={editedScreen.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-primary-background"
            />
          </div>
          <div>
            <label className="text-xs text-secondary-text block mb-1">
              User Types
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedScreen.user_types.map((type, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs text-primary-text font-thin bg-primary-cta/5 border-gray-600"
                >
                  {type}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:text-red-400"
                    onClick={() => handleRemoveUserType(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add user type..."
                value={newUserType}
                onChange={(e) => setNewUserType(e.target.value)}
                className="bg-primary-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUserType();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAddUserType}>
                Add
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="default" size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary-background border border-divider rounded-md p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary-cta" />
          {screen.name}
        </h2>
        <Badge variant="outline" className="bg-hover-active/30">
          {screen.route}
        </Badge>
      </div>
      <p className="text-secondary-text mt-2">{screen.description}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs text-secondary-text">Accessible by:</span>
        {screen.user_types.map((type, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="text-primary-text bg-primary-cta/5 border font-thin rounded-sm"
          >
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
}
