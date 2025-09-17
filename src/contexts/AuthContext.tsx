
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/authApi';
import { postsApi } from '@/services/postsApi';
import type { PostResponse } from '@/types';


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
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authApi.fetchCurrentUser();
      setUser({
        ...userData,
        isAdmin: userData.isAdmin || false
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('accessToken');
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
      const token = authApi.getAccessToken();
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

const FlaggedPosts: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [flaggedPosts, setFlaggedPosts] = useState<PostResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlaggedPosts = async () => {
      if (!user?.isAdmin) {
        setError('Admin access required');
        return;
      }

      try {
        const posts = await postsApi.getFlaggedPosts(user);
        setFlaggedPosts(posts);
      } catch (err: any) {
        setError(err.message);
      }
    };

    if (!isLoading) {
      fetchFlaggedPosts();
    }
  }, [user, isLoading]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Flagged Posts</h2>
      {flaggedPosts.length === 0 ? (
        <p>No flagged posts.</p>
      ) : (
        flaggedPosts.map(post => (
          <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default FlaggedPosts;
