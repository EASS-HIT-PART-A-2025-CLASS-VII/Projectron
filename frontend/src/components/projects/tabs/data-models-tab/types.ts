import { Project } from "@/types";

// TypeScript interfaces to match the Pydantic models
export interface Property {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Entity {
  name: string;
  description: string;
  properties: Property[];
}

export interface Relationship {
  source_entity: string;
  target_entity: string;
  type: string;
  description: string;
}

export interface DataModels {
  entities: Entity[];
  relationships: Relationship[];
}

export interface DataModelsTabProps {
  project: Project;
}

// Toast state management
export type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};
