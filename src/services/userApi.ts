// src/services/userApi.ts
import { authenticatedFetch } from '@/utils/auth';

const API_BASE_URL = 'https://cybergaurdapi.onrender.com/api/auth'; // <--- matches backend mount

export interface User {
  _id: string;
  username: string;
  email?: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt?: string;
}

export interface CreateAdminData {
  username: string;
  email: string;
  password: string;
}

// helper to parse JSON or return fallback error
async function parseOrThrow(res: Response, fallback = 'Request failed') {
  if (res.ok) return res.json();
  const err = await res.json().catch(() => ({ message: fallback }));
  throw new Error(err.message || fallback);
}

// GET /users
export const getUsers = async (): Promise<User[]> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/users`, { method: 'GET' });
  return parseOrThrow(res, 'Failed to fetch users');
};

// GET /user/:id
export const getUserById = async (userId: string): Promise<User> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/user/${userId}`, { method: 'GET' });
  return parseOrThrow(res, 'Failed to fetch user');
};

// POST /admin
export const createAdmin = async (data: CreateAdminData): Promise<User> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res, 'Failed to create admin');
};

// PATCH /promote/:userId
export const promoteToAdmin = async (userId: string): Promise<{ message?: string }> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/promote/${userId}`, {
    method: 'PATCH',
  });
  return parseOrThrow(res, 'Failed to promote user');
};

// DELETE /user/:id
export const deleteUser = async (userId: string): Promise<{ message?: string }> => {
  const res = await authenticatedFetch(`${API_BASE_URL}/user/${userId}`, {
    method: 'DELETE',
  });
  return parseOrThrow(res, 'Failed to delete user');
};

export const userApi = {
  getUsers,
  getUserById,
  createAdmin,
  promoteToAdmin,
  deleteUser,
};
