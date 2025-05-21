"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertTriangle, Edit } from "lucide-react";
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
import { VisionSection } from "./components/section-vision";
import { UsersSection } from "./components/section-users";
import { FeaturesSection } from "./components/section-features";
import { ScopeSection } from "./components/section-scope";
import { SuccessSection } from "./components/section-success";
import { RisksSection } from "./components/section-risks";
import { OverviewSection } from "./components/section-overview";

// Import types and helpers
import { HighLevelPlanTabProps, HighLevelPlan, ToastState } from "./types";
import {
  getSectionIcon,
  getSectionLabel,
  getStatusIcon,
  sections,
} from "./helpers";

export function HighLevelPlanTab({
  project: initialProject,
}: HighLevelPlanTabProps) {
  // Keep track of the most up to date project version
  const [currentProject, setCurrentProject] =
    useState<HighLevelPlanTabProps["project"]>(initialProject);
  const [selectedSection, setSelectedSection] = useState("overview");

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<HighLevelPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });

  // Initialize edited plan from project data
  useEffect(() => {
    if (currentProject.high_level_plan) {
      setEditedPlan(currentProject.high_level_plan as HighLevelPlan);
    }
  }, [currentProject.high_level_plan]);

  // Get data to display (either edited or original)
  const plan = isEditing
    ? editedPlan || ({} as HighLevelPlan)
    : (currentProject.high_level_plan as HighLevelPlan) ||
      ({} as HighLevelPlan);

  // If plan is not available yet
  if (!plan || Object.keys(plan).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          High-Level Plan Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have a high-level plan defined yet. You can
          generate one from the Plan Generation page.
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
    if (!editedPlan) return;

    setIsSaving(true);

    try {
      // Create a copy of the project object
      const updatedProject = { ...currentProject };

      // Update the high_level_plan field
      updatedProject.high_level_plan = editedPlan;

      // Make the API call using apiClient
      const result = await apiClient<HighLevelPlanTabProps["project"]>(
        `/projects/${currentProject.id}`,
        {
          method: "PUT",
          body: { high_level_plan: editedPlan },
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
    setEditedPlan(currentProject.high_level_plan as HighLevelPlan);
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  // Vision section update functions
  const updateVision = (value: string) => {
    if (!editedPlan) return;
    setEditedPlan({
      ...editedPlan,
      vision: value,
    });
    setUnsavedChanges(true);
  };

  const updateBusinessObjective = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.business_objectives) return;

    const updatedObjectives = [...editedPlan.business_objectives];
    updatedObjectives[index] = value;

    setEditedPlan({
      ...editedPlan,
      business_objectives: updatedObjectives,
    });
    setUnsavedChanges(true);
  };

  const addBusinessObjective = (value: string) => {
    if (!editedPlan || !value.trim()) return;

    setEditedPlan({
      ...editedPlan,
      business_objectives: [...(editedPlan.business_objectives || []), value],
    });
    setUnsavedChanges(true);
  };

  const deleteBusinessObjective = (index: number) => {
    if (!editedPlan || !editedPlan.business_objectives) return;

    const updatedObjectives = [...editedPlan.business_objectives];
    updatedObjectives.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      business_objectives: updatedObjectives,
    });
    setUnsavedChanges(true);
  };

  // Features section update functions
  const updateFeature = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.core_features) return;

    const updatedFeatures = [...editedPlan.core_features];
    updatedFeatures[index] = value;

    setEditedPlan({
      ...editedPlan,
      core_features: updatedFeatures,
    });
    setUnsavedChanges(true);
  };

  const addFeature = (value: string) => {
    if (!editedPlan || !value.trim()) return;

    setEditedPlan({
      ...editedPlan,
      core_features: [...(editedPlan.core_features || []), value],
    });
    setUnsavedChanges(true);
  };

  const deleteFeature = (index: number) => {
    if (!editedPlan || !editedPlan.core_features) return;

    const updatedFeatures = [...editedPlan.core_features];
    updatedFeatures.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      core_features: updatedFeatures,
    });
    setUnsavedChanges(true);
  };

  // Users section update functions
  const updateUser = (index: number, field: string, value: any) => {
    if (!editedPlan || !editedPlan.target_users) return;

    const updatedUsers = [...editedPlan.target_users];
    // @ts-ignore - We know the field exists on the object
    updatedUsers[index][field] = value;

    setEditedPlan({
      ...editedPlan,
      target_users: updatedUsers,
    });
    setUnsavedChanges(true);
  };

  const addUser = (userData: any) => {
    if (!editedPlan) return;

    setEditedPlan({
      ...editedPlan,
      target_users: [...(editedPlan.target_users || []), userData],
    });
    setUnsavedChanges(true);
  };

  const deleteUser = (index: number) => {
    if (!editedPlan || !editedPlan.target_users) return;

    const updatedUsers = [...editedPlan.target_users];
    updatedUsers.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      target_users: updatedUsers,
    });
    setUnsavedChanges(true);
  };

  // Update user needs/pain points
  const addUserNeed = (userIndex: number, need: string) => {
    if (!editedPlan || !editedPlan.target_users || !need.trim()) return;

    const updatedUsers = [...editedPlan.target_users];
    const needs = [...(updatedUsers[userIndex].needs || [])];

    needs.push(need);
    updatedUsers[userIndex].needs = needs;

    setEditedPlan({
      ...editedPlan,
      target_users: updatedUsers,
    });
    setUnsavedChanges(true);
  };

  const deleteUserNeed = (userIndex: number, needIndex: number) => {
    if (!editedPlan || !editedPlan.target_users) return;

    const updatedUsers = [...editedPlan.target_users];
    const needs = [...(updatedUsers[userIndex].needs || [])];

    needs.splice(needIndex, 1);
    updatedUsers[userIndex].needs = needs;

    setEditedPlan({
      ...editedPlan,
      target_users: updatedUsers,
    });
    setUnsavedChanges(true);
  };

  const addUserPainPoint = (userIndex: number, painPoint: string) => {
    if (!editedPlan || !editedPlan.target_users || !painPoint.trim()) return;

    const updatedUsers = [...editedPlan.target_users];
    const painPoints = [...(updatedUsers[userIndex].pain_points || [])];

    painPoints.push(painPoint);
    updatedUsers[userIndex].pain_points = painPoints;

    setEditedPlan({
      ...editedPlan,
      target_users: updatedUsers,
    });
    setUnsavedChanges(true);
  };

  const deleteUserPainPoint = (userIndex: number, pointIndex: number) => {
    if (!editedPlan || !editedPlan.target_users) return;

    const updatedUsers = [...editedPlan.target_users];
    const painPoints = [...(updatedUsers[userIndex].pain_points || [])];

    painPoints.splice(pointIndex, 1);
    updatedUsers[userIndex].pain_points = painPoints;

    setEditedPlan({
      ...editedPlan,
      target_users: updatedUsers,
    });
    setUnsavedChanges(true);
  };

  // Scope section update functions
  const addInScopeItem = (item: string) => {
    if (!editedPlan || !item.trim()) return;

    const currentScope = editedPlan.scope || { in_scope: [], out_of_scope: [] };

    setEditedPlan({
      ...editedPlan,
      scope: {
        ...currentScope,
        in_scope: [...(currentScope.in_scope || []), item],
      },
    });
    setUnsavedChanges(true);
  };

  const updateInScopeItem = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.scope?.in_scope) return;

    const updatedScope = { ...editedPlan.scope };
    updatedScope.in_scope[index] = value;

    setEditedPlan({
      ...editedPlan,
      scope: updatedScope,
    });
    setUnsavedChanges(true);
  };

  const deleteInScopeItem = (index: number) => {
    if (!editedPlan || !editedPlan.scope?.in_scope) return;

    const updatedScope = { ...editedPlan.scope };
    updatedScope.in_scope.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      scope: updatedScope,
    });
    setUnsavedChanges(true);
  };

  const addOutOfScopeItem = (item: string) => {
    if (!editedPlan || !item.trim()) return;

    const currentScope = editedPlan.scope || { in_scope: [], out_of_scope: [] };

    setEditedPlan({
      ...editedPlan,
      scope: {
        ...currentScope,
        out_of_scope: [...(currentScope.out_of_scope || []), item],
      },
    });
    setUnsavedChanges(true);
  };

  const updateOutOfScopeItem = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.scope?.out_of_scope) return;

    const updatedScope = { ...editedPlan.scope };
    updatedScope.out_of_scope[index] = value;

    setEditedPlan({
      ...editedPlan,
      scope: updatedScope,
    });
    setUnsavedChanges(true);
  };

  const deleteOutOfScopeItem = (index: number) => {
    if (!editedPlan || !editedPlan.scope?.out_of_scope) return;

    const updatedScope = { ...editedPlan.scope };
    updatedScope.out_of_scope.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      scope: updatedScope,
    });
    setUnsavedChanges(true);
  };

  // Success section update functions
  const updateSuccessCriteria = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.success_criteria) return;

    const updatedCriteria = [...editedPlan.success_criteria];
    updatedCriteria[index] = value;

    setEditedPlan({
      ...editedPlan,
      success_criteria: updatedCriteria,
    });
    setUnsavedChanges(true);
  };

  const addSuccessCriteria = (value: string) => {
    if (!editedPlan || !value.trim()) return;

    setEditedPlan({
      ...editedPlan,
      success_criteria: [...(editedPlan.success_criteria || []), value],
    });
    setUnsavedChanges(true);
  };

  const deleteSuccessCriteria = (index: number) => {
    if (!editedPlan || !editedPlan.success_criteria) return;

    const updatedCriteria = [...editedPlan.success_criteria];
    updatedCriteria.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      success_criteria: updatedCriteria,
    });
    setUnsavedChanges(true);
  };

  const updateConstraint = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.constraints) return;

    const updatedConstraints = [...editedPlan.constraints];
    updatedConstraints[index] = value;

    setEditedPlan({
      ...editedPlan,
      constraints: updatedConstraints,
    });
    setUnsavedChanges(true);
  };

  const addConstraint = (value: string) => {
    if (!editedPlan || !value.trim()) return;

    setEditedPlan({
      ...editedPlan,
      constraints: [...(editedPlan.constraints || []), value],
    });
    setUnsavedChanges(true);
  };

  const deleteConstraint = (index: number) => {
    if (!editedPlan || !editedPlan.constraints) return;

    const updatedConstraints = [...editedPlan.constraints];
    updatedConstraints.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      constraints: updatedConstraints,
    });
    setUnsavedChanges(true);
  };

  const updateAssumption = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.assumptions) return;

    const updatedAssumptions = [...editedPlan.assumptions];
    updatedAssumptions[index] = value;

    setEditedPlan({
      ...editedPlan,
      assumptions: updatedAssumptions,
    });
    setUnsavedChanges(true);
  };

  const addAssumption = (value: string) => {
    if (!editedPlan || !value.trim()) return;

    setEditedPlan({
      ...editedPlan,
      assumptions: [...(editedPlan.assumptions || []), value],
    });
    setUnsavedChanges(true);
  };

  const deleteAssumption = (index: number) => {
    if (!editedPlan || !editedPlan.assumptions) return;

    const updatedAssumptions = [...editedPlan.assumptions];
    updatedAssumptions.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      assumptions: updatedAssumptions,
    });
    setUnsavedChanges(true);
  };

  const updateTechStack = (index: number, value: string) => {
    if (!editedPlan || !editedPlan.tech_stack) return;

    const updatedTechStack = [...editedPlan.tech_stack];
    updatedTechStack[index] = value;

    setEditedPlan({
      ...editedPlan,
      tech_stack: updatedTechStack,
    });
    setUnsavedChanges(true);
  };

  const addTechStack = (value: string) => {
    if (!editedPlan || !value.trim()) return;

    setEditedPlan({
      ...editedPlan,
      tech_stack: [...(editedPlan.tech_stack || []), value],
    });
    setUnsavedChanges(true);
  };

  const deleteTechStack = (index: number) => {
    if (!editedPlan || !editedPlan.tech_stack) return;

    const updatedTechStack = [...editedPlan.tech_stack];
    updatedTechStack.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      tech_stack: updatedTechStack,
    });
    setUnsavedChanges(true);
  };

  // Risks section update functions
  const updateRisk = (index: number, field: string, value: any) => {
    if (!editedPlan || !editedPlan.risks) return;

    const updatedRisks = [...editedPlan.risks];
    // @ts-ignore - We know the field exists on the object
    updatedRisks[index][field] = value;

    setEditedPlan({
      ...editedPlan,
      risks: updatedRisks,
    });
    setUnsavedChanges(true);
  };

  const addRisk = (riskData: any) => {
    if (!editedPlan) return;

    setEditedPlan({
      ...editedPlan,
      risks: [...(editedPlan.risks || []), riskData],
    });
    setUnsavedChanges(true);
  };

  const deleteRisk = (index: number) => {
    if (!editedPlan || !editedPlan.risks) return;

    const updatedRisks = [...editedPlan.risks];
    updatedRisks.splice(index, 1);

    setEditedPlan({
      ...editedPlan,
      risks: updatedRisks,
    });
    setUnsavedChanges(true);
  };

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Plan Summary Card with Quick Navigation */}
        <Card className="border border-divider bg-secondary-background overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-1">
                  {(() => {
                    const Icon = getSectionIcon("overview");
                    return <Icon className="h-5 w-5 text-primary-cta" />;
                  })()}
                  Project Plan Overview
                </h3>
                <p className="text-secondary-text">
                  Navigate through the key aspects of your project plan
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
                    <Edit className="h-4 w-4 mr-1" /> Edit Plan
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
              {Object.entries(sections).map(([key, string]) => {
                const Icon = getSectionIcon(key);
                const StatusIcon = getSectionIcon(key);
                const label = getSectionLabel(key);

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
                    <StatusIcon
                      className={cn(
                        "h-4 w-4",
                        selectedSection === key
                          ? "text-primary-cta"
                          : "text-primary-text"
                      )}
                    />
                    <div className="flex-1 truncate text-sm font-medium">
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Interactive Plan Content */}
        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="wait">
            {selectedSection === "overview" && (
              <OverviewSection
                plan={plan}
                isEditing={isEditing}
                setSelectedSection={setSelectedSection}
              />
            )}

            {selectedSection === "vision" && (
              <VisionSection
                plan={plan}
                isEditing={isEditing}
                updateVision={updateVision}
                updateBusinessObjective={updateBusinessObjective}
                addBusinessObjective={addBusinessObjective}
                deleteBusinessObjective={deleteBusinessObjective}
              />
            )}

            {selectedSection === "users" && (
              <UsersSection
                plan={plan}
                isEditing={isEditing}
                updateUser={updateUser}
                addUser={addUser}
                deleteUser={deleteUser}
                addUserNeed={addUserNeed}
                deleteUserNeed={deleteUserNeed}
                addUserPainPoint={addUserPainPoint}
                deleteUserPainPoint={deleteUserPainPoint}
              />
            )}

            {selectedSection === "features" && (
              <FeaturesSection
                plan={plan}
                isEditing={isEditing}
                updateFeature={updateFeature}
                addFeature={addFeature}
                deleteFeature={deleteFeature}
              />
            )}

            {selectedSection === "scope" && (
              <ScopeSection
                plan={plan}
                isEditing={isEditing}
                updateInScopeItem={updateInScopeItem}
                addInScopeItem={addInScopeItem}
                deleteInScopeItem={deleteInScopeItem}
                updateOutOfScopeItem={updateOutOfScopeItem}
                addOutOfScopeItem={addOutOfScopeItem}
                deleteOutOfScopeItem={deleteOutOfScopeItem}
              />
            )}

            {selectedSection === "success" && (
              <SuccessSection
                plan={plan}
                isEditing={isEditing}
                updateSuccessCriteria={updateSuccessCriteria}
                addSuccessCriteria={addSuccessCriteria}
                deleteSuccessCriteria={deleteSuccessCriteria}
                updateConstraint={updateConstraint}
                addConstraint={addConstraint}
                deleteConstraint={deleteConstraint}
                updateAssumption={updateAssumption}
                addAssumption={addAssumption}
                deleteAssumption={deleteAssumption}
                updateTechStack={updateTechStack}
                addTechStack={addTechStack}
                deleteTechStack={deleteTechStack}
              />
            )}

            {selectedSection === "risks" && (
              <RisksSection
                plan={plan}
                isEditing={isEditing}
                updateRisk={updateRisk}
                addRisk={addRisk}
                deleteRisk={deleteRisk}
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
