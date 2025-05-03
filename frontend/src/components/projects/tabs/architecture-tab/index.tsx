"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, Edit, ChevronsLeftRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

// Import section components
import { ComponentsSection } from "./components/section-components";
import { CommunicationSection } from "./components/section-communication";
import { InfrastructureSection } from "./components/section-infrastructure";
import { OverviewSection } from "./components/section-overview";
import { PatternsSection } from "./components/section-patterns";

// Import types and helpers
import {
  ArchitectureTabProps,
  TechnicalArchitecture,
  ToastState,
} from "./types";
import { sections, getSectionIcon, getSectionLabel } from "./helpers";

export function ArchitectureTab({
  project: initialProject,
}: ArchitectureTabProps) {
  // Keep track of the most up to date project version
  const [currentProject, setCurrentProject] =
    useState<ArchitectureTabProps["project"]>(initialProject);
  const [selectedSection, setSelectedSection] = useState("overview");

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editedArchitecture, setEditedArchitecture] =
    useState<TechnicalArchitecture | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });

  // Initialize edited architecture from project data
  useEffect(() => {
    if (currentProject.technical_architecture) {
      setEditedArchitecture(currentProject.technical_architecture);
    }
  }, [currentProject.technical_architecture]);

  // Get data to display (either edited or original)
  const architecture = isEditing
    ? editedArchitecture || ({} as TechnicalArchitecture)
    : currentProject.technical_architecture || ({} as TechnicalArchitecture);

  // Calculate section completion status

  // If architecture is not available yet
  if (!architecture || Object.keys(architecture).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Technical Architecture Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have a technical architecture defined yet. You
          can generate one from the Plan Generation page.
        </p>
      </div>
    );
  }

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

  // Save changes to the database
  const saveChanges = async () => {
    if (!editedArchitecture) return;

    setIsSaving(true);

    try {
      // Create a copy of the project object
      const updatedProject = { ...currentProject };

      // Update the technical_architecture field
      updatedProject.technical_architecture = editedArchitecture;

      // Make the API call using apiClient
      const result = await apiClient<ArchitectureTabProps["project"]>(
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
    setEditedArchitecture(currentProject.technical_architecture);
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  // Update functions

  // Overview section
  const updateOverview = (value: string) => {
    if (!editedArchitecture) return;
    setEditedArchitecture({
      ...editedArchitecture,
      architecture_overview: value,
    });
    setUnsavedChanges(true);
  };

  const updateDiagramDescription = (value: string) => {
    if (!editedArchitecture) return;
    setEditedArchitecture({
      ...editedArchitecture,
      architecture_diagram_description: value,
    });
    setUnsavedChanges(true);
  };

  // System Components Update Functions
  const updateComponent = (index: number, field: string, value: any) => {
    if (!editedArchitecture || !editedArchitecture.system_components) return;

    const updatedComponents = [...editedArchitecture.system_components];
    // @ts-ignore
    updatedComponents[index][field] = value;

    setEditedArchitecture({
      ...editedArchitecture,
      system_components: updatedComponents,
    });
    setUnsavedChanges(true);
  };

  const addComponent = () => {
    if (!editedArchitecture) return;

    const newComponent = {
      name: "New Component",
      type: "Service",
      description: "Description of the new component",
      technologies: [],
      responsibilities: [],
    };

    setEditedArchitecture({
      ...editedArchitecture,
      system_components: [
        ...(editedArchitecture.system_components || []),
        newComponent,
      ],
    });
    setUnsavedChanges(true);
  };

  const deleteComponent = (index: number) => {
    if (!editedArchitecture || !editedArchitecture.system_components) return;

    const updatedComponents = [...editedArchitecture.system_components];
    updatedComponents.splice(index, 1);

    setEditedArchitecture({
      ...editedArchitecture,
      system_components: updatedComponents,
    });
    setUnsavedChanges(true);
  };

  // Technology Management
  const addTechnology = (componentIndex: number, technology: string) => {
    if (!editedArchitecture || !editedArchitecture.system_components) return;
    if (!technology.trim()) return;

    const updatedComponents = [...editedArchitecture.system_components];
    const technologies = [
      ...(updatedComponents[componentIndex].technologies || []),
    ];

    if (!technologies.includes(technology)) {
      technologies.push(technology);

      updatedComponents[componentIndex].technologies = technologies;

      setEditedArchitecture({
        ...editedArchitecture,
        system_components: updatedComponents,
      });
      setUnsavedChanges(true);
    }
  };

  const deleteTechnology = (componentIndex: number, techIndex: number) => {
    if (!editedArchitecture || !editedArchitecture.system_components) return;

    const updatedComponents = [...editedArchitecture.system_components];
    const technologies = [
      ...(updatedComponents[componentIndex].technologies || []),
    ];

    technologies.splice(techIndex, 1);
    updatedComponents[componentIndex].technologies = technologies;

    setEditedArchitecture({
      ...editedArchitecture,
      system_components: updatedComponents,
    });
    setUnsavedChanges(true);
  };

  // Responsibility Management
  const addResponsibility = (
    componentIndex: number,
    responsibility: string
  ) => {
    if (!editedArchitecture || !editedArchitecture.system_components) return;
    if (!responsibility.trim()) return;

    const updatedComponents = [...editedArchitecture.system_components];
    const responsibilities = [
      ...(updatedComponents[componentIndex].responsibilities || []),
    ];

    if (!responsibilities.includes(responsibility)) {
      responsibilities.push(responsibility);

      updatedComponents[componentIndex].responsibilities = responsibilities;

      setEditedArchitecture({
        ...editedArchitecture,
        system_components: updatedComponents,
      });
      setUnsavedChanges(true);
    }
  };

  const deleteResponsibility = (componentIndex: number, respIndex: number) => {
    if (!editedArchitecture || !editedArchitecture.system_components) return;

    const updatedComponents = [...editedArchitecture.system_components];
    const responsibilities = [
      ...(updatedComponents[componentIndex].responsibilities || []),
    ];

    responsibilities.splice(respIndex, 1);
    updatedComponents[componentIndex].responsibilities = responsibilities;

    setEditedArchitecture({
      ...editedArchitecture,
      system_components: updatedComponents,
    });
    setUnsavedChanges(true);
  };

  // Communication Patterns Update Functions
  const updateCommunicationPattern = (
    index: number,
    field: string,
    value: any
  ) => {
    if (!editedArchitecture || !editedArchitecture.communication_patterns)
      return;

    const updatedPatterns = [...editedArchitecture.communication_patterns];
    // @ts-ignore
    updatedPatterns[index][field] = value;

    setEditedArchitecture({
      ...editedArchitecture,
      communication_patterns: updatedPatterns,
    });
    setUnsavedChanges(true);
  };

  const addCommunicationPattern = () => {
    if (!editedArchitecture) return;

    const newPattern = {
      source: "Source Component",
      target: "Target Component",
      protocol: "HTTP",
      pattern: "Request-Response",
      description: "Description of the communication pattern",
    };

    setEditedArchitecture({
      ...editedArchitecture,
      communication_patterns: [
        ...(editedArchitecture.communication_patterns || []),
        newPattern,
      ],
    });
    setUnsavedChanges(true);
  };

  const deleteCommunicationPattern = (index: number) => {
    if (!editedArchitecture || !editedArchitecture.communication_patterns)
      return;

    const updatedPatterns = [...editedArchitecture.communication_patterns];
    updatedPatterns.splice(index, 1);

    setEditedArchitecture({
      ...editedArchitecture,
      communication_patterns: updatedPatterns,
    });
    setUnsavedChanges(true);
  };

  // Architecture Patterns Update Functions
  const updateArchitecturePattern = (
    index: number,
    field: string,
    value: any
  ) => {
    if (!editedArchitecture || !editedArchitecture.architecture_patterns)
      return;

    const updatedPatterns = [...editedArchitecture.architecture_patterns];
    // @ts-ignore
    updatedPatterns[index][field] = value;

    setEditedArchitecture({
      ...editedArchitecture,
      architecture_patterns: updatedPatterns,
    });
    setUnsavedChanges(true);
  };

  const addArchitecturePattern = () => {
    if (!editedArchitecture) return;

    const newPattern = {
      name: "New Pattern",
      description: "Description of the architecture pattern",
    };

    setEditedArchitecture({
      ...editedArchitecture,
      architecture_patterns: [
        ...(editedArchitecture.architecture_patterns || []),
        newPattern,
      ],
    });
    setUnsavedChanges(true);
  };

  const deleteArchitecturePattern = (index: number) => {
    if (!editedArchitecture || !editedArchitecture.architecture_patterns)
      return;

    const updatedPatterns = [...editedArchitecture.architecture_patterns];
    updatedPatterns.splice(index, 1);

    setEditedArchitecture({
      ...editedArchitecture,
      architecture_patterns: updatedPatterns,
    });
    setUnsavedChanges(true);
  };

  // Infrastructure Update Functions
  const updateInfrastructure = (field: string, value: any) => {
    if (!editedArchitecture) return;

    const updatedInfrastructure = {
      ...(editedArchitecture.infrastructure || {}),
      [field]: value,
    };

    setEditedArchitecture({
      ...editedArchitecture,
      infrastructure: updatedInfrastructure,
    });
    setUnsavedChanges(true);
  };

  const addInfrastructureService = (service: string) => {
    if (!editedArchitecture || !service.trim()) return;

    const currentServices = editedArchitecture.infrastructure?.services || [];

    if (!currentServices.includes(service)) {
      const updatedServices = [...currentServices, service];

      const updatedInfrastructure = {
        ...(editedArchitecture.infrastructure || {}),
        services: updatedServices,
      };

      setEditedArchitecture({
        ...editedArchitecture,
        infrastructure: updatedInfrastructure,
      });
      setUnsavedChanges(true);
    }
  };

  const deleteInfrastructureService = (index: number) => {
    if (!editedArchitecture || !editedArchitecture.infrastructure?.services)
      return;

    const updatedServices = [...editedArchitecture.infrastructure.services];
    updatedServices.splice(index, 1);

    const updatedInfrastructure = {
      ...editedArchitecture.infrastructure,
      services: updatedServices,
    };

    setEditedArchitecture({
      ...editedArchitecture,
      infrastructure: updatedInfrastructure,
    });
    setUnsavedChanges(true);
  };

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Architecture Summary Card with Quick Navigation */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-1">
                  {(() => {
                    const Icon = getSectionIcon("overview");
                    return <Icon className="h-5 w-5 text-primary-cta" />;
                  })()}
                  Technical Architecture
                </h3>
                <p className="text-secondary-text">
                  Navigate through the components and structure of your system
                </p>
              </div>

              {/* Edit Controls */}
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
                    <Edit className="h-4 w-4 mr-1" /> Edit Architecture
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
              {Object.entries(sections).map(([key, string]) => {
                const label = getSectionLabel(key);
                const Icon = getSectionIcon(key);
                return (
                  <button
                    key={key}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md border border-divider text-left",
                      "hover:bg-hover-active transition-colors duration-200",
                      selectedSection === key
                        ? "bg-hover-active border-primary-cta"
                        : "bg-primary-background"
                    )}
                    onClick={() => setSelectedSection(key)}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        selectedSection === key
                          ? "text-primary-cta"
                          : "text-primary-text"
                      )}
                    />
                    {/* <StatusIcon className="h-4 w-4 " /> */}
                    <div className="flex-1 truncate text-sm font-medium">
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Interactive Architecture Content */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="wait">
            {selectedSection === "overview" && (
              <OverviewSection
                architecture={architecture}
                isEditing={isEditing}
                updateOverview={updateOverview}
                updateDiagramDescription={updateDiagramDescription}
                setSelectedSection={setSelectedSection}
              />
            )}

            {selectedSection === "components" && (
              <ComponentsSection
                architecture={architecture}
                isEditing={isEditing}
                updateComponent={updateComponent}
                addComponent={addComponent}
                deleteComponent={deleteComponent}
                addTechnology={addTechnology}
                deleteTechnology={deleteTechnology}
                addResponsibility={addResponsibility}
                deleteResponsibility={deleteResponsibility}
              />
            )}

            {selectedSection === "communication" && (
              <CommunicationSection
                architecture={architecture}
                isEditing={isEditing}
                updateCommunicationPattern={updateCommunicationPattern}
                addCommunicationPattern={addCommunicationPattern}
                deleteCommunicationPattern={deleteCommunicationPattern}
              />
            )}

            {selectedSection === "patterns" && (
              <PatternsSection
                architecture={architecture}
                isEditing={isEditing}
                updateArchitecturePattern={updateArchitecturePattern}
                addArchitecturePattern={addArchitecturePattern}
                deleteArchitecturePattern={deleteArchitecturePattern}
              />
            )}

            {selectedSection === "infrastructure" && (
              <InfrastructureSection
                architecture={architecture}
                isEditing={isEditing}
                updateInfrastructure={updateInfrastructure}
                addInfrastructureService={addInfrastructureService}
                deleteInfrastructureService={deleteInfrastructureService}
              />
            )}
          </AnimatePresence>
        </div>

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
