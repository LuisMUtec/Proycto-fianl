/**
 * Servicio de autenticación - E-Commerce Service
 * Endpoints: /auth/register, /auth/login, /auth/refresh-token, /auth/logout
 */

import { ecommerceApi } from '../lib/api-client';

export interface LoginResponse {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: string;
    status: string;
    createdAt: string;
  };
  token: string;
  message?: string;
}

export interface RegisterResponse {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  message?: string;
}

export interface RefreshTokenResponse {
  token: string;
  userId: string;
}

/**
 * POST /auth/login - Iniciar sesión
 */
export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
  return await ecommerceApi.post<LoginResponse>('/auth/login', credentials, false);
}

/**
 * POST /auth/register - Registrar nuevo cliente
 * NOTA: El rol siempre es "cliente" para este frontend
 * El tenant_id es "CLIENTE" para evitar error de índice GSI
 */
export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
}): Promise<RegisterResponse> {
  return await ecommerceApi.post<RegisterResponse>('/auth/register', {
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    address: data.address,
    role: 'cliente',
    tenant_id: 'CLIENTE', // Requerido por el índice GSI del backend
  }, false);
}

/**
 * POST /auth/refresh-token - Renovar token JWT
 */
export async function refreshToken(): Promise<RefreshTokenResponse> {
  return await ecommerceApi.post<RefreshTokenResponse>('/auth/refresh-token', {}, true);
}

/**
 * POST /auth/logout - Cerrar sesión
 */
export async function logout(): Promise<{ message: string }> {
  return await ecommerceApi.post<{ message: string }>('/auth/logout', {}, true);
}

export default { login, register, refreshToken, logout };
