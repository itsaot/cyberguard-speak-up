
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
      // Handle dev admin token
      if (token === 'dev-admin-token') {
        const adminUser = {
          id: "admin-001",
          username: "admin",
          isAdmin: true
        };
        setUser(adminUser);
        setIsLoading(false);
        return;
      }

      const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Map backend user data to our User interface
        const userData = {
          id: data.id || data._id,
          username: data.username,
          email: data.email,
          isAdmin: data.isAdmin || data.role === 'admin'
        };
        
        setUser(userData);
      } else {
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
      setIsLoading(true);
      
      // Temporary hardcoded admin credentials for development
      if (username === "admin" && password === "admin123") {
        const adminUser = {
          id: "admin-001",
          username: "admin",
          isAdmin: true
        };
        localStorage.setItem('cyberguard_token', 'dev-admin-token');
        setUser(adminUser);
        setIsLoading(false);
        return true;
      }

      // Try backend authentication
      const response = await fetch('https://cybergaurdapi.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('cyberguard_token', data.token);
        
        // Map backend user data to our User interface
        const userData = {
          id: data.user.id || data.user._id,
          username: data.user.username,
          email: data.user.email,
          isAdmin: data.user.isAdmin || data.user.role === 'admin'
        };
        
        setUser(userData);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
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
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const authData = await response.json();
        localStorage.setItem('cyberguard_token', authData.token);
        setUser(authData.user);
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

  const logout = () => {
    localStorage.removeItem('cyberguard_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
