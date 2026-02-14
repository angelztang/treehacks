import { FRONTEND_URL, API_URL } from '../config';

export interface UserInfo {
  id?: number;
  username?: string;
  email?: string;
  netid?: string;
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

// Sets or clears the user info stored in localStorage. Accepts a UserInfo object
// or null to clear the stored user. This mirrors how other parts of the app
// expect to update the cached user after CAS validation.
export const setUserInfo = (user: UserInfo | null) => {
  if (!user) {
    localStorage.removeItem('user');
  } else {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Helper to get the user's netid, if present.
export const getNetid = (): string | null => {
  const info = getUserInfo();
  if (!info) return null;
  // Prefer explicit netid, fall back to username if available
  return info.netid || info.username || null;
};