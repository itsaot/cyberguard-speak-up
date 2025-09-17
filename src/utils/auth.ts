const API_BASE_URL = "https://cybergaurdapi.onrender.com/api";

// ----------------------
// 🔑 Token Helpers
// ----------------------
export const getAuthToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const setAuthToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
};

// ----------------------
// 🔑 Common Headers
// ----------------------
export const getAuthHeaders = (token?: string) => {
  const activeToken = token || getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(activeToken && { Authorization: `Bearer ${activeToken}` }),
  };
};

// ----------------------
// 🔑 Refresh Token Flow
// ----------------------
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // send cookie
    });

    if (response.ok) {
      const data = await response.json();
      setAuthToken(data.accessToken);
      return data.accessToken;
    } else {
      console.error("Refresh token failed with status:", response.status);
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }

  clearAuthTokens();
  return null;
};

// ----------------------
// 🔑 Authenticated Fetch
// ----------------------
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = getAuthToken();

  // First attempt
  let response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  // If unauthorized, try refresh
  if (response.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(newToken),
          ...(options.headers || {}),
        },
        credentials: "include",
      });
    }
  }

  return response;
};

// ----------------------
// 🔑 Auth Helpers
// ----------------------
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const hasRole = (
  user: any,
  requiredRole: "user" | "moderator" | "admin"
): boolean => {
  if (!user) return false;

  const roleHierarchy = {
    user: 1,
    moderator: 2,
    admin: 3,
  };

  const userRole = user.isAdmin
    ? "admin"
    : user.isModerator
    ? "moderator"
    : "user";

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
