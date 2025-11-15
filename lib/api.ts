/**
 * API Client
 * Handles all HTTP requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { method = 'GET', body, headers = {}, token } = options;

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return { data: null, error: errorData.error || errorData.message || 'Request failed' };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API request error:', error);
    return { data: null, error: error instanceof Error ? error.message : 'Network error' };
  }
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'GET', token }),
  
  post: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, { method: 'POST', body, token }),
  
  put: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, { method: 'PUT', body, token }),
  
  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: 'DELETE', token }),
};
