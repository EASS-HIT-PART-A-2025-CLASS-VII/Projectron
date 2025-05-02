// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
  body?: any;
}

export async function apiClient<T>(
  endpoint: string,
  { token, ...customConfig }: FetchOptions = {}
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
