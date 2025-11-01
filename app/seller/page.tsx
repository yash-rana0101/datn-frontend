"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/providers/AuthProvider';
import { useProducts } from '@/lib/hooks/useProductQuery';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const { data: products = [] } = useProducts();

  const myProducts = products.filter(p => p.user?.wallet === user?.wallet || p.user?.id === user?.id);

  const totalQuantity = useMemo(() => myProducts.reduce((s, p) => s + (p.quantity || 0), 0), [myProducts]);
  const totalValue = useMemo(() => myProducts.reduce((s, p) => s + ((p.price || 0) * (p.quantity || 0)), 0), [myProducts]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Seller Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
          <h3 className="text-sm text-gray-300">Profile</h3>
          <div className="mt-2">
            <div className="text-white font-semibold">{user?.name}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
            <div className="text-xs text-gray-400">Role: {user?.role}</div>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
          <h3 className="text-sm text-gray-300">Products</h3>
          <div className="mt-2 text-white font-bold text-2xl">{myProducts.length}</div>
          <div className="text-xs text-gray-400 mt-1">Total products listed by you</div>
          <div className="mt-3 text-xs text-gray-400">Total Quantity: <span className="text-white font-semibold">{totalQuantity}</span></div>
          <div className="mt-1 text-xs text-gray-400">Inventory Value: <span className="text-white font-semibold">${totalValue.toFixed(2)}</span></div>
        </div>

        <div className="p-4 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
          <h3 className="text-sm text-gray-300">Quick Actions</h3>
          <div className="mt-3 flex flex-col gap-2">
            <Link href="/seller/products" className="px-3 py-2 bg-[#C6D870] text-black rounded-md text-sm">Create Product</Link>
            <Link href="/seller/inventory" className="px-3 py-2 border border-[#C6D870] text-[#C6D870] rounded-md text-sm">Manage Inventory</Link>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg text-white font-semibold mb-3">Recent Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {myProducts.slice(0, 6).map(p => (
            <div key={p.id} className="p-3 rounded-md border border-gray-800 bg-[#0b0b0b]">
              <div className="h-36 w-full bg-gray-900 rounded-md overflow-hidden flex items-center justify-center">
                {p.images && p.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-600">No image</div>
                )}
              </div>
              <div className="mt-3">
                <div className="text-white font-semibold">{p.name}</div>
                <div className="text-xs text-gray-400">{p.category}</div>
                <div className="mt-2 text-sm text-gray-300">Qty: {p.quantity ?? '—'}</div>
              </div>
            </div>
          ))}
          {myProducts.length === 0 && <div className="text-gray-400">No products yet. Create your first product.</div>}
        </div>
      </div>
    </div>
  );
}
