import { TechnicalArchitecture, SectionStatus } from "./types";
import {
  Layers,
  Component,
  Network,
  GitMerge,
  Cloud,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// Helper to calculate section completion status
export const calculateSectionStatus = (
  architecture: TechnicalArchitecture
): SectionStatus => {
  return {
    overview: !!architecture.architecture_overview,
    components:
      architecture.system_components &&
      architecture.system_components.length > 0,
    communication:
      architecture.communication_patterns &&
      architecture.communication_patterns.length > 0,
    patterns:
      architecture.architecture_patterns &&
      architecture.architecture_patterns.length > 0,
    infrastructure:
      architecture.infrastructure &&
      Object.keys(architecture.infrastructure).length > 0,
  };
};

// Get section icon
export const getSectionIcon = (section: string) => {
  switch (section) {
    case "overview":
      return Layers;
    case "components":
      return Component;
    case "communication":
      return Network;
    case "patterns":
      return GitMerge;
    case "infrastructure":
      return Cloud;
    default:
      return Layers;
  }
};

// Get section label
export const getSectionLabel = (section: string) => {
  switch (section) {
    case "overview":
      return "Overview";
    case "components":
      return "Components";
    case "communication":
      return "Communication";
    case "patterns":
      return "Patterns";
    case "infrastructure":
      return "Infrastructure";
    default:
      return section;
  }
};

// Get status icon
export const getStatusIcon = (isComplete: boolean) => {
  return isComplete ? CheckCircle2 : XCircle;
};
