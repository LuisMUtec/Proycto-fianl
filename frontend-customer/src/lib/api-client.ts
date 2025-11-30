/**
 * Cliente API base con interceptores para autenticación
 * Maneja automáticamente tokens JWT y refresh
 */

import API_ENDPOINTS from '../config/api-endpoints';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : { message: await response.text() };

      // Token expirado - intentar refresh
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          // Refresh falló, limpiar sesión
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_profile');
          window.location.href = '/auth/login';
        }
      }

      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    if (!isJson) {
      return {} as T;
    }

    const jsonData = await response.json();

    // El backend devuelve { data: {...}, message: "..." }
    // Extraer solo el contenido de data si existe
    if (jsonData.data !== undefined) {
      return jsonData.data as T;
    }

    return jsonData as T;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body?: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(includeAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body?: any, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(includeAuth),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(includeAuth),
    });

    return this.handleResponse<T>(response);
  }
}

// Instancias de clientes API
export const ecommerceApi = new ApiClient(API_ENDPOINTS.ECOMMERCE);
export const deliveryApi = new ApiClient(API_ENDPOINTS.DELIVERY);

export default ApiClient;
