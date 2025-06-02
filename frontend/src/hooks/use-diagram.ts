import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { analytics } from "@/lib/google-analytics";

export type DiagramType = "sequence" | "class" | "activity";

export interface DiagramState {
  svg: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface DiagramActions {
  fetch: () => Promise<void>;
  generate: (changeRequest?: string) => Promise<void>;
  update: (changeRequest: string) => Promise<void>;
  clear: () => void;
}

export interface UseDiagramsReturn {
  diagrams: Record<DiagramType, DiagramState>;
  actions: Record<DiagramType, DiagramActions>;
  downloadDiagram: (type: DiagramType, projectName: string) => void;
}

export function useDiagrams(projectId: string): UseDiagramsReturn {
  const [diagrams, setDiagrams] = useState<Record<DiagramType, DiagramState>>({
    sequence: { svg: null, isLoading: false, error: null },
    class: { svg: null, isLoading: false, error: null },
    activity: { svg: null, isLoading: false, error: null },
  });

  const updateDiagramState = useCallback(
    (type: DiagramType, updates: Partial<DiagramState>) => {
      setDiagrams((prev) => ({
        ...prev,
        [type]: { ...prev[type], ...updates },
      }));
    },
    []
  );

  // Fetch existing diagram
  const fetchDiagram = useCallback(
    async (type: DiagramType) => {
      updateDiagramState(type, { isLoading: true, error: null });

      try {
        const svgContent = await apiClient<string>(
          `/diagrams/${type}/${projectId}`,
          {
            method: "GET",
            responseType: "text",
          }
        );

        updateDiagramState(type, {
          svg: svgContent,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        // Handle 404 as "no diagram exists" rather than an error
        if (errorMessage.includes("404")) {
          updateDiagramState(type, {
            svg: null,
            isLoading: false,
            error: null,
          });
        } else {
          updateDiagramState(type, {
            isLoading: false,
            error: errorMessage,
          });
        }
      }
    },
    [projectId, updateDiagramState]
  );

  // Generate new diagram
  const generateDiagram = useCallback(
    async (type: DiagramType, changeRequest?: string) => {
      updateDiagramState(type, { isLoading: true, error: null });

      try {
        const svgContent = await apiClient<string>(`/diagrams/${type}/create`, {
          method: "POST",
          body: {
            project_id: projectId,
            change_request: changeRequest,
          },
          responseType: "text",
        });

        updateDiagramState(type, {
          svg: svgContent,
          isLoading: false,
          error: null,
        });
        analytics.trackDiagramGenerated(type);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        updateDiagramState(type, {
          isLoading: false,
          error: errorMessage,
        });
        throw error; // Re-throw for handling in UI
      }
    },
    [projectId, updateDiagramState]
  );

  // Update existing diagram
  const updateDiagram = useCallback(
    async (type: DiagramType, changeRequest: string) => {
      updateDiagramState(type, { isLoading: true, error: null });

      try {
        const svgContent = await apiClient<string>(`/diagrams/${type}/update`, {
          method: "PUT",
          body: {
            project_id: projectId,
            change_request: changeRequest,
          },
          responseType: "text",
        });

        updateDiagramState(type, {
          svg: svgContent,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        updateDiagramState(type, {
          isLoading: false,
          error: errorMessage,
        });
        throw error; // Re-throw for handling in UI
      }
    },
    [projectId, updateDiagramState]
  );

  // Clear diagram state
  const clearDiagram = useCallback(
    (type: DiagramType) => {
      updateDiagramState(type, {
        svg: null,
        isLoading: false,
        error: null,
      });
    },
    [updateDiagramState]
  );

  // Download diagram
  const downloadDiagram = useCallback(
    (type: DiagramType, projectName: string) => {
      const svgContent = diagrams[type].svg;
      if (!svgContent) return;

      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectName}-${type}-diagram.svg`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    [diagrams]
  );

  // Create actions object for each diagram type
  const actions: Record<DiagramType, DiagramActions> = {
    sequence: {
      fetch: () => fetchDiagram("sequence"),
      generate: (changeRequest) => generateDiagram("sequence", changeRequest),
      update: (changeRequest) => updateDiagram("sequence", changeRequest),
      clear: () => clearDiagram("sequence"),
    },
    class: {
      fetch: () => fetchDiagram("class"),
      generate: (changeRequest) => generateDiagram("class", changeRequest),
      update: (changeRequest) => updateDiagram("class", changeRequest),
      clear: () => clearDiagram("class"),
    },
    activity: {
      fetch: () => fetchDiagram("activity"),
      generate: (changeRequest) => generateDiagram("activity", changeRequest),
      update: (changeRequest) => updateDiagram("activity", changeRequest),
      clear: () => clearDiagram("activity"),
    },
  };

  return {
    diagrams,
    actions,
    downloadDiagram,
  };
}

// Utility function to make SVG compatible with dark theme
export function makeTransparentSvg(
  svgContent: string | null | undefined
): string | null {
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
}
