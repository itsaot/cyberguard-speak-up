const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'student' | 'admin';
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    isAdmin: boolean;
  };
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    console.log('Attempting registration with:', { username: data.username, email: data.email });
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      let errorMessage = 'Registration failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.msg || errorData.message || 'Registration failed';
      } catch {
        errorMessage = await response.text();
      }
      console.error('Registration error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    console.log('Attempting login with username:', data.username);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.msg || errorData.message || 'Invalid credentials';
      } catch {
        errorMessage = await response.text();
      }
      console.error('Login error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    return response.json();
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    return response.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  getUser: async (token: string): Promise<any> => {
    console.log('Fetching user data with token');
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error('Failed to get user data, status:', response.status);
      throw new Error('Failed to get user data');
    }
    
    return response.json();
  },
};

export type { RegisterData, LoginData, AuthResponse };