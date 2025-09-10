
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken') || localStorage.getItem('cyberguard_token');
};

// Create common headers
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Refresh JWT using refresh token (cookies)
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // sends refresh token cookie
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }

  localStorage.removeItem('accessToken');
  return null;
};

// Authenticated fetch with automatic token refresh
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let token = getAuthToken();

  let response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    credentials: 'include',
  });

  // If unauthorized, try refresh token flow
  if (response.status === 401 && token) {
    token = await refreshToken();
    if (token) {
      response = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
        credentials: 'include',
      });
    }
  }

  return response;
};

// Quick check if user is logged in
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Role-based access check
export const hasRole = (
  user: any,
  requiredRole: 'user' | 'moderator' | 'admin'
): boolean => {
  if (!user) return false;

  const roleHierarchy = {
    user: 1,
    moderator: 2,
    admin: 3,
  };

  const userRole = user.isAdmin
    ? 'admin'
    : user.isModerator
    ? 'moderator'
    : 'user';

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
