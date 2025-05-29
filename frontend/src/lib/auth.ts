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

export interface EmailVerificationResponse {
  message: string;
  access_token?: string;
  token_type?: string;
  user?: User;
}

// Login function - sends credentials to your backend
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  // This creates form data as your backend expects
  const formData = new URLSearchParams();
  formData.append("username", credentials.username); // Backend uses username field for email
  formData.append("password", credentials.password);

  // Send request to backend with credentials for cookies
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include", // IMPORTANT: Include cookies
      body: formData,
    }
  );

  // If something went wrong
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  // Return the token information (cookie is set automatically)
  return response.json();
}

// Google Login - gets Google auth URL and redirects
export async function loginWithGoogle(): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
    {
      credentials: "include", // Include cookies
    }
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
    `${process.env.NEXT_PUBLIC_API_URL}/auth/github`,
    {
      credentials: "include", // Include cookies
    }
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
      credentials: "include", // Include cookies
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
export async function handleOAuthSuccess(): Promise<User> {
  // Check for token in URL (OAuth flow)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    // This is an OAuth callback - exchange token for cookie
    return await handleOAuthCallback();
  } else {
    // No token in URL - check if we already have a cookie
    const user = await getCurrentUser();
    return user;
  }
}

// Get current user information
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    credentials: "include", // Include cookies automatically
  });

  if (!response.ok) {
    throw new Error("Failed to get user information");
  }

  return response.json();
}

// Logout function - calls backend logout endpoint
export async function logout(): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
    {
      method: "POST",
      credentials: "include", // Include cookies
    }
  );

  if (!response.ok) {
    // Even if logout fails on backend, we still want to clear local state
    console.warn("Backend logout failed, but continuing with local logout");
  }
}

// Updated verify email function with auto-login
export async function verifyEmail(
  token: string
): Promise<EmailVerificationResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`,
    {
      credentials: "include", // Include cookies for auto-login
    }
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
      credentials: "include", // Include cookies
      body: JSON.stringify({ email }),
    }
  );

  return response.json();
}

// Check if user is authenticated by trying to get user info
export async function isAuthenticated(): Promise<boolean> {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
}

export async function handleOAuthCallback(): Promise<User> {
  // Check for error in URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const token = urlParams.get("token");

  if (error) {
    throw new Error("OAuth authentication failed");
  }

  if (!token) {
    throw new Error("No token received from OAuth");
  }

  // Exchange OAuth token for httpOnly cookie
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/oauth/exchange`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookie setting
      body: JSON.stringify({ token }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to exchange OAuth token");
  }

  // Now get user data using the cookie
  const user = await getCurrentUser();

  // Clean up URL (remove token from URL for security)
  window.history.replaceState({}, document.title, window.location.pathname);

  return user;
}
