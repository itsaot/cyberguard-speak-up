
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/authApi';

interface User {
  id: string;
  username: string;
  email?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem('accessToken') || localStorage.getItem('cyberguard_token');
    if (token) {
      // If using the legacy cyberguard_token for admin, handle it
      if (token === 'dev-admin-token') {
        setUser({
          id: "admin-001",
          username: "admin",
          isAdmin: true,
        });
        setIsLoading(false);
      } else {
        fetchUser();
      }
    } else {
      setIsLoading(false);
    }
    const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  let token = localStorage.getItem('accessToken');
  if (!token) throw new Error('No access token');

  // Add Authorization header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  options.credentials = 'include';

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Access token expired → try refresh
    try {
      const refreshRes = await fetch('https://cybergaurdapi.onrender.com/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!refreshRes.ok) throw new Error('Failed to refresh token');

      const data = await refreshRes.json();
      localStorage.setItem('accessToken', data.accessToken);
      token = data.accessToken;

      // Retry original request
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
      response = await fetch(url, options);
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      throw err;
    }
  }

  return response;
};

  }, []);

 const fetchUser = async () => {
  try {
    const userData = await authApi.fetchCurrentUser();
    console.log("Fetched user:", userData); // <-- check role here
    setUser({
      ...userData,
      isAdmin: userData.role === "admin",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    localStorage.removeItem("accessToken");
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};


const login = async (username: string, password: string): Promise<boolean> => {
  // First, check for the hardcoded admin
  if (username === "admin" && password === "admin123") {
    const adminUser = {
      id: "admin-001",
      username: "admin",
      isAdmin: true,
    };
    localStorage.setItem('cyberguard_token', 'dev-admin-token');
    setUser(adminUser);
    return true;
  }

  // Otherwise, try the regular API login
  try {
    await authApi.login({ username, password });
    await fetchUser();
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};


  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      await authApi.register(data);
      await fetchUser();
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

const updateProfile = async (data: Partial<User>): Promise<boolean> => {
  try {
    const response = await fetchWithAuth('https://cybergaurdapi.onrender.com/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) return false;

    const updatedUser = await response.json();
    setUser(updatedUser);
    return true;
  } catch (error) {
    console.error('Profile update error:', error);
    return false;
  }
};


  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('cyberguard_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
