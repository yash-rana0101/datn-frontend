/**
 * @fileoverview Order Service
 * @description API service for order-related operations
 */

import { apiClient } from '../api/client';
import { AxiosResponse } from 'axios';

/**
 * Order interface matching backend response
 */
export interface Order {
  id: string;
  status: string;
  createdAt: string;
  deliveryCode?: string;
  product: {
    id?: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    description?: string;
    quantity?: number;
  };
  buyer?: {
    id: string;
    name: string;
    email: string;
    wallet: string;
  };
  transaction?: {
    id: string;
    txHash: string;
    amount: number;
    status: string;
  };
}

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Order Service
 */
export const orderService = {
  /**
   * Get all user orders
   * @returns Promise with array of orders
   */
  getUserOrders: async (): Promise<AxiosResponse<ApiResponse<Order[]>>> => {
    return apiClient.get('/v1/user/orders');
  },

  /**
   * Get specific order by ID
   * @param id - Order ID
   * @returns Promise with order details
   */
  getOrderById: async (id: string): Promise<AxiosResponse<ApiResponse<Order>>> => {
    return apiClient.get(`/v1/order/${id}`);
  },
};

/**
 * Query keys for React Query
 */
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};
