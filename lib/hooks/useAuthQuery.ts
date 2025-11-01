/**
 * @fileoverview Authentication React Query Hooks
 * @description TanStack Query hooks for authentication operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import authService from '../services/auth';
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
} from '../types/auth.types';
import { clearUser } from '@/redux/feature/userSlice';
import { clearWallet } from '@/redux/feature/walletSlice';
import { toast } from 'sonner';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
};

/**
 * Hook to get current authenticated user
 */
export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      return response.data;
    },
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to login with wallet
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        
        toast.success('Login successful!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
};

/**
 * Hook to register new user
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate queries to fetch fresh data
        queryClient.invalidateQueries({ queryKey: authKeys.all });
        
        toast.success('Registration successful!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
};

/**
 * Hook to logout user
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Clear Redux state
      dispatch(clearUser());
      dispatch(clearWallet());
      
      toast.success('Logged out successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed');
    },
  });
};

/**
 * Hook to update current user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => authService.updateCurrentUser(data),
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
        
        toast.success('Profile updated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Update failed');
    },
  });
};

/**
 * Hook to refresh authentication token
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: () => authService.refresh(),
    retry: false,
  });
};
