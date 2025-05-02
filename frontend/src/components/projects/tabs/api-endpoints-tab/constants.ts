// Constants for API Endpoints Tab

// Method badge colors - using Swagger-like colors
export const methodColors = {
  GET: "bg-blue-500 text-white",
  POST: "bg-green-500 text-white",
  PUT: "bg-amber-500 text-white",
  PATCH: "bg-violet-500 text-white",
  DELETE: "bg-red-500 text-white",
  OPTIONS: "bg-gray-500 text-white",
  HEAD: "bg-cyan-500 text-white",
};

// Available HTTP methods for dropdown
export const availableMethods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
  "HEAD",
];

// Status badge colors - using Swagger-like colors
export const statusColors = {
  2: "bg-green-500 text-white", // 2xx
  3: "bg-blue-500 text-white", // 3xx
  4: "bg-amber-500 text-white", // 4xx
  5: "bg-red-500 text-white", // 5xx
};

// Available parameter types for editing
export const paramTypes = [
  "string",
  "number",
  "integer",
  "boolean",
  "array",
  "object",
];

// Common HTTP status codes for errors
export const errorCodes = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503];

// Common HTTP status codes for success
export const successCodes = [200, 201, 202, 204];

// Common content types
export const contentTypes = [
  "application/json",
  "text/plain",
  "application/xml",
];

// Default empty endpoint template
export const defaultEndpoint = {
  name: "",
  method: "GET",
  path: "",
  description: "",
  authentication_required: false,
  request: {
    query_params: [],
    body: null,
  },
  response: {
    success: {
      status: 200,
      content_type: "application/json",
      schema_data: {},
    },
    errors: [
      { status: 400, description: "Bad Request" },
      { status: 401, description: "Unauthorized" },
    ],
  },
};
