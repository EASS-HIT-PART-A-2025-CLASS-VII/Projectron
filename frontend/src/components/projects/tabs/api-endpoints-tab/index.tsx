"use client";

import { useState, useEffect, useRef } from "react";
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
  Loader2,
  Check,
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
  const [displayProject, setDisplayProject] =
    useState<ApiEndpointsTabProps["project"]>(initialProject);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [showNewResourceDialog, setShowNewResourceDialog] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });
  const [showAllPrinciples, setShowAllPrinciples] = useState(false);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  // Individual edit states
  const [editingBaseUrl, setEditingBaseUrl] = useState(false);
  const [editingAuthType, setEditingAuthType] = useState(false);
  const [editingAuthDescription, setEditingAuthDescription] = useState(false);
  const [editingPrinciples, setEditingPrinciples] = useState(false);

  // Queue for processing updates sequentially
  const updateQueue = useRef<
    Array<{
      type: "update";
      payload: any;
      projectSnapshot: ApiEndpointsTabProps["project"];
    }>
  >([]);
  const isProcessingRef = useRef(false);

  // Extract API endpoints data from project
  const apiEndpoints = currentProject.api_endpoints as APIEndpoints;
  const displayApiEndpoints = displayProject.api_endpoints as APIEndpoints;

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

  // Filter endpoints based on search term
  useEffect(() => {
    if (!displayApiEndpoints || !searchTerm.trim()) {
      setFilteredResources([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = displayApiEndpoints.resources
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
  }, [searchTerm, displayApiEndpoints]);

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

      const result = await apiClient<ApiEndpointsTabProps["project"]>(
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
    type: "update",
    payload: any,
    updatedProject: ApiEndpointsTabProps["project"]
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

  // Update base URL
  const updateBaseUrl = (newBaseUrl: string) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedApiEndpoints = updatedProject.api_endpoints as APIEndpoints;
    updatedApiEndpoints.base_url = newBaseUrl;
    updatedProject.api_endpoints = updatedApiEndpoints;

    queueUpdate(
      "update",
      { field: "base_url", value: newBaseUrl },
      updatedProject
    );
    setEditingBaseUrl(false);
  };

  // Update authentication type
  const updateAuthType = (newAuthType: string) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedApiEndpoints = updatedProject.api_endpoints as APIEndpoints;
    updatedApiEndpoints.authentication.type = newAuthType;
    updatedProject.api_endpoints = updatedApiEndpoints;

    queueUpdate(
      "update",
      { field: "auth_type", value: newAuthType },
      updatedProject
    );
    setEditingAuthType(false);
  };

  // Update authentication description
  const updateAuthDescription = (newAuthDescription: string) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedApiEndpoints = updatedProject.api_endpoints as APIEndpoints;
    updatedApiEndpoints.authentication.description = newAuthDescription;
    updatedProject.api_endpoints = updatedApiEndpoints;

    queueUpdate(
      "update",
      { field: "auth_description", value: newAuthDescription },
      updatedProject
    );
    setEditingAuthDescription(false);
  };

  // Update design principles
  const updatePrinciples = (newPrinciples: string[]) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedApiEndpoints = updatedProject.api_endpoints as APIEndpoints;
    updatedApiEndpoints.api_design_principles = newPrinciples;
    updatedProject.api_endpoints = updatedApiEndpoints;

    queueUpdate(
      "update",
      { field: "principles", value: newPrinciples },
      updatedProject
    );
    setEditingPrinciples(false);
  };

  // Get resources to display (either filtered or all)
  const resourcesToDisplay =
    searchTerm.trim() !== ""
      ? filteredResources
      : displayApiEndpoints?.resources || apiEndpoints?.resources || [];

  // Update resource
  const handleUpdateResource = (index: number, updatedResource: Resource) => {
    if (!displayApiEndpoints) return;

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedApiEndpoints = updatedProject.api_endpoints as APIEndpoints;
    updatedApiEndpoints.resources[index] = updatedResource;
    updatedProject.api_endpoints = updatedApiEndpoints;

    queueUpdate(
      "update",
      { field: "resource", index, value: updatedResource },
      updatedProject
    );
  };

  // Delete resource
  const handleDeleteResource = (index: number) => {
    if (!displayApiEndpoints) return;

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedApiEndpoints = updatedProject.api_endpoints as APIEndpoints;
    updatedApiEndpoints.resources.splice(index, 1);
    updatedProject.api_endpoints = updatedApiEndpoints;

    queueUpdate("update", { field: "delete_resource", index }, updatedProject);
  };

  // Add new resource
  const handleAddResource = (newResource: Resource) => {
    if (!displayApiEndpoints) return;

    // Check if resource name already exists
    if (
      displayApiEndpoints.resources.some((r) => r.name === newResource.name)
    ) {
      showToast(
        "Resource name already exists",
        "Please choose a different name",
        "destructive"
      );
      return;
    }

    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const updatedApiEndpoints = updatedProject.api_endpoints as APIEndpoints;
    updatedApiEndpoints.resources.push(newResource);
    updatedProject.api_endpoints = updatedApiEndpoints;

    queueUpdate(
      "update",
      { field: "add_resource", value: newResource },
      updatedProject
    );
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
        {/* Header */}
        <div className="flex items-center gap-2">
          <ServerCrash className="h-6 w-6 text-primary-cta" />
          <h2 className="text-xl font-semibold">API Documentation</h2>
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
                {editingBaseUrl ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={displayApiEndpoints?.base_url}
                      onChange={(e) => {
                        const updatedProject = { ...displayProject };
                        const updatedApiEndpoints =
                          updatedProject.api_endpoints as APIEndpoints;
                        updatedApiEndpoints.base_url = e.target.value;
                        setDisplayProject(updatedProject);
                      }}
                      className="h-7 w-full sm:w-64 text-sm bg-primary-background"
                    />
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() =>
                        updateBaseUrl(displayApiEndpoints?.base_url || "")
                      }
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        setDisplayProject({ ...displayProject });
                        setEditingBaseUrl(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-hover-active text-primary-text text-xs py-1">
                      {displayApiEndpoints.base_url}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setEditingBaseUrl(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          displayApiEndpoints.base_url
                        )
                      }
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* Auth Info */}
              <div className="bg-primary-background border border-divider p-3 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3.5 w-3.5 text-amber-400" />
                  <span className="font-medium text-sm">Authentication:</span>
                  {editingAuthType ? (
                    <div className="flex items-center gap-2 ml-2">
                      <Input
                        value={displayApiEndpoints?.authentication.type}
                        onChange={(e) => {
                          const updatedProject = { ...displayProject };
                          const updatedApiEndpoints =
                            updatedProject.api_endpoints as APIEndpoints;
                          updatedApiEndpoints.authentication.type =
                            e.target.value;
                          setDisplayProject(updatedProject);
                        }}
                        className="h-7 w-48 text-xs bg-hover-active/30"
                      />
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() =>
                          updateAuthType(
                            displayApiEndpoints?.authentication.type || ""
                          )
                        }
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingAuthType(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-primary-text">
                        {displayApiEndpoints.authentication.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setEditingAuthType(true)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {editingAuthDescription ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      value={displayApiEndpoints?.authentication.description}
                      onChange={(e) => {
                        const updatedProject = { ...displayProject };
                        const updatedApiEndpoints =
                          updatedProject.api_endpoints as APIEndpoints;
                        updatedApiEndpoints.authentication.description =
                          e.target.value;
                        setDisplayProject(updatedProject);
                      }}
                      className="text-xs bg-hover-active/30 resize-none min-h-[80px] p-2"
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setEditingAuthDescription(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() =>
                          updateAuthDescription(
                            displayApiEndpoints?.authentication.description ||
                              ""
                          )
                        }
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <p className="text-secondary-text text-xs leading-relaxed flex-1">
                      {displayApiEndpoints.authentication.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={() => setEditingAuthDescription(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {/* API Principles */}
              <div className="bg-primary-background border border-divider p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-primary-cta" />
                    <span className="font-medium text-sm">
                      API Design Principles
                    </span>
                  </div>
                  {!editingPrinciples && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setEditingPrinciples(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div
                  className={`overflow-y-auto scrollbar-thin ${
                    showAllPrinciples ? "max-h-48 sm:max-h-96" : "max-h-24"
                  }`}
                >
                  {editingPrinciples ? (
                    <PrinciplesEditor
                      principles={
                        displayApiEndpoints?.api_design_principles || []
                      }
                      onSave={(newPrinciples) =>
                        updatePrinciples(newPrinciples)
                      }
                      onCancel={() => setEditingPrinciples(false)}
                    />
                  ) : (
                    <ul className="text-xs leading-relaxed space-y-1 pl-4 marker:text-primary-cta list-disc scrollbar-thin">
                      {(showAllPrinciples
                        ? displayApiEndpoints.api_design_principles
                        : displayApiEndpoints.api_design_principles.slice(0, 3)
                      ).map((principle: any, idx: any) => (
                        <li key={idx} className="text-secondary-text">
                          {principle}
                        </li>
                      ))}
                      {!showAllPrinciples &&
                        displayApiEndpoints.api_design_principles.length >
                          3 && (
                          <li
                            className="text-primary-cta text-xs cursor-pointer hover:text-white"
                            onClick={() =>
                              setShowAllPrinciples(!showAllPrinciples)
                            }
                          >
                            +
                            {displayApiEndpoints.api_design_principles.length -
                              3}{" "}
                            more
                          </li>
                        )}
                      {showAllPrinciples && (
                        <li
                          className="text-primary-cta text-xs cursor-pointer hover:text-white"
                          onClick={() =>
                            setShowAllPrinciples(!showAllPrinciples)
                          }
                        >
                          Less
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Add Resource Button */}
        <div className="flex items-center gap-3 justify-end bg-secondary-background p-3 rounded-md border border-divider">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewResourceDialog(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Resource
          </Button>
        </div>

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
              baseUrl={displayApiEndpoints?.base_url || apiEndpoints.base_url}
              onUpdateResource={(updatedResource) =>
                handleUpdateResource(idx, updatedResource)
              }
              onDeleteResource={() => handleDeleteResource(idx)}
            />
          ))}
        </div>

        {/* New Resource Dialog */}
        <NewResourceDialog
          open={showNewResourceDialog}
          onOpenChange={setShowNewResourceDialog}
          onAddResource={handleAddResource}
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

// Principles Editor Component
function PrinciplesEditor({
  principles,
  onSave,
  onCancel,
}: {
  principles: string[];
  onSave: (principles: string[]) => void;
  onCancel: () => void;
}) {
  const [editedPrinciples, setEditedPrinciples] = useState([...principles]);

  const updatePrinciple = (index: number, value: string) => {
    const newPrinciples = [...editedPrinciples];
    newPrinciples[index] = value;
    setEditedPrinciples(newPrinciples);
  };

  const deletePrinciple = (index: number) => {
    const newPrinciples = [...editedPrinciples];
    newPrinciples.splice(index, 1);
    setEditedPrinciples(newPrinciples);
  };

  const addPrinciple = () => {
    setEditedPrinciples([...editedPrinciples, ""]);
  };

  return (
    <div className="space-y-2">
      {editedPrinciples.map((principle, idx) => (
        <div key={idx} className="flex items-center gap-1.5">
          <Input
            value={principle}
            onChange={(e) => updatePrinciple(idx, e.target.value)}
            className="h-7 bg-hover-active/30 text-xs flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:text-red-400"
            onClick={() => deletePrinciple(idx)}
          >
            <Trash2 className="h-3 w-3 " />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-primary-cta text-xs h-7"
        onClick={addPrinciple}
      >
        <Plus className="h-3 w-3 mr-1" /> Add Principle
      </Button>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => onSave(editedPrinciples)}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
