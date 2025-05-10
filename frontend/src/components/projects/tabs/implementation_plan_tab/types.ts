import { Project } from "@/types";

export interface Subtask {
  name: string;
  status: string;
  description: string;
}

export interface Task {
  name: string;
  description: string;
  status: string;
  priority: string;
  estimated_hours: number;
  dependencies: string[];
  components_affected: string[];
  apis_affected: string[];
  subtasks: Subtask[];
}

export interface Milestone {
  name: string;
  description: string;
  status: string;
  due_date_offset: number;
  tasks: Task[];
}

export interface DetailedImplementationPlan {
  milestones: Milestone[];
}

export interface ImplementationPlanTabProps {
  project: Project;
}

export interface ToastState {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface UpdateStatusPayload {
  type: "milestone" | "task" | "subtask";
  milestoneIndex: number;
  taskIndex?: number;
  subtaskIndex?: number;
  newStatus: string;
}

export interface EditItemPayload {
  type: "milestone" | "task" | "subtask";
  milestoneIndex: number;
  taskIndex?: number;
  subtaskIndex?: number;
  updatedItem: Milestone | Task | Subtask;
}
