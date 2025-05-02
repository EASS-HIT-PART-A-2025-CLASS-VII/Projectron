"use client";

import { useState, useEffect } from "react";
import {
  ServerCrash,
  Shield,
  BookOpen,
  Search,
  Copy,
  Info,
  Edit,
  PlusCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

import { apiClient } from "@/lib/api";
import { ResourceSection } from "./components/resource-section";
import { NewResourceDialog } from "./components/dialogs/new-recource-dialog";
import {
  ApiEndpointsTabProps,
  Resource,
  APIEndpoints,
  ToastState,
} from "./types";

export function ApiEndpointsTab({
  project: initialProject,
}: ApiEndpointsTabProps) {
  // Keep track of the most up to date project version
  const [currentProject, setCurrentProject] =
    useState<ApiEndpointsTabProps["project"]>(initialProject);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedApiEndpoints, setEditedApiEndpoints] =
    useState<APIEndpoints | null>(null);
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });
  const [showAllPrinciples, setShowAllPrinciples] = useState(false);

  // Extract API endpoints data from project
  const apiEndpoints = currentProject.api_endpoints as APIEndpoints;

  // Initialize edited API endpoints from project data
  useEffect(() => {
    if (currentProject.api_endpoints) {
      setEditedApiEndpoints(currentProject.api_endpoints as APIEndpoints);
    }
  }, [currentProject.api_endpoints]);

  // Filter endpoints based on search term
  useEffect(() => {
    if (!apiEndpoints || !searchTerm.trim()) {
      setFilteredResources([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = apiEndpoints.resources
      .map((resource: Resource) => {
        const matchingEndpoints = resource.endpoints.filter(
          (endpoint) =>
            endpoint.name.toLowerCase().includes(term) ||
            endpoint.path.toLowerCase().includes(term) ||
            endpoint.description.toLowerCase().includes(term) ||
            endpoint.method.toLowerCase().includes(term)
        );

        return matchingEndpoints.length > 0
          ? { ...resource, endpoints: matchingEndpoints }
          : null;
      })
      .filter(Boolean) as Resource[];

    setFilteredResources(filtered);
  }, [searchTerm, apiEndpoints]);

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

  // Get resources to display (either filtered or all)
  const resourcesToDisplay =
    searchTerm.trim() !== ""
      ? filteredResources
      : editedApiEndpoints?.resources || apiEndpoints?.resources || [];

  // Update resource
  const handleUpdateResource = (index: number, updatedResource: Resource) => {
    if (!editedApiEndpoints) return;

    const newResources = [...editedApiEndpoints.resources];
    newResources[index] = updatedResource;

    const newApiEndpoints = {
      ...editedApiEndpoints,
      resources: newResources,
    };

    setEditedApiEndpoints(newApiEndpoints);
    setUnsavedChanges(true);
  };

  // Delete resource
  const handleDeleteResource = (index: number) => {
    if (!editedApiEndpoints) return;

    const newResources = [...editedApiEndpoints.resources];
    newResources.splice(index, 1);

    const newApiEndpoints = {
      ...editedApiEndpoints,
      resources: newResources,
    };

    setEditedApiEndpoints(newApiEndpoints);
    setUnsavedChanges(true);
  };

  // Add new resource
  const handleAddResource = (newResource: Resource) => {
    if (!editedApiEndpoints) return;

    // Check if resource name already exists
    if (editedApiEndpoints.resources.some((r) => r.name === newResource.name)) {
      showToast(
        "Resource name already exists",
        "Please choose a different name",
        "destructive"
      );
      return;
    }

    const newApiEndpoints = {
      ...editedApiEndpoints,
      resources: [...editedApiEndpoints.resources, newResource],
    };

    setEditedApiEndpoints(newApiEndpoints);
    setUnsavedChanges(true);
  };

  // Save changes to the database
  const saveChanges = async () => {
    if (!editedApiEndpoints) return;

    setIsSaving(true);

    try {
      // Create a copy of the project object
      const updatedProject = { ...currentProject };

      // Update the api_endpoints field
      updatedProject.api_endpoints = editedApiEndpoints;

      // Make the API call using apiClient
      const result = await apiClient<ApiEndpointsTabProps["project"]>(
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
    setEditedApiEndpoints(currentProject.api_endpoints as APIEndpoints);
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  // If API endpoints data is not available yet
  if (!apiEndpoints || Object.keys(apiEndpoints).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <ServerCrash className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          API Endpoints Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have API endpoints defined yet. You can generate
          them from the Plan Generation page.
        </p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header with Edit Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <ServerCrash className="h-6 w-6 text-primary-cta" />
            <h2 className="text-xl font-semibold">API Documentation</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center w-full md:w-auto">
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
                <Edit className="h-4 w-4 mr-1" /> Edit API
              </Button>
            )}
          </div>
        </div>

        {/* API Overview Card */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ServerCrash className="h-5 w-5 sm:h-6 sm:w-6 text-primary-cta" />
                <h2 className="text-lg sm:text-xl font-semibold">
                  API Documentation
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {isEditing ? (
                  <Input
                    value={editedApiEndpoints?.base_url}
                    onChange={(e) => {
                      if (!editedApiEndpoints) return;
                      setEditedApiEndpoints({
                        ...editedApiEndpoints,
                        base_url: e.target.value,
                      });
                      setUnsavedChanges(true);
                    }}
                    className="h-7 w-full sm:w-64 text-sm bg-primary-background"
                  />
                ) : (
                  <Badge className="bg-hover-active text-primary-text text-xs py-1">
                    {apiEndpoints.base_url}
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    navigator.clipboard.writeText(apiEndpoints.base_url)
                  }
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Auth Info - simplified for mobile */}
              <div className="bg-primary-background border border-divider p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-medium text-sm">
                    Authentication:{" "}
                    {isEditing ? (
                      <Input
                        value={editedApiEndpoints?.authentication.type}
                        onChange={(e) => {
                          if (!editedApiEndpoints) return;
                          setEditedApiEndpoints({
                            ...editedApiEndpoints,
                            authentication: {
                              ...editedApiEndpoints.authentication,
                              type: e.target.value,
                            },
                          });
                          setUnsavedChanges(true);
                        }}
                        className="h-7 w-full sm:w-48 text-xs bg-hover-active/30 mt-2 mb-2 sm:mt-0 sm:inline-block sm:ml-2"
                      />
                    ) : (
                      <span className="text-primary-text">
                        {apiEndpoints.authentication.type}
                      </span>
                    )}
                  </span>
                </div>
                {isEditing ? (
                  <Textarea
                    value={editedApiEndpoints?.authentication.description}
                    onChange={(e) => {
                      if (!editedApiEndpoints) return;
                      setEditedApiEndpoints({
                        ...editedApiEndpoints,
                        authentication: {
                          ...editedApiEndpoints.authentication,
                          description: e.target.value,
                        },
                      });
                      setUnsavedChanges(true);
                    }}
                    className="text-xs bg-hover-active/30 resize-none min-h-[80px] p-2"
                    rows={4}
                  />
                ) : (
                  <p className="text-secondary-text text-xs leading-relaxed">
                    {apiEndpoints.authentication.description}
                  </p>
                )}
              </div>

              {/* API Principles - simplified for mobile */}
              <div className="bg-primary-background border border-divider p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary-cta" />
                    <span className="font-medium text-sm">
                      API Design Principles
                    </span>
                  </div>
                  {apiEndpoints.api_design_principles.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 text-xs p-0 text-primary-cta"
                      onClick={() => setShowAllPrinciples(!showAllPrinciples)}
                    >
                      {showAllPrinciples ? "Less" : "More"}
                    </Button>
                  )}
                </div>
                <div
                  className={`overflow-y-auto scrollbar-thin ${
                    showAllPrinciples ? "max-h-48 sm:max-h-96" : "max-h-24"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      {editedApiEndpoints?.api_design_principles.map(
                        (principle, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Input
                              value={principle}
                              onChange={(e) => {
                                if (!editedApiEndpoints) return;
                                const newPrinciples = [
                                  ...editedApiEndpoints.api_design_principles,
                                ];
                                newPrinciples[idx] = e.target.value;
                                setEditedApiEndpoints({
                                  ...editedApiEndpoints,
                                  api_design_principles: newPrinciples,
                                });
                                setUnsavedChanges(true);
                              }}
                              className="h-7 bg-hover-active/30 text-xs flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:text-red-400"
                              onClick={() => {
                                if (!editedApiEndpoints) return;
                                const newPrinciples = [
                                  ...editedApiEndpoints.api_design_principles,
                                ];
                                newPrinciples.splice(idx, 1);
                                setEditedApiEndpoints({
                                  ...editedApiEndpoints,
                                  api_design_principles: newPrinciples,
                                });
                                setUnsavedChanges(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-primary-cta text-xs h-7"
                        onClick={() => {
                          if (!editedApiEndpoints) return;
                          setEditedApiEndpoints({
                            ...editedApiEndpoints,
                            api_design_principles: [
                              ...editedApiEndpoints.api_design_principles,
                              "",
                            ],
                          });
                          setUnsavedChanges(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Principle
                      </Button>
                    </div>
                  ) : (
                    <ul className="text-xs leading-relaxed space-y-1 pl-4 marker:text-primary-cta list-disc scrollbar-thin">
                      {(showAllPrinciples
                        ? apiEndpoints.api_design_principles
                        : apiEndpoints.api_design_principles.slice(0, 3)
                      ).map((principle: any, idx: any) => (
                        <li key={idx} className="text-secondary-text">
                          {principle}
                        </li>
                      ))}
                      {!showAllPrinciples &&
                        apiEndpoints.api_design_principles.length > 3 && (
                          <li className="text-primary-cta text-xs">
                            +{apiEndpoints.api_design_principles.length - 3}{" "}
                            more
                          </li>
                        )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit mode controls */}
        {isEditing && (
          <div className="flex items-center gap-3 justify-end bg-secondary-background p-3 rounded-md border border-divider">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewResourceDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Resource
            </Button>
          </div>
        )}

        {/* Endpoint Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text h-4 w-4" />
          <Input
            placeholder="Search endpoints by name, path, or method..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary-background border-divider text-sm"
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-text"
              onClick={() => setSearchTerm("")}
            >
              <Badge
                variant="outline"
                className="h-6 bg-hover-active border-primary-cta/30 text-primary-text font-normal"
              >
                Clear
              </Badge>
            </button>
          )}
        </div>

        {/* Endpoint not found message */}
        {resourcesToDisplay.length === 0 && searchTerm.trim() !== "" && (
          <div className="p-4 text-center border border-divider rounded-md bg-secondary-background">
            <Info className="h-8 w-8 text-secondary-text mx-auto mb-2" />
            <p className="text-secondary-text">No matching endpoints found</p>
          </div>
        )}

        {/* Resources List */}
        <div className="space-y-4">
          {resourcesToDisplay.map((resource, idx) => (
            <ResourceSection
              key={idx}
              resource={resource}
              baseUrl={editedApiEndpoints?.base_url || apiEndpoints.base_url}
              isEditing={isEditing}
              onUpdateResource={
                isEditing
                  ? (updatedResource) =>
                      handleUpdateResource(idx, updatedResource)
                  : undefined
              }
              onDeleteResource={
                isEditing ? () => handleDeleteResource(idx) : undefined
              }
            />
          ))}
        </div>

        {/* New Resource Dialog */}
        <NewResourceDialog
          open={showNewResourceDialog}
          onOpenChange={setShowNewResourceDialog}
          onAddResource={handleAddResource}
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
