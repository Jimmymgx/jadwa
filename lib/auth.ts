/**
 * Authentication utilities
 */

import { api } from './api';
import { User } from './types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const auth = {
  async register(
    email: string,
    password: string,
    fullName: string,
    role: 'client' | 'consultant'
  ): Promise<{ user: User | null; token: string | null; error: string | null }> {
    const result = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      fullName,
      role,
    });

    if (result.error || !result.data) {
      return { user: null, token: null, error: result.error || 'Registration failed' };
    }

    // Store token in cookie
    if (typeof document !== 'undefined') {
      document.cookie = `auth_token=${result.data.token}; path=/; max-age=604800`; // 7 days
    }

    return { user: result.data.user, token: result.data.token, error: null };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ user: User | null; token: string | null; error: string | null }> {
    const result = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (result.error || !result.data) {
      return { user: null, token: null, error: result.error || 'Login failed' };
    }

    // Store token in cookie
    if (typeof document !== 'undefined') {
      document.cookie = `auth_token=${result.data.token}; path=/; max-age=604800`; // 7 days
    }

    return { user: result.data.user, token: result.data.token, error: null };
  },

  async verify(token: string): Promise<{ user: User | null; error: string | null }> {
    const result = await api.post<{ user: User }>('/auth/verify', {}, token);

    if (result.error || !result.data) {
      return { user: null, error: result.error || 'Verification failed' };
    }

    return { user: result.data.user, error: null };
  },

  logout(): void {
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  getToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return value;
      }
    }
    return null;
  },
};
