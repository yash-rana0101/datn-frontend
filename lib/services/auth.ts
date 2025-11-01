/**
 * @fileoverview Authentication API Service
 * @description Service for authentication-related API calls
 */

import { apiClient } from '../api/client';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshResponse,
  UserResponse,
  UpdateUserRequest,
} from '../types/auth.types';

/**
 * Create authentication message for wallet signature (matches backend format)
 */
export const createAuthMessage = (address: string, nonce: string, timestamp: number): string => {
  return `
DATN Aptos Marketplace Authentication

Wallet: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}

This signature proves wallet ownership. No gas cost.`;
};

/**
 * Login with wallet signature
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/v1/auth/login', data);
  return response.data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/v1/auth/register', data);
  return response.data;
};

/**
 * Refresh access token
 */
export const refresh = async (): Promise<RefreshResponse> => {
  const response = await apiClient.post<RefreshResponse>('/v1/auth/refresh');
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/v1/auth/logout');
  return response.data;
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  const response = await apiClient.get<UserResponse>('/v1/user/me');
  return response.data;
};

/**
 * Update current user
 */
export const updateCurrentUser = async (data: UpdateUserRequest): Promise<AuthResponse> => {
  const response = await apiClient.patch<AuthResponse>('/v1/user/me', data);
  return response.data;
};

const authService = {
  login,
  register,
  refresh,
  logout,
  getCurrentUser,
  updateCurrentUser,
  createAuthMessage,
};

export default authService;
