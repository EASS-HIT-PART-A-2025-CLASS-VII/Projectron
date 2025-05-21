import { TechnicalArchitecture, SectionStatus } from "./types";
import {
  Layers,
  Component,
  Network,
  GitMerge,
  Cloud,
  CheckCircle2,
  XCircle,
  SquareChartGantt,
  Puzzle,
  Grid2x2,
  LayoutPanelTop,
  AudioWaveform,
} from "lucide-react";

// Helper to calculate section completion status

export const sections = {
  overview: "overview",
  components: "components",
  communication: "communication",
  patterns: "patterns",
  infrastructure: "infrastructure",
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
