import { authenticatedFetch } from '@/utils/auth';

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api/auth';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt?: string;
}

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
}

// Utility: throws nice error if request fails
async function parseOrThrow(res: Response, fallback = 'Request failed') {
  if (res.ok) return res.json();
  const err = await res.json().catch(() => ({ message: fallback }));
  throw new Error(err.message || fallback);
}

// ✅ Get all users (admin-only)
export const getUsers = async (): Promise<User[]> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/users`, {
    method: 'GET',
  });
  return parseOrThrow(res, 'Failed to fetch users');
};

// ✅ Create new admin
export const createAdmin = async (data: CreateAdminData): Promise<User> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res, 'Failed to create admin');
};

// ✅ Promote user to admin
export const promoteToAdmin = async (userId: string): Promise<User> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/promote/${userId}`, {
    method: 'PATCH',
  });
  return parseOrThrow(res, 'Failed to promote user');
};

// ✅ Delete user by ID (admin-only)
export const deleteUserById = async (userId: string): Promise<{ message?: string }> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'DELETE',
  });
  return parseOrThrow(res, 'Failed to delete user');
};

export const userApi = {
  getUsers,
  createAdmin,
  promoteToAdmin,
  deleteUserById,
};
