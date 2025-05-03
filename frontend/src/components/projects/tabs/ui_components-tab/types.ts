import { Project } from "@/types";

export interface Component {
  name: string;
  type: string;
  description: string;
  functionality: string;
  api_endpoints: string[];
  data_displayed: string[];
}

export interface Screen {
  name: string;
  description: string;
  route: string;
  user_types: string[];
  components: Component[];
}

export interface UIComponents {
  screens: Screen[];
}

export interface UIComponentsTabProps {
  project: Project;
}

export interface ToastState {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}
