/**
 * @fileoverview Product Service
 * @description API service for product-related operations
 */

import { apiClient } from '../api/client';
import { AxiosResponse } from 'axios';

/**
 * Product interface matching backend response
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantity?: number;
  images: string[];
  category: string;
  isAvailable: boolean;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    wallet: string;
    role: string;
  };
}

/**
 * Create product request interface
 */
export interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  images: string[];
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
 * Product Service
 */
export const productService = {
  /**
   * Get all products
   * @returns Promise with array of products
   */
  getAllProducts: async (): Promise<AxiosResponse<ApiResponse<Product[]>>> => {
    return apiClient.get('/v1/product');
  },

  /**
   * Get specific product by ID
   * @param id - Product ID
   * @returns Promise with product details
   */
  getProductById: async (id: string): Promise<AxiosResponse<ApiResponse<Product>>> => {
    return apiClient.get(`/v1/product/${id}`);
  },

  /**
   * Create new product
   * @param data - Product data
   * @returns Promise with created product
   */
  createProduct: async (data: CreateProductRequest): Promise<AxiosResponse<ApiResponse<Product>>> => {
    return apiClient.post('/v1/product', data);
  },
};

/**
 * Query keys for React Query
 */
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: () => [...productKeys.lists()] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};
