"use client";

import { useState, useEffect } from "react";
import {
  Database,
  AlertTriangle,
  Search,
  Link2,
  Edit,
  PlusCircle,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

import { apiClient } from "@/lib/api";
import {
  Entity,
  DataModels,
  DataModelsTabProps,
  ToastState,
  Relationship,
} from "./types";
import { EntityCard } from "./components/entity-card";
import { NewEntityDialog } from "./components/dialogs/new-entity-dialog";
import { NewRelationshipDialog } from "./components/dialogs/new-relationship-dialog";

export function DataModelsTab({ project: initialProject }: DataModelsTabProps) {
  // Keep track of the most up to date project version
  const [currentProject, setCurrentProject] =
    useState<DataModelsTabProps["project"]>(initialProject);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedDataModels, setEditedDataModels] = useState<DataModels | null>(
    null
  );
  const [showNewEntityDialog, setShowNewEntityDialog] = useState(false);
  const [showNewRelationshipDialog, setShowNewRelationshipDialog] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });

  // Initialize edited data models from project data
  useEffect(() => {
    if (currentProject.data_models) {
      setEditedDataModels(currentProject.data_models as DataModels);
    }
  }, [currentProject.data_models]);

  // Show toast function
  const showToast = (
    title: string,
    description?: string,
    variant?: "default" | "destructive"
  ) => {
    setToast({
      open: true,
      title,
      description,
      variant,
    });

    // Auto-close toast after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  // Get data models to display
  const dataModels = isEditing
    ? editedDataModels
    : (currentProject.data_models as DataModels | undefined);

  // Filter entities based on search term
  const filteredEntities =
    !dataModels || !searchTerm.trim()
      ? dataModels?.entities || []
      : dataModels.entities.filter(
          (entity) =>
            entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entity.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            entity.properties.some(
              (prop) =>
                prop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                prop.description
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )
        );

  // Update entity data
  const handleUpdateEntity = (entityName: string, updatedEntity: Entity) => {
    if (!editedDataModels) return;

    // Make a deep copy to ensure state updates properly
    const newDataModels = {
      ...editedDataModels,
      entities: [...editedDataModels.entities],
    };

    const index = newDataModels.entities.findIndex(
      (e) => e.name === entityName
    );

    if (index !== -1) {
      // Replace entity with updated version
      newDataModels.entities[index] = updatedEntity;

      // Update state
      setEditedDataModels(newDataModels);
      setUnsavedChanges(true);
    }
  };

  // Delete entity
  const handleDeleteEntity = (entityName: string) => {
    if (!editedDataModels) return;

    // Remove entity
    const newEntities = editedDataModels.entities.filter(
      (e) => e.name !== entityName
    );

    // Remove relationships involving this entity
    const newRelationships = editedDataModels.relationships.filter(
      (r) => r.source_entity !== entityName && r.target_entity !== entityName
    );

    const newDataModels = {
      entities: newEntities,
      relationships: newRelationships,
    };

    // Update state
    setEditedDataModels(newDataModels);
    setUnsavedChanges(true);
  };

  // Add new entity
  const handleAddEntity = (newEntity: Entity) => {
    if (!editedDataModels) return;

    // Check if entity name already exists
    if (editedDataModels.entities.some((e) => e.name === newEntity.name)) {
      showToast(
        "Entity name already exists",
        "Please choose a different name",
        "destructive"
      );
      return;
    }

    // Create a new data models object with the new entity
    const newDataModels = {
      ...editedDataModels,
      entities: [...editedDataModels.entities, newEntity],
    };

    // Update state
    setEditedDataModels(newDataModels);
    setUnsavedChanges(true);
  };

  // Add new relationship
  const handleAddRelationship = (newRelationship: Relationship) => {
    if (!editedDataModels) return;

    // Create a new data models object with the new relationship
    const newDataModels = {
      ...editedDataModels,
      relationships: [...editedDataModels.relationships, newRelationship],
    };

    // Update state
    setEditedDataModels(newDataModels);
    setUnsavedChanges(true);
  };

  // Save changes to the database
  const saveChanges = async () => {
    if (!editedDataModels) return;

    setIsSaving(true);

    try {
      // Create a copy of the project object
      const updatedProject = { ...currentProject };

      // Update the data_models field
      updatedProject.data_models = editedDataModels;

      // Make the API call using apiClient
      const result = await apiClient<DataModelsTabProps["project"]>(
        `/projects/${currentProject.id}`,
        {
          method: "PUT",
          body: updatedProject,
          token: localStorage.getItem("token") || undefined,
        }
      );

      // Update the local project state with the result
      setCurrentProject(result);

      // Exit editing mode
      setIsEditing(false);
      setUnsavedChanges(false);

      showToast("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      showToast("Failed to save changes", "Please try again", "destructive");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing and revert changes
  const cancelEditing = () => {
    setEditedDataModels(currentProject.data_models as DataModels);
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  // If data models not available yet
  if (!dataModels || Object.keys(dataModels).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Data Models Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have data models defined yet. You can generate
          them from the Plan Generation page.
        </p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="space-y-8">
        {/* Header with Search and Edit Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary-cta" />
            <h2 className="text-xl font-semibold">Data Models</h2>
            <Badge className="bg-hover-active text-primary-text ml-1">
              {dataModels.entities.length} entities
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text h-4 w-4" />
              <Input
                placeholder="Search entities or properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-secondary-background border-divider"
              />
              {searchTerm && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4 text-secondary-text hover:text-primary-text" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={unsavedChanges ? "default" : "outline"}
                    size="sm"
                    onClick={saveChanges}
                    disabled={isSaving || !unsavedChanges}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit Models
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Edit mode controls */}
        {isEditing && (
          <div className="flex items-center gap-3 justify-end bg-secondary-background p-3 rounded-md border border-divider">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewEntityDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Entity
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewRelationshipDialog(true)}
            >
              <Link2 className="h-4 w-4 mr-1" /> Add Relationship
            </Button>
          </div>
        )}

        {/* Entity Cards Grid */}
        {filteredEntities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntities.map((entity, idx) => (
              <EntityCard
                key={`${entity.name}-${idx}`}
                entity={entity}
                relationships={dataModels.relationships}
                isEditing={isEditing}
                onUpdateEntity={handleUpdateEntity}
                onDeleteEntity={handleDeleteEntity}
                onCardChange={() => setUnsavedChanges(true)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-divider rounded-md bg-secondary-background">
            <p className="text-secondary-text">
              No entities found matching "{searchTerm}"
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 border-primary-cta/30"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Dialogs */}
        <NewEntityDialog
          open={showNewEntityDialog}
          onOpenChange={setShowNewEntityDialog}
          onAddEntity={handleAddEntity}
        />

        <NewRelationshipDialog
          open={showNewRelationshipDialog}
          onOpenChange={setShowNewRelationshipDialog}
          onAddRelationship={handleAddRelationship}
          entities={dataModels.entities}
        />

        {/* Toast */}
        {toast.open && (
          <Toast
            variant={toast.variant}
            className="fixed bottom-4 right-4 z-50"
          >
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </Toast>
        )}

        <ToastViewport />
      </div>
    </ToastProvider>
  );
}
