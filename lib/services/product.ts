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
 * Update product request interface
 */
export interface UpdateProductRequest {
  name?: string;
  price?: number;
  description?: string;
  quantity?: number;
  category?: string;
  images?: string[];
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
  /**
   * Create new product. Accepts either a JSON body (with image URLs) or a FormData instance
   * when uploading files (multipart/form-data).
   */
  createProduct: async (data: CreateProductRequest | FormData): Promise<AxiosResponse<ApiResponse<Product>>> => {
    if (data instanceof FormData) {
      // For FormData uploads we MUST let the browser set the Content-Type
      // (including the multipart boundary). The axios instance has a default
      // Content-Type header, so call the raw instance and explicitly unset the
      // header here so the browser will provide the correct multipart boundary.
      return apiClient.getInstance().post('/v1/product', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return apiClient.post('/v1/product', data);
  },

  /**
   * Update existing product
   * @param id - Product ID
   * @param data - Product data to update (can be FormData or JSON)
   * @returns Promise with updated product
   */
  updateProduct: async (id: string, data: UpdateProductRequest | FormData): Promise<AxiosResponse<ApiResponse<Product>>> => {
    if (data instanceof FormData) {
      return apiClient.getInstance().put(`/v1/product/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return apiClient.put(`/v1/product/${id}`, data);
  },

  /**
   * Delete product
   * @param id - Product ID
   * @returns Promise with delete confirmation
   */
  deleteProduct: async (id: string): Promise<AxiosResponse<ApiResponse<void>>> => {
    return apiClient.delete(`/v1/product/${id}`);
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
