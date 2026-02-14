import { FRONTEND_URL } from '../config';

const API_URL = 'http://localhost:8000';

export interface UserInfo {
  id: number;
  username?: string;
  email?: string;
}

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
    mode: 'cors'
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(err.message || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const signup = async (username: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
    credentials: 'include',
    mode: 'cors'
  });
  if (!response.ok) throw new Error('Signup failed');
  return response.json();
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getUserId = (): string | null => {
  const u = localStorage.getItem('user');
  if (!u) return null;
  try {
    const parsed = JSON.parse(u);
    return parsed.id ? String(parsed.id) : null;
  } catch {
    return null;
  }
};

export const getUserInfo = (): UserInfo | null => {
  const u = localStorage.getItem('user');
  if (!u) return null;
  try {
    return JSON.parse(u);
  } catch {
    return null;
  }
};