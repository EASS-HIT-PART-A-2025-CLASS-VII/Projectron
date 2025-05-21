// types.ts
export type DiagramType = "class" | "sequence";

export interface DiagramsTabProps {
  project: {
    id: string;
    name: string;
    class_diagram_svg?: string | null;
    sequence_diagram_svg?: string | null;
    [key: string]: any;
  };
}

export interface ToastState {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface DiagramViewProps {
  svg: string | null;
  isLoading: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  diagramType: DiagramType;
}
