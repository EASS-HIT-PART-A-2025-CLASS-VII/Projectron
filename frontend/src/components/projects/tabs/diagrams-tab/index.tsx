"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileCode,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Download,
  Play,
  Cpu,
  GitBranch,
  AlertTriangle,
  Move,
  X,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { apiClient } from "@/lib/api";

// Types
type DiagramType = "class" | "sequence";

interface DiagramsTabProps {
  project: {
    id: string;
    name: string;
    class_diagram_svg?: string | null;
    sequence_diagram_svg?: string | null;
    [key: string]: any;
  };
}

interface ToastState {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface Position {
  x: number;
  y: number;
}

export function DiagramsTab({ project: initialProject }: DiagramsTabProps) {
  // State
  const [currentProject, setCurrentProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState<DiagramType>("sequence");
  const [loadingSequence, setLoadingSequence] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);
  const [fetchingSequence, setFetchingSequence] = useState(false);
  const [fetchingClass, setFetchingClass] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState<ToastState>({ open: false, title: "" });
  const [showChangeRequestDialog, setShowChangeRequestDialog] = useState(false);
  const [changeRequest, setChangeRequest] = useState("");

  // SVG display helpers
  const hasSequenceDiagram = !!currentProject.sequence_diagram_svg;
  const hasClassDiagram = !!currentProject.class_diagram_svg;

  // Fetch existing diagrams on component mount
  useEffect(() => {
    const fetchExistingDiagrams = async () => {
      // Only fetch if we don't already have the SVG content
      const promises = [];

      // Fetch sequence diagram if not already present
      if (!currentProject.sequence_diagram_svg) {
        setFetchingSequence(true);
        promises.push(
          fetchExistingDiagram("sequence")
            .catch((error) => {
              // Silently handle 404 errors (no diagram exists)
              if (error.message.includes("404")) {
                return null;
              }
              console.warn("Failed to fetch sequence diagram:", error);
              return null;
            })
            .finally(() => setFetchingSequence(false))
        );
      }

      // Fetch class diagram if not already present
      if (!currentProject.class_diagram_svg) {
        setFetchingClass(true);
        promises.push(
          fetchExistingDiagram("class")
            .catch((error) => {
              // Silently handle 404 errors (no diagram exists)
              if (error.message.includes("404")) {
                return null;
              }
              console.warn("Failed to fetch class diagram:", error);
              return null;
            })
            .finally(() => setFetchingClass(false))
        );
      }

      // Wait for all fetches to complete
      await Promise.all(promises);
    };

    fetchExistingDiagrams();
  }, [currentProject.id]); // Re-fetch if project changes

  // Function to fetch existing diagram
  const fetchExistingDiagram = async (
    type: DiagramType
  ): Promise<string | null> => {
    try {
      const svgContent = await apiClient<string>(
        `/diagrams/${type}/${currentProject.id}`,
        {
          method: "GET",
          responseType: "text",
        }
      );

      if (svgContent) {
        // Update the project state with the fetched SVG
        setCurrentProject((prev) => ({
          ...prev,
          [`${type}_diagram_svg`]: svgContent,
        }));
        return svgContent;
      }
      return null;
    } catch (error) {
      // Re-throw to be handled by caller
      throw error;
    }
  };

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

  // Handle zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Show change request dialog before updating
  const handleUpdateDiagram = () => {
    setShowChangeRequestDialog(true);
  };

  // Generate diagram function
  const generateDiagram = async (type: DiagramType, changeReq?: string) => {
    // Define isUpdating outside try block so it's available in catch block
    const isUpdating =
      type === "sequence" ? hasSequenceDiagram : hasClassDiagram;

    try {
      const endpoint = `/diagrams/${type}/${isUpdating ? "update" : "create"}`;

      // Set loading state
      if (type === "sequence") {
        setLoadingSequence(true);
      } else {
        setLoadingClass(true);
      }

      // Make API call
      const response = await apiClient<string>(endpoint, {
        method: isUpdating ? "PUT" : "POST",
        body: {
          project_id: currentProject.id,
          change_request: changeReq || undefined,
        },
        responseType: "text",
      });

      // Update project state
      if (type === "sequence") {
        setCurrentProject((prev) => ({
          ...prev,
          sequence_diagram_svg: response,
        }));
      } else {
        setCurrentProject((prev) => ({
          ...prev,
          class_diagram_svg: response,
        }));
      }

      showToast(
        `${type.charAt(0).toUpperCase() + type.slice(1)} diagram ${
          isUpdating ? "updated" : "generated"
        } successfully`
      );
    } catch (error) {
      console.error(
        `Error ${isUpdating ? "updating" : "generating"} ${type} diagram:`,
        error
      );
      showToast(
        `Failed to ${isUpdating ? "update" : "generate"} ${type} diagram`,
        "Please try again",
        "destructive"
      );
    } finally {
      // Clear loading state
      if (type === "sequence") {
        setLoadingSequence(false);
      } else {
        setLoadingClass(false);
      }
      // Clear change request if we were updating
      setChangeRequest("");
      setShowChangeRequestDialog(false);
    }
  };

  // Download diagram function
  const downloadDiagram = (type: DiagramType) => {
    const svgContent =
      type === "sequence"
        ? currentProject.sequence_diagram_svg
        : currentProject.class_diagram_svg;

    if (!svgContent) return;

    // Create a download link
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject.name}-${type}-diagram.svg`;
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Make SVG transparent and white lines (modifies SVG content)
  const makeTransparentSvg = (svgContent: string | null | undefined) => {
    if (!svgContent) return null;

    // Enhanced SVG processing for better dark theme compatibility
    return (
      svgContent
        // Make background transparent
        .replace(/<svg([^>]*)/, '<svg$1 style="background-color: transparent;"')
        .replace(/fill="white"/g, 'fill="transparent"')
        .replace(/fill="#ffffff"/gi, 'fill="transparent"')
        .replace(/background="white"/g, 'background="transparent"')
        .replace(/background="#ffffff"/gi, 'background="transparent"')

        // Convert black elements to white for dark theme
        .replace(/fill="#000000"/g, 'fill="#FFFFFF"')
        .replace(/fill="black"/gi, 'fill="#FFFFFF"')
        .replace(/stroke="#000000"/g, 'stroke="#FFFFFF"')
        .replace(/stroke="black"/gi, 'stroke="#FFFFFF"')

        // Handle CSS styles within SVG
        .replace(/color:\s*black/gi, "color: #FFFFFF")
        .replace(/color:\s*#000000/gi, "color: #FFFFFF")
        .replace(/fill:\s*black/gi, "fill: #FFFFFF")
        .replace(/fill:\s*#000000/gi, "fill: #FFFFFF")
        .replace(/stroke:\s*black/gi, "stroke: #FFFFFF")
        .replace(/stroke:\s*#000000/gi, "stroke: #FFFFFF")

        // Ensure text elements are white
        .replace(/<text(?![^>]*fill=)/g, '<text fill="#FFFFFF" ')
        .replace(/<text([^>]*fill=")black(")/gi, "<text$1#FFFFFF$2")
        .replace(/<text([^>]*fill=")#000000(")/gi, "<text$1#FFFFFF$2")

        // Handle common diagram element colors
        .replace(/fill="rgb\(0,\s*0,\s*0\)"/gi, 'fill="#FFFFFF"')
        .replace(/stroke="rgb\(0,\s*0,\s*0\)"/gi, 'stroke="#FFFFFF"')
    );
  };

  return (
    <ToastProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-6 w-6 text-primary-cta" />
            <h2 className="text-xl font-semibold">Technical Diagrams</h2>
            <Badge className="bg-hover-active text-primary-text ml-1">
              {(hasSequenceDiagram ? 1 : 0) + (hasClassDiagram ? 1 : 0)} / 2
            </Badge>
          </div>
        </div>

        {/* Diagram Type Tabs */}
        <Tabs
          defaultValue="sequence"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as DiagramType)}
          className="w-full"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <TabsList className="bg-secondary-background border border-divider">
              <TabsTrigger
                value="sequence"
                className="data-[state=active]:bg-primary-cta data-[state=active]:text-black"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Sequence Diagram
              </TabsTrigger>
              <TabsTrigger
                value="class"
                className="data-[state=active]:bg-primary-cta data-[state=active]:text-black"
              >
                <Cpu className="h-4 w-4 mr-2" />
                Class Diagram
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {activeTab === "sequence" ? (
                loadingSequence ? (
                  <Button variant="outline" size="sm" disabled>
                    Generating...
                  </Button>
                ) : hasSequenceDiagram ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateDiagram}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" /> Update Diagram
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateDiagram("sequence")}
                    >
                      <Play className="h-4 w-4 mr-1" /> Regenerate
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateDiagram("sequence")}
                  >
                    <Play className="h-4 w-4 mr-1" /> Generate Diagram
                  </Button>
                )
              ) : loadingClass ? (
                <Button variant="outline" size="sm" disabled>
                  Generating...
                </Button>
              ) : hasClassDiagram ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUpdateDiagram}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Update Diagram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateDiagram("class")}
                  >
                    <Play className="h-4 w-4 mr-1" /> Regenerate
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateDiagram("class")}
                >
                  <Play className="h-4 w-4 mr-1" /> Generate Diagram
                </Button>
              )}

              {/* Show download button only if diagram exists */}
              {((activeTab === "sequence" && hasSequenceDiagram) ||
                (activeTab === "class" && hasClassDiagram)) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadDiagram(activeTab)}
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="sequence" className="mt-0">
            <DiagramView
              svg={makeTransparentSvg(currentProject.sequence_diagram_svg)}
              isLoading={loadingSequence || fetchingSequence}
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              diagramType="sequence"
              isGenerating={loadingSequence}
            />
          </TabsContent>

          <TabsContent value="class" className="mt-0">
            <DiagramView
              svg={makeTransparentSvg(currentProject.class_diagram_svg)}
              isLoading={loadingClass || fetchingClass}
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onResetZoom={handleResetZoom}
              diagramType="class"
              isGenerating={loadingClass}
            />
          </TabsContent>
        </Tabs>

        {/* Change Request Dialog */}
        <Dialog
          open={showChangeRequestDialog}
          onOpenChange={setShowChangeRequestDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Update {activeTab} diagram</DialogTitle>
              <DialogDescription>
                Describe the changes you want to make to the diagram. This helps
                the AI understand what to modify.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="change-request" className="mb-2 block">
                Change request
              </Label>
              <Textarea
                id="change-request"
                placeholder="E.g., Add a new UserService component that interacts with the AuthService"
                className="bg-secondary-background border-divider"
                value={changeRequest}
                onChange={(e) => setChangeRequest(e.target.value)}
                rows={5}
              />
            </div>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowChangeRequestDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  generateDiagram(activeTab, changeRequest);
                  setShowChangeRequestDialog(false);
                }}
                disabled={!changeRequest.trim()}
              >
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

interface DiagramViewProps {
  svg: string | null;
  isLoading: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  diagramType: DiagramType;
  isGenerating?: boolean;
}

function DiagramView({
  svg,
  isLoading,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  diagramType,
  isGenerating = false,
}: DiagramViewProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  // Reset position when changing diagrams
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
  }, [svg]);

  // Dragging handlers with smoother performance
  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent text selection
    e.preventDefault();

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    // Change cursor style immediately
    if (viewportRef.current) {
      viewportRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    // Prevent text selection during drag
    e.preventDefault();

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // Reset cursor
    if (viewportRef.current) {
      viewportRef.current.style.cursor = "grab";
    }
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  // Handle mouse leave to prevent stuck dragging state
  useEffect(() => {
    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);

        // Reset cursor
        if (viewportRef.current) {
          viewportRef.current.style.cursor = "grab";
        }
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDragging]);

  // Prevent default behaviors
  useEffect(() => {
    const preventDefaultSelection = (e: Event) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener("selectstart", preventDefaultSelection);

    return () => {
      document.removeEventListener("selectstart", preventDefaultSelection);
    };
  }, [isDragging]);

  if (isLoading) {
    return (
      <div className="bg-secondary-background border border-divider rounded-md p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary-cta mx-auto mb-4 rounded-full"></div>
          <p className="text-secondary-text">
            {isGenerating
              ? `Generating ${diagramType} diagram... This may take a minute.`
              : `Loading ${diagramType} diagram...`}
          </p>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="bg-secondary-background border border-divider rounded-md p-16 flex items-center justify-center">
        <div className="text-center">
          <FileCode className="h-16 w-16 text-secondary-text mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            No {diagramType} diagram available
          </h3>
          <p className="text-secondary-text max-w-md mx-auto mb-6">
            Generate a diagram to visualize your project's{" "}
            {diagramType === "sequence" ? "interactions" : "structure"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center p-2 bg-secondary-background border border-divider rounded-md">
        <div className="flex items-center gap-1 text-secondary-text text-sm">
          <Move className="h-4 w-4 mr-1" />
          <span>Click and drag to move</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetPosition}
            title="Reset position"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomOut}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetZoom}
            title="Reset zoom"
          >
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onZoomIn} title="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* SVG view container with drag support - fixed positioning */}
      <div
        ref={viewportRef}
        className="bg-secondary-background border border-divider rounded-md overflow-hidden relative select-none"
        style={{
          height: "80vh",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={svgContainerRef}
          className="absolute inset-0 transform-gpu select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${
              position.y / zoom
            }px)`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
            userSelect: "none", // Prevent text selection
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            pointerEvents: isDragging ? "none" : "auto", // Disable pointer events while dragging
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
          onDragStart={(e) => e.preventDefault()} // Prevent drag start
        />
      </div>
    </div>
  );
}
