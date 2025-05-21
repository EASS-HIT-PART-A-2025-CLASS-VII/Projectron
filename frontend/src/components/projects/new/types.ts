// Project related types
export interface ProjectListItem {
  id: string;
  name: string;
  description: string;
  tech_stack: string[];
  created_at: string;
  updated_at: string;
  thumbnail_url?: string;
  completion_percentage: number;
}

export interface Project extends ProjectListItem {
  high_level_plan: any;
  architecture: any;
  api_endpoints: any;
  data_models: any;
  ui_components: any;
  implementation_plan: any;
  diagrams: any;
  milestones: any[];
}

export interface ProjectsResponse {
  projects: ProjectListItem[];
}

// Plan generation related types
export enum TimeScale {
  SMALL = "small", // < 40 hours
  MEDIUM = "medium", // 40-100 hours
  LARGE = "large", // 100-300 hours
  CUSTOM = "custom", // User-defined
}

export interface PlanGenerationInput {
  name: string;
  description: string;
  tech_stack: string[];
  experience_level: string;
  team_size: number;
  time_scale: TimeScale;
  custom_hours?: number | null;
}

export interface ClarificationResponse {
  questions: string[];
}

export interface PlanGenerationResponse {
  structured_plan: any;
  project_id: string;
}

// Implementation plan types
export interface Milestone {
  name: string;
  description: string;
  due_date_offset: number;
  status: string;
  tasks: Task[];
}

export interface Task {
  name: string;
  description: string;
  status: string;
  estimated_hours: number;
  priority: string;
  subtasks: Subtask[];
}

export interface Subtask {
  name: string;
  description: string;
  status: string;
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

export interface ImplementationPlanTabProps {
  project: Project;
}

export interface DetailedImplementationPlan {
  milestones: Milestone[];
}

// Component related types
export interface Component {
  name: string;
  type: string;
  description: string;
  functionality: string;
  api_endpoints: string[];
  data_displayed: string[];
}
