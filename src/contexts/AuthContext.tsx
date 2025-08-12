
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const token = localStorage.getItem('cyberguard_token');
    if (token) {
      fetchUser(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      console.log('Fetching user with token from context');
      const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data fetched successfully:', userData);
        setUser({
          ...userData,
          isAdmin: userData.isAdmin || false
        });
      } else {
        console.error('Failed to fetch user, status:', response.status);
        localStorage.removeItem('cyberguard_token');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('cyberguard_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Temporary hardcoded admin credentials for development
      if (username === "admin" && password === "admin123") {
        const adminUser = {
          id: "admin-001",
          username: "admin",
          isAdmin: true
        };
        localStorage.setItem('cyberguard_token', 'dev-admin-token');
        setUser(adminUser);
        return true;
      }

      // Try backend authentication
      const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('cyberguard_token', data.accessToken || data.token);
        // Fetch user data after storing token
        await fetchUser(data.accessToken || data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const authData = await response.json();
        localStorage.setItem('cyberguard_token', authData.accessToken || authData.token);
        // Fetch user data after storing token
        await fetchUser(authData.accessToken || authData.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('cyberguard_token');
      if (!token) return false;

      const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('https://cybergaurdapi.onrender.com/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
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
