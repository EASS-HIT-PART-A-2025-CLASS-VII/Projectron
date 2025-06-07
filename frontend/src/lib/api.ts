const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
console.log("API Base URL:", API_BASE_URL);

interface FetchOptions extends RequestInit {
  token?: string; // Deprecated - kept for backwards compatibility
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

  // Legacy token support for backwards compatibility
  // New cookie-based auth doesn't need manual headers
  if (token) {
    console.warn(
      "Manual token passing is deprecated - using cookie-based auth"
    );
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: customConfig.method || "GET",
    credentials: "include", // IMPORTANT: Always include cookies
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
      // Handle unauthorized - redirect to login
      // Cookie will be cleared by browser automatically if expired
      window.location.href = "/auth/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      // Always try to get the response body first
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("API Error Response Text:", responseText);
      } catch (textError) {
        console.error("Could not read response text:", textError);
        throw new Error(`API request failed with status ${response.status}`);
      }

      // Try to parse as JSON to extract error details
      try {
        const errorData = JSON.parse(responseText);
        console.log("API Error Response JSON:", errorData);

        const errorMessage =
          errorData.detail || // FastAPI HTTPException format
          errorData.message || // Alternative format
          errorData.error || // Alternative format
          (typeof errorData === "string" ? errorData : null) ||
          responseText ||
          `API request failed with status ${response.status}`;

        throw new Error(errorMessage);
      } catch (jsonError) {
        // If it's not valid JSON, use the raw text as error message
        console.log("Response is not JSON, using raw text");
        const errorMessage =
          responseText || `API request failed with status ${response.status}`;
        throw new Error(errorMessage);
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
