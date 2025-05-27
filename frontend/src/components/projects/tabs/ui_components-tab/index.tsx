"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  MonitorSmartphone,
  Layout,
  AlertTriangle,
  Search,
  PlusCircle,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { apiClient } from "@/lib/api";
import {
  Screen,
  UIComponents,
  UIComponentsTabProps,
  Component,
} from "./types";
import { ComponentCard } from "./components/component-card";
import { ScreenHeader } from "./components/screen-header";
import { NewScreenDialog } from "./components/dialogs/new-screen-dialog";
import { NewComponentDialog } from "./components/dialogs/new-component-dialog";

type UpdatePayload = {
  type: "screen" | "component" | "add-screen" | "add-component" | "delete-screen" | "delete-component";
  screenName?: string;
  componentName?: string;
  data?: any;
};

export function UIComponentsTab({
  project: initialProject,
}: UIComponentsTabProps) {
  // Keep track of the most up to date project version
  const [currentProject, setCurrentProject] =
    useState<UIComponentsTabProps["project"]>(initialProject);
  const [displayProject, setDisplayProject] =
    useState<UIComponentsTabProps["project"]>(initialProject);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [showNewScreenDialog, setShowNewScreenDialog] = useState(false);
  const [showNewComponentDialog, setShowNewComponentDialog] = useState(false);
  const [currentScreenForNewComponent, setCurrentScreenForNewComponent] =
    useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  // Queue for processing updates sequentially
  const updateQueue = useRef<
    Array<{
      payload: UpdatePayload;
      projectSnapshot: UIComponentsTabProps["project"];
    }>
  >([]);
  const isProcessingRef = useRef(false);

  // Initialize active screen
  useEffect(() => {
    if (
      !activeScreen &&
      currentProject.ui_components &&
      currentProject.ui_components.screens &&
      currentProject.ui_components.screens.length > 0
    ) {
      setActiveScreen(currentProject.ui_components.screens[0].name);
    }
  }, [currentProject.ui_components, activeScreen]);

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

  // Get UI components to display
  const uiComponents = displayProject.ui_components as UIComponents | undefined;

  // Filter screens and components based on search term
  const filteredScreens = useMemo(() => {
    const currentScreens = uiComponents?.screens || [];
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
  }, [searchTerm, uiComponents]);

  // Get the active screen object
  const getActiveScreenObject = () => {
    if (!uiComponents || !activeScreen) return null;
    return (
      uiComponents.screens.find((screen) => screen.name === activeScreen) ||
      null
    );
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

      // Send to server
      const result = await apiClient<UIComponentsTabProps["project"]>(
        `/projects/${currentProject.id}`,
        {
          method: "PUT",
          body: nextUpdate.projectSnapshot,
          token: localStorage.getItem("token") || undefined,
        }
      );

      // Update current project with server response
      setCurrentProject(result);

      // Show saved status
      setSavingStatus("saved");
    } catch (error) {
      console.error("Error saving changes:", error);
      setSavingStatus("idle");

      // Revert display project on error if this was the last item
      if (updateQueue.current.length === 0) {
        setDisplayProject(currentProject);
      }
    } finally {
      // Continue processing queue
      if (updateQueue.current.length > 0) {
        processQueue();
      } else {
        isProcessingRef.current = false;
      }
    }
  };

  // Queue update with immediate UI feedback
  const queueUpdate = (
    payload: UpdatePayload,
    updatedProject: UIComponentsTabProps["project"]
  ) => {
    // Update UI immediately
    setDisplayProject(updatedProject);

    // Create a deep copy of the project for the queue to prevent reference issues
    const projectSnapshot = JSON.parse(JSON.stringify(updatedProject));

    // Add update to queue
    updateQueue.current.push({
      payload,
      projectSnapshot,
    });

    // Start processing if not already processing
    if (!isProcessingRef.current) {
      processQueue();
    }
  };

  // Update screen data
  const handleUpdateScreen = (screenName: string, updatedScreen: Screen) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const uiComponents = updatedProject.ui_components as UIComponents;
    
    const index = uiComponents.screens.findIndex(
      (s: Screen) => s.name === screenName
    );

    if (index !== -1) {
      uiComponents.screens[index] = updatedScreen;
      
      // Update active screen if name changed
      if (screenName !== updatedScreen.name && activeScreen === screenName) {
        setActiveScreen(updatedScreen.name);
      }
      
      queueUpdate(
        { type: "screen", screenName, data: updatedScreen },
        updatedProject
      );
    }
  };

  // Delete screen
  const handleDeleteScreen = (screenName: string) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const uiComponents = updatedProject.ui_components as UIComponents;
    
    uiComponents.screens = uiComponents.screens.filter(
      (s: Screen) => s.name !== screenName
    );

    // Update active screen if needed
    if (activeScreen === screenName && uiComponents.screens.length > 0) {
      setActiveScreen(uiComponents.screens[0].name);
    } else if (uiComponents.screens.length === 0) {
      setActiveScreen(null);
    }

    queueUpdate(
      { type: "delete-screen", screenName },
      updatedProject
    );
  };

  // Add new screen
  const handleAddScreen = (newScreen: Screen) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    let uiComponents = updatedProject.ui_components as UIComponents;
    
    // Initialize ui_components if it doesn't exist
    if (!uiComponents) {
      uiComponents = { screens: [] };
      updatedProject.ui_components = uiComponents;
    }

    // Check if screen name already exists
    if (uiComponents.screens.some((s: Screen) => s.name === newScreen.name)) {
      // Show error toast or alert
      return;
    }

    uiComponents.screens.push(newScreen);
    setActiveScreen(newScreen.name);
    
    queueUpdate(
      { type: "add-screen", data: newScreen },
      updatedProject
    );
  };

  // Add new component to a screen
  const handleAddComponent = (screenName: string, newComponent: Component) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const uiComponents = updatedProject.ui_components as UIComponents;
    
    const screenIndex = uiComponents.screens.findIndex(
      (s: Screen) => s.name === screenName
    );

    if (screenIndex === -1) return;

    const screen = uiComponents.screens[screenIndex];
    if (screen.components.some((c: Component) => c.name === newComponent.name)) {
      // Show error toast or alert
      return;
    }

    screen.components.push(newComponent);
    
    queueUpdate(
      { type: "add-component", screenName, data: newComponent },
      updatedProject
    );
  };

  // Update component in a screen
  const handleUpdateComponent = (
    screenName: string,
    componentName: string,
    updatedComponent: Component
  ) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const uiComponents = updatedProject.ui_components as UIComponents;
    
    const screenIndex = uiComponents.screens.findIndex(
      (s: Screen) => s.name === screenName
    );

    if (screenIndex === -1) return;

    const screen = uiComponents.screens[screenIndex];
    const componentIndex = screen.components.findIndex(
      (c: Component) => c.name === componentName
    );

    if (componentIndex === -1) return;

    screen.components[componentIndex] = updatedComponent;
    
    queueUpdate(
      { type: "component", screenName, componentName, data: updatedComponent },
      updatedProject
    );
  };

  // Delete component from a screen
  const handleDeleteComponent = (screenName: string, componentName: string) => {
    const updatedProject = JSON.parse(JSON.stringify(displayProject));
    const uiComponents = updatedProject.ui_components as UIComponents;
    
    const screenIndex = uiComponents.screens.findIndex(
      (s: Screen) => s.name === screenName
    );

    if (screenIndex === -1) return;

    const screen = uiComponents.screens[screenIndex];
    screen.components = screen.components.filter(
      (c: Component) => c.name !== componentName
    );
    
    queueUpdate(
      { type: "delete-component", screenName, componentName },
      updatedProject
    );
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNewScreenDialog(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add First Screen
          </Button>
        </div>

        {/* Empty state */}
        <div className="p-8 text-center border border-divider rounded-md bg-secondary-background">
          <Layout className="h-16 w-16 text-secondary-text mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Screens Defined</h3>
          <p className="text-secondary-text max-w-md mx-auto mb-6">
            Start building your UI by adding screens and components to your
            project.
          </p>
          <Button onClick={() => setShowNewScreenDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add First Screen
          </Button>
        </div>

        {/* Dialogs */}
        <NewScreenDialog
          open={showNewScreenDialog}
          onOpenChange={setShowNewScreenDialog}
          onAddScreen={handleAddScreen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-2">
          <MonitorSmartphone className="h-6 w-6 text-primary-cta" />
          <h2 className="text-xl font-semibold">UI Components</h2>
          <Badge className="bg-hover-active text-primary-text ml-1">
            {uiComponents.screens.length} screens
          </Badge>
        </div>

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
      </div>

      {/* Main Content - Split View with Screens and Components */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left sidebar - Screen List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-secondary-background border border-divider rounded-md overflow-hidden">
            <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
              <h3 className="font-semibold">Screens</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setShowNewScreenDialog(true)}
              >
                <PlusCircle className="h-3.5 w-3.5 text-primary-cta" />
              </Button>
            </div>

            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin">
              {filteredScreens?.map((screen) => (
                <div
                  key={screen.name}
                  className={`w-full cursor-pointer px-4 py-3 text-left border-b border-divider last:border-0 hover:bg-hover-active/10 transition-colors ${
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
                onUpdateScreen={(updatedScreen: Screen) => {
                  handleUpdateScreen(activeScreen, updatedScreen);
                }}
                onDeleteScreen={() => handleDeleteScreen(activeScreen)}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleShowAddComponentDialog(activeScreen)
                      }
                    >
                      <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add
                      Component
                    </Button>
                  </div>

                  {getActiveScreenObject()?.components.length === 0 ? (
                    <div className="p-6 text-center text-secondary-text">
                      <p>No components defined for this screen.</p>
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
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getActiveScreenObject()?.components.map(
                        (component) => (
                          <ComponentCard
                            key={component.name}
                            component={component}
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
    </div>
  );
}