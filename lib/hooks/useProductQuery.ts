/**
 * @fileoverview Product Query Hooks
 * @description TanStack Query hooks for product operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, productKeys, CreateProductRequest } from '../services/product';
import { toast } from 'sonner';

/**
 * Hook to get all products
 */
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: async () => {
      const response = await productService.getAllProducts();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to get a specific product by ID
 */
export const useProduct = (id: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await productService.getProductById(id);
      return response.data.data;
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to create a new product
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductRequest) => {
      const response = await productService.createProduct(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.list() });
      toast.success('Product created successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to create product';
      toast.error(errorMessage);
      console.error('Create product error:', error);
    },
  });
};
