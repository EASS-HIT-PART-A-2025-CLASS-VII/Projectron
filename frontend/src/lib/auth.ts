export interface LoginCredentials {
  username: string; // This will be the email
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string; // Added full_name to match your backend
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  last_login?: string; // ? means optional
  created_at: string;
}

// Login function - sends credentials to your backend
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  // This creates form data as your backend expects
  const formData = new URLSearchParams();
  formData.append("username", credentials.username); // Backend uses username field for email
  formData.append("password", credentials.password);

  console.log(credentials.username);
  console.log(credentials.password);
  // Send request to backend
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    }
  );

  // If something went wrong
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  // Return the token information
  return response.json();
}

// Register function - creates a new user
export async function register(
  credentials: RegisterCredentials
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Registration failed");
  }
}

// Get current user information
export async function getCurrentUser(): Promise<User> {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // If token is invalid, clear it
    if (response.status === 401) {
      removeToken();
    }
    throw new Error("Failed to get user information");
  }

  return response.json();
}

// Verify email with token
export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Email verification failed");
  }

  return response.json();
}

// Resend verification email
export async function resendVerification(
  email: string
): Promise<{ message: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/resend-verification`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  return response.json();
}

// Helper functions for token management
export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  // Check if we're running in a browser (not during server-side rendering)
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("token");
    console.log(token);
    return token;
  }
  return null;
}

export function removeToken(): void {
  localStorage.removeItem("token");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
