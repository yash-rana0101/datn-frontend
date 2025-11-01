/**
 * @fileoverview Order Query Hooks
 * @description TanStack Query hooks for order operations
 */

import { useQuery } from '@tanstack/react-query';
import { orderService, orderKeys } from '../services/order';

/**
 * Hook to get all user orders
 */
export const useOrders = () => {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: async () => {
      const response = await orderService.getUserOrders();
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

/**
 * Hook to get a specific order by ID
 */
export const useOrder = (id: string, enabled = true) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await orderService.getOrderById(id);
      return response.data.data;
    },
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};
