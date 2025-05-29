// src/components/projects/tabs/diagrams-tab/diagram-view.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileCode,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type DiagramType = "sequence" | "class" | "activity";

interface Position {
  x: number;
  y: number;
}

interface DiagramViewProps {
  svg: string | null;
  isLoading: boolean;
  error?: string | null;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  diagramType: DiagramType;
}

export function DiagramView({
  svg,
  isLoading,
  error,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  diagramType,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-secondary-background border border-divider rounded-md p-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary-cta mx-auto mb-4 rounded-full"></div>
          <p className="text-secondary-text">
            Loading {diagramType} diagram...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-secondary-background border border-divider rounded-md p-16 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Error loading {diagramType} diagram
          </h3>
          <p className="text-secondary-text max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
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
            {diagramType === "sequence"
              ? "interactions"
              : diagramType === "class"
              ? "structure"
              : "workflow"}
            .
          </p>
        </div>
      </div>
    );
  }

  // Render diagram with controls
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

      {/* SVG view container with drag support */}
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
