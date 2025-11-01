/**
 * @fileoverview User Query Hooks
 * @description TanStack Query hooks for user profile operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import UserService from '@/lib/services/users';
import { UpdateUserRequest } from '@/lib/types/auth.types';
import { toast } from 'sonner';

/**
 * Query keys for user-related queries
 */
export const userKeys = {
  all: ['user'] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
  products: () => [...userKeys.all, 'products'] as const,
  orders: () => [...userKeys.all, 'orders'] as const,
};

/**
 * Hook to get user statistics
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async () => {
      const response = await UserService.getUserStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get user products
 */
export const useUserProducts = () => {
  return useQuery({
    queryKey: userKeys.products(),
    queryFn: async () => {
      const response = await UserService.getUserProducts();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get user orders
 */
export const useUserOrders = () => {
  return useQuery({
    queryKey: userKeys.orders(),
    queryFn: async () => {
      const response = await UserService.getUserOrders();
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await UserService.updateUser(data);
      return response;
    },
    onSuccess: () => {
      // Invalidate user queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['auth', 'currentUser'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });
};
