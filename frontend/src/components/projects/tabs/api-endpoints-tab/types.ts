// TypeScript interfaces for API Endpoints Tab

import { Project } from "@/types";

// Query parameter definition
export interface QueryParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

// Request body definition
export interface RequestBody {
  type: string;
  schema_data: Record<string, any>;
}

// Request definition
export interface Request {
  query_params: QueryParam[];
  body: RequestBody | null;
}

// Response error definition
export interface ResponseError {
  status: number;
  description: string;
}

// Success response definition
export interface ResponseSuccess {
  status: number;
  content_type: string;
  schema_data: Record<string, any>;
}

// Response definition
export interface Response {
  success: ResponseSuccess;
  errors: ResponseError[];
}

// API Endpoint definition
export interface Endpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  authentication_required: boolean;
  request: Request;
  response: Response;
}

// Resource definition
export interface Resource {
  name: string;
  description: string;
  endpoints: Endpoint[];
}

// Authentication definition
export interface Authentication {
  type: string;
  description: string;
}

// Complete API Endpoints definition
export interface APIEndpoints {
  api_design_principles: string[];
  base_url: string;
  authentication: Authentication;
  resources: Resource[];
}

// API Endpoints Tab props
export interface ApiEndpointsTabProps {
  project: Project;
}

// Toast state type
export type ToastState = {
  open: boolean;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};
