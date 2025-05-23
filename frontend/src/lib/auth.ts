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

export interface GoogleAuthResponse {
  auth_url: string;
}

export interface GitHubAuthResponse {
  auth_url: string;
}

// Login function - sends credentials to your backend
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  // This creates form data as your backend expects
  const formData = new URLSearchParams();
  formData.append("username", credentials.username); // Backend uses username field for email
  formData.append("password", credentials.password);
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

// Google Login - gets Google auth URL and redirects
export async function loginWithGoogle(): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get Google auth URL");
  }

  const data: GoogleAuthResponse = await response.json();

  // Redirect to Google OAuth
  window.location.href = data.auth_url;
}

// GitHub Login - gets GitHub auth URL and redirects
export async function loginWithGithub(): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/github`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to get GitHub auth URL");
  }

  const data: GitHubAuthResponse = await response.json();

  // Redirect to GitHub OAuth
  window.location.href = data.auth_url;
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

// Google Register - same as Google login for OAuth
export async function registerWithGoogle(): Promise<void> {
  // OAuth registration is the same flow as login
  await loginWithGoogle();
}

// GitHub Register - same as GitHub login for OAuth
export async function registerWithGithub(): Promise<void> {
  // OAuth registration is the same flow as login
  await loginWithGithub();
}

// Handle OAuth success callback (called from your success page)
export async function handleOAuthSuccess(token: string): Promise<User> {
  // Save the token
  saveToken(token);

  // Get user data
  const user = await getCurrentUser();
  return user;
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
    `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`,
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

export async function handleOAuthCallback(): Promise<User> {
  // Get token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const error = urlParams.get("error");

  if (error) {
    throw new Error("OAuth authentication failed");
  }

  if (!token) {
    throw new Error("No token received from OAuth");
  }

  // Save the token
  saveToken(token);

  // Get user data
  const user = await getCurrentUser();

  // Clean up URL (remove token from URL for security)
  window.history.replaceState({}, document.title, window.location.pathname);

  return user;
}
