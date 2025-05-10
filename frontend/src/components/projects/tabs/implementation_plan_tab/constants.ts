import { Check, Clock, AlertTriangle, Ban, CircleDot } from "lucide-react";

export const STATUS_COLORS = {
  completed: "bg-green-500/10 text-green-500 border-green-500/30",
  in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  not_started: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  blocked: "bg-red-500/10 text-red-500 border-red-500/30",
  review: "bg-purple-500/10 text-purple-500 border-purple-500/30",
};

export const STATUS_DISPLAY = {
  completed: "Completed",
  in_progress: "In Progress",
  not_started: "Not Started",
  blocked: "Blocked",
  review: "Under Review",
};

export const STATUS_ICONS = {
  completed: Check,
  in_progress: Clock,
  not_started: CircleDot,
  blocked: Ban,
  review: AlertTriangle,
};

export const PRIORITY_COLORS = {
  high: "bg-red-500/10 text-red-500 border-red-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  low: "bg-green-500/10 text-green-500 border-green-500/30",
};

export const PRIORITY_DISPLAY = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const EDITABLE_FIELDS = {
  milestone: ["name", "description", "status", "due_date_offset"],
  task: [
    "name",
    "description",
    "status",
    "priority",
    "estimated_hours",
    "dependencies",
    "components_affected",
    "apis_affected",
  ],
  subtask: ["name", "description", "status"],
};
