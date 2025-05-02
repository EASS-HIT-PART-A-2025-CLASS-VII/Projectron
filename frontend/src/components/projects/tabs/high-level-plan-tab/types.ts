import { Project } from "@/types";

export interface HighLevelPlanTabProps {
  project: Project;
}

export interface TargetUser {
  type: string;
  needs: string[];
  pain_points: string[];
}

export interface ProjectScope {
  in_scope: string[];
  out_of_scope: string[];
}

export interface ProjectRisk {
  description: string;
  impact: string;
  mitigation: string;
}

export interface HighLevelPlan {
  vision: string;
  business_objectives: string[];
  target_users: TargetUser[];
  core_features: string[];
  scope: ProjectScope;
  success_criteria: string[];
  constraints: string[];
  assumptions: string[];
  tech_stack: string[];
  risks: ProjectRisk[];
}

export interface ToastState {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export interface SectionProps {
  plan: HighLevelPlan;
  isEditing: boolean;
}

export interface VisionSectionProps extends SectionProps {
  updateVision: (value: string) => void;
  updateBusinessObjective: (index: number, value: string) => void;
  addBusinessObjective: (value: string) => void;
  deleteBusinessObjective: (index: number) => void;
}

export interface UsersSectionProps extends SectionProps {
  updateUser: (index: number, field: string, value: any) => void;
  addUser: (userData: any) => void;
  deleteUser: (index: number) => void;
  addUserNeed: (userIndex: number, need: string) => void;
  deleteUserNeed: (userIndex: number, needIndex: number) => void;
  addUserPainPoint: (userIndex: number, painPoint: string) => void;
  deleteUserPainPoint: (userIndex: number, pointIndex: number) => void;
}

export interface FeaturesSectionProps extends SectionProps {
  updateFeature: (index: number, value: string) => void;
  addFeature: (value: string) => void;
  deleteFeature: (index: number) => void;
}

export interface ScopeSectionProps extends SectionProps {
  updateInScopeItem: (index: number, value: string) => void;
  addInScopeItem: (item: string) => void;
  deleteInScopeItem: (index: number) => void;
  updateOutOfScopeItem: (index: number, value: string) => void;
  addOutOfScopeItem: (item: string) => void;
  deleteOutOfScopeItem: (index: number) => void;
}

export interface SuccessSectionProps extends SectionProps {
  updateSuccessCriteria: (index: number, value: string) => void;
  addSuccessCriteria: (value: string) => void;
  deleteSuccessCriteria: (index: number) => void;
  updateConstraint: (index: number, value: string) => void;
  addConstraint: (value: string) => void;
  deleteConstraint: (index: number) => void;
  updateAssumption: (index: number, value: string) => void;
  addAssumption: (value: string) => void;
  deleteAssumption: (index: number) => void;
  updateTechStack: (index: number, value: string) => void;
  addTechStack: (value: string) => void;
  deleteTechStack: (index: number) => void;
}

export interface RisksSectionProps extends SectionProps {
  updateRisk: (index: number, field: string, value: any) => void;
  addRisk: (riskData: any) => void;
  deleteRisk: (index: number) => void;
}

export interface OverviewSectionProps extends SectionProps {
  setSelectedSection: (section: string) => void;
}
