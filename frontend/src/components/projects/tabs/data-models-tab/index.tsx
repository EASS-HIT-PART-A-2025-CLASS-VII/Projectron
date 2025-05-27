"use client";

import { useState, useEffect, useRef } from "react";
import {
  Database,
  AlertTriangle,
  Search,
  Link2,
  PlusCircle,
  X,
  Loader2,
  Check,
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
  const [displayProject, setDisplayProject] =
    useState<DataModelsTabProps["project"]>(initialProject);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewEntityDialog, setShowNewEntityDialog] = useState(false);
  const [showNewRelationshipDialog, setShowNewRelationshipDialog] =
    useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  // Queue for processing updates sequentially
  const updateQueue = useRef<
    Array<{
      type: "update" | "add" | "delete";
      payload: any;
      projectSnapshot: DataModelsTabProps["project"];
    }>
  >([]);
  const isProcessingRef = useRef(false);

  // Reset saving status after showing "saved"
  useEffect(() => {
    if (savingStatus === "saved") {
      const timer = setTimeout(() => {
        if (updateQueue.current.length === 0) {
          setSavingStatus("idle");
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [savingStatus]);

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
  const dataModels = displayProject.data_models as DataModels | undefined;

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

  // Process queue sequentially
  const processQueue = async () => {
    if (updateQueue.current.length === 0) {
      isProcessingRef.current = false;
      return;
    }

    isProcessingRef.current = true;
    setSavingStatus("saving");

    const nextUpdate = updateQueue.current.shift();

    try {
      if (!nextUpdate) {
        throw new Error("Update is undefined");
      }

      const result = await apiClient<DataModelsTabProps["project"]>(
        `/projects/${currentProject.id}`,
        {
          method: "PUT",
          body: nextUpdate.projectSnapshot,
          token: localStorage.getItem("token") || undefined,
        }
      );

      setCurrentProject(result);
      setSavingStatus("saved");
    } catch (error) {
      console.error("Error saving changes:", error);
      setSavingStatus("idle");
      showToast("Failed to save changes", "Please try again", "destructive");

      if (updateQueue.current.length === 0) {
        setDisplayProject(currentProject);
      }
    } finally {
      if (updateQueue.current.length > 0) {
        processQueue();
      } else {
        isProcessingRef.current = false;
      }
    }
  };

  // Queue update with immediate UI feedback
  const queueUpdate = (
    type: "update" | "add" | "delete",
    payload: any,
    updatedProject: DataModelsTabProps["project"]
  ) => {
    setDisplayProject(updatedProject);

    const projectSnapshot = JSON.parse(JSON.stringify(updatedProject));

    updateQueue.current.push({
      type,
      payload,
      projectSnapshot,
    });

    if (!isProcessingRef.current) {
      processQueue();
    }
  };

  // Update entity data
  const handleUpdateEntity = (entityName: string, updatedEntity: Entity) => {
    if (!dataModels) return;

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedDataModels = updatedProject.data_models as DataModels;

    const index = updatedDataModels.entities.findIndex(
      (e) => e.name === entityName
    );

    if (index !== -1) {
      // Update relationships if entity name changed
      if (entityName !== updatedEntity.name) {
        updatedDataModels.relationships = updatedDataModels.relationships.map(
          (rel) => ({
            ...rel,
            source_entity:
              rel.source_entity === entityName
                ? updatedEntity.name
                : rel.source_entity,
            target_entity:
              rel.target_entity === entityName
                ? updatedEntity.name
                : rel.target_entity,
          })
        );
      }

      updatedDataModels.entities[index] = updatedEntity;
      updatedProject.data_models = updatedDataModels;

      queueUpdate("update", { entityName, updatedEntity }, updatedProject);
    }
  };

  // Delete entity
  const handleDeleteEntity = (entityName: string) => {
    if (!dataModels) return;

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedDataModels = updatedProject.data_models as DataModels;

    // Remove entity
    updatedDataModels.entities = updatedDataModels.entities.filter(
      (e) => e.name !== entityName
    );

    // Remove relationships involving this entity
    updatedDataModels.relationships = updatedDataModels.relationships.filter(
      (r) => r.source_entity !== entityName && r.target_entity !== entityName
    );

    updatedProject.data_models = updatedDataModels;

    queueUpdate("delete", { entityName }, updatedProject);
  };

  // Add new entity
  const handleAddEntity = (newEntity: Entity) => {
    if (!dataModels) return;

    // Check if entity name already exists
    if (dataModels.entities.some((e) => e.name === newEntity.name)) {
      showToast(
        "Entity name already exists",
        "Please choose a different name",
        "destructive"
      );
      return;
    }

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedDataModels = updatedProject.data_models as DataModels;

    updatedDataModels.entities.push(newEntity);
    updatedProject.data_models = updatedDataModels;

    queueUpdate("add", { entity: newEntity }, updatedProject);
  };

  // Add new relationship
  const handleAddRelationship = (newRelationship: Relationship) => {
    if (!dataModels) return;

    // Check for duplicate relationships
    const isDuplicate = dataModels.relationships.some(
      (rel) =>
        rel.source_entity === newRelationship.source_entity &&
        rel.target_entity === newRelationship.target_entity &&
        rel.type === newRelationship.type
    );

    // Also check for reverse relationship (bidirectional check)
    const isReverseDuplicate = dataModels.relationships.some(
      (rel) =>
        rel.source_entity === newRelationship.target_entity &&
        rel.target_entity === newRelationship.source_entity &&
        rel.type === newRelationship.type
    );

    if (isDuplicate || isReverseDuplicate) {
      showToast(
        "Relationship already exists",
        "This relationship between these entities already exists",
        "destructive"
      );
      return;
    }

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedDataModels = updatedProject.data_models as DataModels;

    updatedDataModels.relationships.push(newRelationship);
    updatedProject.data_models = updatedDataModels;

    queueUpdate("add", { relationship: newRelationship }, updatedProject);
  };

  // Delete relationship
  const handleDeleteRelationship = (relationshipToDelete: Relationship) => {
    if (!dataModels) return;

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedDataModels = updatedProject.data_models as DataModels;

    // Remove the specific relationship
    updatedDataModels.relationships = updatedDataModels.relationships.filter(
      (rel) =>
        !(
          rel.source_entity === relationshipToDelete.source_entity &&
          rel.target_entity === relationshipToDelete.target_entity &&
          rel.type === relationshipToDelete.type
        )
    );

    updatedProject.data_models = updatedDataModels;

    queueUpdate(
      "delete",
      { relationship: relationshipToDelete },
      updatedProject
    );
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
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary-cta" />
            <h2 className="text-xl font-semibold">Data Models</h2>
            <Badge className="bg-hover-active text-primary-text ml-1">
              {dataModels.entities.length} entities
            </Badge>
          </div>

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
        </div>

        {/* Add controls */}
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

        {/* Entity Cards Grid */}
        {filteredEntities.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEntities.map((entity, idx) => (
              <EntityCard
                key={`${entity.name}-${idx}`}
                entity={entity}
                relationships={dataModels.relationships}
                onUpdateEntity={handleUpdateEntity}
                onDeleteEntity={handleDeleteEntity}
                onDeleteRelationship={handleDeleteRelationship}
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

        {/* Saving Status Indicator */}
        {savingStatus !== "idle" && (
          <div className="fixed bottom-6 left-6 bg-transparent backdrop-blur-sm rounded-full p-2 shadow-sm">
            {savingStatus === "saving" ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-primary-cta animate-spin" />
                <span className="text-xs text-secondary-text">Saving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-xs text-secondary-text">Saved</span>
              </div>
            )}
          </div>
        )}

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
