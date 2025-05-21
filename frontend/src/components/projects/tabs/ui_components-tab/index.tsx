"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MonitorSmartphone,
  Layout,
  AlertTriangle,
  Search,
  Edit,
  PlusCircle,
  X,
  Save,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";

import { apiClient } from "@/lib/api";
import {
  Screen,
  UIComponents,
  UIComponentsTabProps,
  ToastState,
  Component,
} from "./types";
import { ComponentCard } from "./components/component-card";
import { ScreenHeader } from "./components/screen-header";
import { NewScreenDialog } from "./components/dialogs/new-screen-dialog";
import { NewComponentDialog } from "./components/dialogs/new-component-dialog";
import { componentTypeIcons } from "./constants";

export function UIComponentsTab({
  project: initialProject,
}: UIComponentsTabProps) {
  // Keep track of the most up to date project version
  const [currentProject, setCurrentProject] =
    useState<UIComponentsTabProps["project"]>(initialProject);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [editedUIComponents, setEditedUIComponents] =
    useState<UIComponents | null>(null);
  const [showNewScreenDialog, setShowNewScreenDialog] = useState(false);
  const [showNewComponentDialog, setShowNewComponentDialog] = useState(false);
  const [currentScreenForNewComponent, setCurrentScreenForNewComponent] =
    useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });

  // Initialize edited UI components from project data
  useEffect(() => {
    if (currentProject.ui_components && !editedUIComponents) {
      setEditedUIComponents(currentProject.ui_components as UIComponents);

      // Set the first screen as active if none is selected
      if (
        !activeScreen &&
        currentProject.ui_components.screens &&
        currentProject.ui_components.screens.length > 0
      ) {
        setActiveScreen(currentProject.ui_components.screens[0].name);
      }
    }
  }, [currentProject.ui_components, activeScreen]);

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

  // Get UI components to display
  const uiComponents = isEditing
    ? editedUIComponents
    : (currentProject.ui_components as UIComponents | undefined);

  // Filter screens and components based on search term
  const filteredScreens = useMemo(() => {
    const currentScreens = isEditing
      ? editedUIComponents?.screens
      : uiComponents?.screens || [];
    console.log(currentScreens);
    console.log(isEditing);
    return currentScreens?.filter(
      (screen) =>
        screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.components.some(
          (component) =>
            component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            component.functionality
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
        )
    );
  }, [searchTerm, currentProject.ui_components, isEditing, editedUIComponents]);

  // Get the active screen object
  const getActiveScreenObject = () => {
    if (!uiComponents || !activeScreen) return null;
    return (
      uiComponents.screens.find((screen) => screen.name === activeScreen) ||
      null
    );
  };

  // Update screen data
  const handleUpdateScreen = (screenName: string, updatedScreen: Screen) => {
    if (!editedUIComponents) return;

    // Make a deep copy to ensure state updates properly
    const newUIComponents = {
      ...editedUIComponents,
      screens: [...editedUIComponents.screens],
    };

    const index = newUIComponents.screens.findIndex(
      (s) => s.name === screenName
    );

    if (index !== -1) {
      // Replace screen with updated version
      newUIComponents.screens[index] = updatedScreen;

      // Update state
      setEditedUIComponents(newUIComponents);
      setUnsavedChanges(true);
    }
  };

  // Delete screen
  const handleDeleteScreen = (screenName: string) => {
    if (!editedUIComponents) return;

    // Remove screen
    const newScreens = editedUIComponents.screens.filter(
      (s) => s.name !== screenName
    );

    const newUIComponents = {
      screens: newScreens,
    };

    // Update state
    setEditedUIComponents(newUIComponents);
    console.log(editedUIComponents, "editedUIComponents");
    setUnsavedChanges(true);

    // If the deleted screen was active, set the first available screen as active
    if (activeScreen === screenName && newScreens.length > 0) {
      console.log("newScreens", newScreens);
      setActiveScreen(newScreens[0].name);
    } else if (newScreens.length === 0) {
      setActiveScreen(null);
    }
  };

  // Add new screen
  const handleAddScreen = (newScreen: Screen) => {
    if (!editedUIComponents) return;

    // Check if screen name already exists
    if (editedUIComponents.screens.some((s) => s.name === newScreen.name)) {
      showToast(
        "Screen name already exists",
        "Please choose a different name",
        "destructive"
      );
      return;
    }

    // Create a new UI components object with the new screen
    const newUIComponents = {
      ...editedUIComponents,
      screens: [...editedUIComponents.screens, newScreen],
    };

    // Update state
    setEditedUIComponents(newUIComponents);
    setUnsavedChanges(true);
    setActiveScreen(newScreen.name);
  };

  // Add new component to a screen
  const handleAddComponent = (screenName: string, newComponent: Component) => {
    if (!editedUIComponents) return;

    // Find the screen
    const screenIndex = editedUIComponents.screens.findIndex(
      (s) => s.name === screenName
    );

    if (screenIndex === -1) return;

    // Check if component name already exists in the screen
    const screen = editedUIComponents.screens[screenIndex];
    if (screen.components.some((c) => c.name === newComponent.name)) {
      showToast(
        "Component name already exists in this screen",
        "Please choose a different name",
        "destructive"
      );
      return;
    }

    // Create a deep copy of the screens array
    const updatedScreens = [...editedUIComponents.screens];

    // Add the new component to the screen
    updatedScreens[screenIndex] = {
      ...screen,
      components: [...screen.components, newComponent],
    };

    // Update state
    setEditedUIComponents({
      ...editedUIComponents,
      screens: updatedScreens,
    });
    setUnsavedChanges(true);
  };

  // Update component in a screen
  const handleUpdateComponent = (
    screenName: string,
    componentName: string,
    updatedComponent: Component
  ) => {
    if (!editedUIComponents) return;

    // Find the screen
    const screenIndex = editedUIComponents.screens.findIndex(
      (s) => s.name === screenName
    );

    if (screenIndex === -1) return;

    // Find the component
    const screen = editedUIComponents.screens[screenIndex];
    const componentIndex = screen.components.findIndex(
      (c) => c.name === componentName
    );

    if (componentIndex === -1) return;

    // Create a deep copy of the screens array
    const updatedScreens = [...editedUIComponents.screens];

    // Update the component
    const updatedComponents = [...screen.components];
    updatedComponents[componentIndex] = updatedComponent;

    updatedScreens[screenIndex] = {
      ...screen,
      components: updatedComponents,
    };

    // Update state
    setEditedUIComponents({
      ...editedUIComponents,
      screens: updatedScreens,
    });
    setUnsavedChanges(true);
  };

  // Delete component from a screen
  const handleDeleteComponent = (screenName: string, componentName: string) => {
    if (!editedUIComponents) return;

    // Find the screen
    const screenIndex = editedUIComponents.screens.findIndex(
      (s) => s.name === screenName
    );

    if (screenIndex === -1) return;

    // Create a deep copy of the screens array
    const updatedScreens = [...editedUIComponents.screens];

    // Filter out the component
    const screen = updatedScreens[screenIndex];
    updatedScreens[screenIndex] = {
      ...screen,
      components: screen.components.filter((c) => c.name !== componentName),
    };

    // Update state
    setEditedUIComponents({
      ...editedUIComponents,
      screens: updatedScreens,
    });
    setUnsavedChanges(true);
  };

  // Save changes to the database
  const saveChanges = async () => {
    if (!editedUIComponents) return;

    setIsSaving(true);

    try {
      // Create a copy of the project object
      const updatedProject = { ...currentProject };

      // Update the ui_components field
      updatedProject.ui_components = editedUIComponents;

      // Make the API call using apiClient
      const result = await apiClient<UIComponentsTabProps["project"]>(
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
    setEditedUIComponents(currentProject.ui_components as UIComponents);
    setIsEditing(false);
    setUnsavedChanges(false);
  };

  // Show the add component dialog for a specific screen
  const handleShowAddComponentDialog = (screenName: string) => {
    setCurrentScreenForNewComponent(screenName);
    setShowNewComponentDialog(true);
  };

  // If UI components not available yet
  if (!uiComponents || Object.keys(uiComponents).length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-12 w-12 text-secondary-text" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          UI Components Not Available
        </h3>
        <p className="text-secondary-text max-w-md mx-auto">
          This project doesn't have UI components defined yet. You can generate
          them from the Plan Generation page.
        </p>
      </div>
    );
  }

  // If no screens are available
  if (uiComponents.screens.length === 0) {
    return (
      <ToastProvider>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-6 w-6 text-primary-cta" />
              <h2 className="text-xl font-semibold">UI Components</h2>
              <Badge className="bg-hover-active text-primary-text ml-1">
                0 screens
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true);
                  setShowNewScreenDialog(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-1" /> Add First Screen
              </Button>
            </div>
          </div>

          {/* Empty state */}
          <div className="p-8 text-center border border-divider rounded-md bg-secondary-background">
            <Layout className="h-16 w-16 text-secondary-text mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Screens Defined</h3>
            <p className="text-secondary-text max-w-md mx-auto mb-6">
              Start building your UI by adding screens and components to your
              project.
            </p>
            <Button
              onClick={() => {
                setIsEditing(true);
                setShowNewScreenDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add First Screen
            </Button>
          </div>

          {/* Dialogs */}
          <NewScreenDialog
            open={showNewScreenDialog}
            onOpenChange={setShowNewScreenDialog}
            onAddScreen={handleAddScreen}
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

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header with Search and Edit Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="h-6 w-6 text-primary-cta" />
            <h2 className="text-xl font-semibold">UI Components</h2>
            <Badge className="bg-hover-active text-primary-text ml-1">
              {uiComponents.screens.length} screens
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-text h-4 w-4" />
              <Input
                placeholder="Search screens or components..."
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
                  <Edit className="h-4 w-4 mr-1" /> Edit Components
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
              onClick={() => setShowNewScreenDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Screen
            </Button>
          </div>
        )}

        {/* Main Content - Split View with Screens and Components */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left sidebar - Screen List */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-secondary-background border border-divider rounded-md overflow-hidden">
              <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
                <h3 className="font-semibold">Screens</h3>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setShowNewScreenDialog(true)}
                  >
                    <PlusCircle className="h-3.5 w-3.5 text-primary-cta" />
                  </Button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin">
                {filteredScreens?.map((screen) => (
                  <div
                    key={screen.name}
                    className={`w-full cursor-pointer px-4 py-3 text-left border-b border-divider last:border-0 flex items-center justify-between hover:bg-hover-active/10 transition-colors ${
                      activeScreen === screen.name
                        ? "bg-primary-cta/5 border-l-2 border-l-primary-cta"
                        : ""
                    }`}
                    onClick={() => setActiveScreen(screen.name)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <Layout className="h-4 w-4 text-primary-cta" />
                          <span className="font-medium truncate">
                            {screen.name}
                          </span>
                        </div>
                        <Badge className="bg-hover-active text-primary-text text-xs border-0">
                          {screen.components.length}
                        </Badge>
                      </div>
                      <div className="flex items-center mt-1 space-x-2">
                        <Badge
                          variant="outline"
                          className="bg-primary-background text-xs border-0"
                        >
                          {screen.route}
                        </Badge>
                      </div>
                    </div>
                    {isEditing && activeScreen === screen.name && (
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:text-red-400 hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScreen(screen.name);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area - Screen Details and Components */}
          <div className="lg:col-span-9 space-y-4">
            {activeScreen ? (
              <>
                {/* Active Screen Information */}
                <ScreenHeader
                  screen={getActiveScreenObject()!}
                  isEditing={isEditing}
                  onUpdateScreen={(updatedScreen: any) => {
                    if (activeScreen) {
                      handleUpdateScreen(activeScreen, updatedScreen);
                      if (updatedScreen.name !== activeScreen) {
                        setActiveScreen(updatedScreen.name);
                      }
                    }
                  }}
                />

                {/* Screen Components in Browser-like Frame */}
                <div className="bg-secondary-background border border-divider rounded-md overflow-hidden">
                  {/* Browser-like header */}
                  <div className="bg-primary-background px-3 py-2 border-b border-divider flex items-center">
                    <div className="flex gap-1.5 mr-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/70"></div>
                    </div>
                    <div className="bg-secondary-background flex-1 rounded-md px-3 py-1 text-sm text-center text-secondary-text truncate">
                      {getActiveScreenObject()?.route}
                    </div>
                  </div>

                  {/* Components container */}
                  <div className="p-4">
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                      <h3 className="font-semibold">Components</h3>
                      {isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleShowAddComponentDialog(activeScreen)
                          }
                          className=""
                        >
                          <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                          Component
                        </Button>
                      )}
                    </div>

                    {getActiveScreenObject()?.components.length === 0 ? (
                      <div className="p-6 text-center text-secondary-text">
                        <p>No components defined for this screen.</p>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() =>
                              handleShowAddComponentDialog(activeScreen)
                            }
                          >
                            <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                            Component
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getActiveScreenObject()?.components.map(
                          (component) => (
                            <ComponentCard
                              key={component.name}
                              component={component}
                              isEditing={isEditing}
                              onUpdate={(updatedComponent) =>
                                handleUpdateComponent(
                                  activeScreen,
                                  component.name,
                                  updatedComponent
                                )
                              }
                              onDelete={() =>
                                handleDeleteComponent(
                                  activeScreen,
                                  component.name
                                )
                              }
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-secondary-background border border-divider rounded-md p-6 text-center">
                <p className="text-secondary-text">
                  Select a screen from the list to view its details and
                  components.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dialogs */}
        <NewScreenDialog
          open={showNewScreenDialog}
          onOpenChange={setShowNewScreenDialog}
          onAddScreen={handleAddScreen}
        />

        <NewComponentDialog
          open={showNewComponentDialog}
          onOpenChange={setShowNewComponentDialog}
          onAddComponent={(component) => {
            if (currentScreenForNewComponent) {
              handleAddComponent(currentScreenForNewComponent, component);
              setCurrentScreenForNewComponent(null);
            }
          }}
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
