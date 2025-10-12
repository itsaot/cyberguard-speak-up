import { authenticatedFetch } from '@/utils/auth';

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api/auth';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin" | "moderator";
  createdAt: string;
}

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/users`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
    throw new Error(error.message || 'Failed to fetch users');
  }

  return response.json();
};

// Get a specific user by ID
export const getUserById = async (userId: string): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
    throw new Error(error.message || 'Failed to fetch user');
  }

  return response.json();
};

// Create a new admin
export const createAdmin = async (data: CreateAdminData): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/admin`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create admin' }));
    throw new Error(error.message || 'Failed to create admin');
  }

  return response.json();
};

// Promote user to admin
export const promoteToAdmin = async (userId: string): Promise<User> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/promote/${userId}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to promote user' }));
    throw new Error(error.message || 'Failed to promote user');
  }

  return response.json();
};

// Delete user
export const deleteUserByAdmin = async (userId: string): Promise<void> => {
  const response = await authenticatedFetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete user' }));
    throw new Error(error.message || 'Failed to delete user');
  }
};

export const userApi = {
  getUsers,
  getUserById,
  createAdmin,
  promoteToAdmin,
  deleteUserByAdmin,
};
