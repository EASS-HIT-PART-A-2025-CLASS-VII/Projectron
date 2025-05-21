import { Project } from "@/types";

// Component property interfaces
export interface SystemComponent {
  name: string;
  type: string;
  description: string;
  technologies: string[];
  responsibilities: string[];
}

export interface CommunicationPattern {
  source: string;
  target: string;
  protocol: string;
  pattern: string;
  description: string;
}

export interface ArchitecturePattern {
  name: string;
  description: string;
}

export interface Infrastructure {
  hosting?: string;
  services?: string[];
  ci_cd?: string;
}

export interface TechnicalArchitecture {
  architecture_overview?: string;
  architecture_diagram_description?: string;
  system_components?: SystemComponent[];
  communication_patterns?: CommunicationPattern[];
  architecture_patterns?: ArchitecturePattern[];
  infrastructure?: Infrastructure;
}

export interface ArchitectureTabProps {
  project: Project;
}

// Toast state management
export type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Section status for navigation
export interface SectionStatus {
  overview: boolean | undefined;
  components: boolean | undefined;
  communication: boolean | undefined;
  patterns: boolean | undefined;
  infrastructure: boolean | undefined;
}

// Editor state
export interface EditorState {
  isEditing: boolean;
  isSaving: boolean;
  unsavedChanges: boolean;
}
