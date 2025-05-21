// src/types/index.ts

// User interfaces
export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  last_login?: string;
  created_at: string;
}

// For project listing page (simpler structure)
export interface ProjectListItem {
  milestone_count: number;
  task_count: number;
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  owner_id: string | null;
  collaborator_ids: string[];
  completion_percentage: number;
}

// For detailed project view (complex structure with nested data)
export interface Project extends ProjectListItem {
  tech_stack: string[];
  experience_level: string;
  team_size: number;

  // Plan components
  high_level_plan: Record<string, any>;
  technical_architecture: Record<string, any>;
  api_endpoints: Record<string, any>;
  data_models: Record<string, any>;
  ui_components: Record<string, any>;
  implementation_plan: Record<string, any>;
  // Statistics
  task_count: number;
  completed_task_count: number;
  milestone_count: number;
  completion_percentage: number;

  // Nested data
  milestones: Milestone[];
}

// Milestone with nested tasks
export interface Milestone {
  id: string;
  name: string;
  description: string;
  status: string;
  due_date: string;
  order: number;
  project_id: string;
  tasks: Task[];
}

// Task with nested subtasks
export interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  estimated_hours: number;
  components_affected: string[];
  apis_affected: string[];
  due_date: string;
  order: number;
  project_id: string;
  milestone_id: string;
  dependency_ids: string[];
  subtasks: Subtask[];
}

// Subtask definition
export interface Subtask {
  id: string;
  name: string;
  description: string;
  status: string;
  order: number;
  task_id: string;
}

// Status type definitions for better type safety
export type ProjectStatus = "draft" | "in_progress" | "completed" | "cancelled";
export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";

// API response types
export interface ProjectsResponse {
  projects: ProjectListItem[];
  total: number;
}

export interface ProjectResponse {
  project: Project;
}
