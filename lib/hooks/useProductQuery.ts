/**
 * @fileoverview Product Query Hooks
 * @description TanStack Query hooks for product operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService, productKeys, CreateProductRequest, UpdateProductRequest } from '../services/product';
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
    // Accept either JSON body or FormData for file uploads
    mutationFn: async (data: CreateProductRequest | FormData) => {
      const response = await productService.createProduct(data as unknown as CreateProductRequest | FormData);
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

/**
 * Hook to update an existing product
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductRequest | FormData }) => {
      const response = await productService.updateProduct(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate products list and specific product detail
      queryClient.invalidateQueries({ queryKey: productKeys.list() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      toast.success('Product updated successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to update product';
      toast.error(errorMessage);
      console.error('Update product error:', error);
    },
  });
};

/**
 * Hook to delete a product
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productService.deleteProduct(id);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: productKeys.list() });
      toast.success('Product deleted successfully!');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage);
      console.error('Delete product error:', error);
    },
  });
};