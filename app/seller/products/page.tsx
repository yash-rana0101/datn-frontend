"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/lib/hooks/useProductQuery';
import { useAuth } from '@/lib/providers/AuthProvider';
import type { Product } from '@/lib/services/product';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const { data: products = [], isLoading } = useProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const [form, setForm] = useState(
    {
      name: '',
      price: '',
      description: '',
      quantity: '1',
      category: ''
    });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const myProducts = products.filter(p => p.user?.wallet === user?.wallet || p.user?.id === user?.id);

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Build FormData for multipart upload (backend expects files under `images`)
    const formData = new FormData();
    formData.append('name', form.name);
    // FormData only accepts strings/Blobs; send as string, backend will coerce to number
    formData.append('price', String(Number(form.price) || 0));
    formData.append('description', form.description || '');
    formData.append('quantity', String(Number(form.quantity) || 1));
    formData.append('category', form.category || 'uncategorized');

    files.forEach((file) => {
      formData.append('images', file);
    });

    createProductMutation.mutate(formData, {
      onSuccess: () => {
        // clear form
        setForm({ name: '', price: '', description: '', quantity: '1', category: '' });
        setFiles([]);
        setPreviews([]);
      },
      onSettled: () => setSubmitting(false),
    });
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const arr = Array.from(selected).slice(0, 5); // limit to 5
    setFiles(arr);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  // Drag and drop support
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    const selected = Array.from(dt.files || []).filter((f) => f.type.startsWith('image/')).slice(0, 5);
    if (selected.length === 0) return;
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // derived stats for seller's products
  const totalQuantity = useMemo(() => myProducts.reduce((s, p) => s + (p.quantity || 0), 0), [myProducts]);
  const totalValue = useMemo(() => myProducts.reduce((s, p) => s + ((p.price || 0) * (p.quantity || 0)), 0), [myProducts]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Manage Products</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-4 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
          <h2 className="text-lg font-semibold text-white mb-2">Create Product</h2>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Category</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Price</label>
                <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" inputMode="decimal" className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-2">Quantity</label>
                <input value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="1" inputMode="numeric" className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm" />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add product description" className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm h-28 resize-none" />
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">Images (up to 5)</label>
              <div onDrop={onDrop} onDragOver={onDragOver} className="flex flex-col sm:flex-row gap-3 items-center p-4 rounded-2xl border border-white/6 bg-linear-to-tr from-white/2 to-black/5 backdrop-blur-md">
                <div className="flex-1">
                  <div className="text-sm text-gray-400">Drag & drop images here or</div>
                  <label className="inline-block mt-2 px-4 py-2 bg-[#C6D870] text-black rounded-lg cursor-pointer">
                    <input type="file" accept="image/*" multiple onChange={handleFilesChange} className="hidden" />
                    Choose files
                  </label>
                </div>
                <div className="flex gap-2">
                  {previews.length > 0 ? (
                    previews.map((src, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-800 border border-white/6">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400">No images selected</div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
                <div className="text-xs text-gray-300">Total items</div>
                <div className="text-lg font-bold text-white">{myProducts.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
                <div className="text-xs text-gray-300">Total quantity</div>
                <div className="text-lg font-bold text-white">{totalQuantity}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/3 border border-white/6 text-center">
                <div className="text-xs text-gray-300">Inventory value</div>
                <div className="text-lg font-bold text-white">${totalValue.toFixed(2)}</div>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={submitting} className="px-6 py-3 rounded-2xl bg-linear-to-r from-[#C6D870] to-[#B5C760] text-black font-semibold shadow-lg">{submitting ? 'Creating...' : 'Create Product'}</button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 p-4 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
          <h2 className="text-lg font-semibold text-white mb-4">Your Products</h2>
          {isLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProducts.map(p => (
                <div key={p.id} className="p-4 rounded-xl border border-gray-800 bg-linear-to-br from-[#0b0b0b] via-[#0b0b0b] to-[#1a1a1a] flex flex-col backdrop-blur-sm hover:border-[#C6D870]/30 transition-all">
                  {/* Image Section */}
                  <div className="h-48 w-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center relative">
                    {p.images && p.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-gray-600">No image</div>
                    )}
                    {/* Availability Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${p.isAvailable ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                      {p.isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mt-4 flex-1 space-y-2">
                    <div className="text-white font-semibold text-lg">{p.name}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{p.category}</div>

                    {/* Description */}
                    {p.description && (
                      <p className="text-sm text-gray-300 line-clamp-2 mt-2">{p.description}</p>
                    )}

                    {/* Price & Quantity */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-lg text-[#C6D870] font-bold">${p.price}</div>
                      <div className="text-sm text-gray-400">Qty: <span className="text-white font-semibold">{p.quantity ?? '—'}</span></div>
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-gray-500 space-y-1 pt-2 border-t border-gray-800">
                      <div>Created: {new Date(p.createdAt).toLocaleDateString()}</div>
                      <div>Updated: {new Date(p.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setShowEditModal(true);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-[#C6D870] text-[#C6D870] rounded-lg hover:bg-[#C6D870]/10 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {myProducts.length === 0 && <div className="text-gray-400">No products found</div>}
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Edit Product</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData();
              formData.append('name', (e.currentTarget.elements.namedItem('editName') as HTMLInputElement).value);
              formData.append('price', String(Number((e.currentTarget.elements.namedItem('editPrice') as HTMLInputElement).value)));
              formData.append('description', (e.currentTarget.elements.namedItem('editDescription') as HTMLTextAreaElement).value);
              formData.append('quantity', String(Number((e.currentTarget.elements.namedItem('editQuantity') as HTMLInputElement).value)));
              formData.append('category', (e.currentTarget.elements.namedItem('editCategory') as HTMLInputElement).value);

              const editFiles = (e.currentTarget.elements.namedItem('editImages') as HTMLInputElement).files;
              if (editFiles && editFiles.length > 0) {
                Array.from(editFiles).forEach(file => formData.append('images', file));
              }

              updateProductMutation.mutate({ id: editingProduct.id, data: formData }, {
                onSuccess: () => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }
              });
            }} className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-2">Product Name</label>
                <input
                  name="editName"
                  defaultValue={editingProduct.name}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Price ($)</label>
                  <input
                    name="editPrice"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct.price}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-2">Quantity</label>
                  <input
                    name="editQuantity"
                    type="number"
                    min="1"
                    defaultValue={editingProduct.quantity}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-2">Category</label>
                <input
                  name="editCategory"
                  defaultValue={editingProduct.category}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-2">Description</label>
                <textarea
                  name="editDescription"
                  defaultValue={editingProduct.description || ''}
                  className="w-full px-4 py-3 rounded-xl bg-white/4 text-white placeholder-gray-400 border border-white/6 backdrop-blur-sm h-28 resize-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-300 block mb-2">Replace Images (optional)</label>
                <input
                  name="editImages"
                  type="file"
                  accept="image/*"
                  multiple
                  className="w-full px-4 py-3 rounded-xl bg-white/4 text-white border border-white/6 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#C6D870] file:text-black file:cursor-pointer"
                />
                <div className="mt-2 text-xs text-gray-400">Current images: {editingProduct.images?.length || 0}</div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending}
                  className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-[#C6D870] to-[#B5C760] text-black font-semibold shadow-lg disabled:opacity-50"
                >
                  {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0b0b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="text-[#C6D870] font-semibold">{myProducts.find(p => p.id === deleteConfirmId)?.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProductMutation.mutate(deleteConfirmId, {
                    onSuccess: () => setDeleteConfirmId(null)
                  });
                }}
                disabled={deleteProductMutation.isPending}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
