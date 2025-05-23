// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
  body?: any;
  responseType?: "json" | "text" | "blob"; // Add responseType option
}

export async function apiClient<T>(
  endpoint: string,
  { token, responseType = "json", ...customConfig }: FetchOptions = {}
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: customConfig.method || "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  console.log(customConfig.body, "customConfig.body");
  if (customConfig.body) {
    config.body = JSON.stringify(customConfig.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      // For error responses, try to parse as JSON if possible
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || "API request failed");
      } catch (jsonError) {
        // If JSON parsing fails, just throw with status
        throw new Error(`API request failed with status ${response.status}`);
      }
    }

    // Handle different response types
    let data;
    switch (responseType) {
      case "text":
        data = await response.text();
        break;
      case "blob":
        data = await response.blob();
        break;
      case "json":
      default:
        data = await response.json();
        break;
    }

    return data as T;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
