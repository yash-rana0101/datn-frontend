/**
 * @fileoverview User Service
 * @description API service for user-related operations
 */

import { apiClient } from '@/lib/api/client';
import { UpdateUserRequest, User } from '@/lib/types/auth.types';

export interface UserStats {
  activeListings: number;
  totalOrders: number;
  completedOrders: number;
  totalAmount: number;
  role: 'BUYER' | 'SELLER';
}

export interface UserProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  category: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface UserOrder {
  id: string;
  status: string;
  createdAt: string;
  product: {
    name: string;
    price: number;
    images: string[];
    category: string;
  };
}

class UserService {
  /**
   * Get current user profile
   */
  static async getCurrentUser() {
    const response = await apiClient.get<{ success: boolean; data: User }>('/v1/user/me');
    return response.data;
  }

  /**
   * Update current user profile
   */
  static async updateUser(data: UpdateUserRequest) {
    const response = await apiClient.put<{ success: boolean; message: string }>('/v1/user', data);
    return response.data;
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const response = await apiClient.get<{ success: boolean; data: UserStats }>('/v1/user/stats');
    return response.data;
  }

  /**
   * Get user products (for sellers)
   */
  static async getUserProducts() {
    const response = await apiClient.get<{ success: boolean; data: UserProduct[] }>('/v1/user/products');
    return response.data;
  }

  /**
   * Get user orders
   */
  static async getUserOrders() {
    const response = await apiClient.get<{ success: boolean; data: UserOrder[] }>('/v1/user/orders');
    return response.data;
  }
}

export default UserService;