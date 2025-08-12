export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
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

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    credentials: 'include',
  });
  
  // If we get a 401, try to refresh the token
  if (response.status === 401 && token) {
    const newToken = await refreshToken();
    if (newToken) {
      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        },
        credentials: 'include',
      });
    }
  }
  
  return response;
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const hasRole = (user: any, requiredRole: 'user' | 'moderator' | 'admin'): boolean => {
  if (!user) return false;
  
  const roleHierarchy = {
    'user': 1,
    'moderator': 2,
    'admin': 3,
  };
  
  const userRole = user.isAdmin ? 'admin' : (user.isModerator ? 'moderator' : 'user');
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};