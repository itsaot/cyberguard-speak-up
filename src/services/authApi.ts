const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
}

// Helper functions for token management
const saveAccessToken = (token: string) => localStorage.setItem("accessToken", token);
const getAccessToken = () => localStorage.getItem("accessToken");

export const authApi = {
  register: async (data: RegisterData): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.msg || 'Registration failed');
    }
    
    const result = await response.json();
    saveAccessToken(result.accessToken);
    return result.accessToken;
  },

  login: async (data: LoginData): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.msg || 'Login failed');
    }
    
    const result = await response.json();
    saveAccessToken(result.accessToken);
    return result.accessToken;
  },

  refreshAccessToken: async (): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Could not refresh token');
    }
    
    const data = await response.json();
    saveAccessToken(data.accessToken);
    return data.accessToken;
  },

  fetchCurrentUser: async (): Promise<any> => {
    let token = getAccessToken();
    if (!token) throw new Error('No access token');

    let response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });

    // If token expired, try refreshing
    if (response.status === 401) {
      try {
        token = await authApi.refreshAccessToken();
        response = await fetch(`${API_BASE_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
      } catch {
        throw new Error('Authentication failed');
      }
    }

    if (!response.ok) throw new Error('Failed to fetch user');
    return await response.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    localStorage.removeItem('accessToken');
  },

  getAccessToken,
};

// Generic fetch wrapper that automatically adds Authorization header
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = getAccessToken();
  if (!token) throw new Error("No access token");

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    credentials: "include",
  });

 
  if (response.status === 401) {
    try {
      token = await authApi.refreshAccessToken();
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
        credentials: "include",
      });
    } catch {
      throw new Error("Authentication failed");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.msg || "Request failed");
  }

  return response.json();
};

export { fetchWithAuth };

export type { RegisterData, LoginData, AuthResponse };
