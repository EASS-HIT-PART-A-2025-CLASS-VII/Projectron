import {
  AlertTriangle,
  Lightbulb,
  BarChart,
  UserCircle2,
  Zap,
  Target,
  CheckCircle2,
  CheckCircle,
  XCircle,
  Rocket,
} from "lucide-react";
import { HighLevelPlan } from "./types";

// Calculate if sections are complete
export const calculateSectionStatus = (plan: HighLevelPlan) => {
  return {
    overview: true, // Overview is just links to other sections
    vision:
      !!plan.vision &&
      plan.vision.length > 0 &&
      plan.business_objectives &&
      plan.business_objectives.length > 0,
    users: plan.target_users && plan.target_users.length > 0,
    features: plan.core_features && plan.core_features.length > 0,
    scope:
      plan.scope &&
      (plan.scope.in_scope.length > 0 || plan.scope.out_of_scope.length > 0),
    success: plan.success_criteria && plan.success_criteria.length > 0,
    risks: plan.risks && plan.risks.length > 0,
  };
};

// Get icon for each section
export const getSectionIcon = (section: string) => {
  switch (section) {
    case "overview":
      return Rocket;
    case "vision":
      return Lightbulb;
    case "users":
      return UserCircle2;
    case "features":
      return Zap;
    case "scope":
      return Target;
    case "success":
      return CheckCircle2;
    case "risks":
      return AlertTriangle;
    default:
      return Rocket;
  }
};

// Get label for each section
export const getSectionLabel = (section: string) => {
  switch (section) {
    case "overview":
      return "Overview";
    case "vision":
      return "Vision";
    case "users":
      return "Users";
    case "features":
      return "Features";
    case "scope":
      return "Scope";
    case "success":
      return "Success";
    case "risks":
      return "Risks";
    default:
      return section;
  }
};

// Get status icon based on completion
export const getStatusIcon = (isComplete: boolean) => {
  return isComplete ? CheckCircle2 : XCircle;
};

// Format array as bullet points
export const formatArrayAsPoints = (items: string[] | undefined) => {
  if (!items || items.length === 0) return "None defined";

  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
};
