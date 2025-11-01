"use client";

import React from 'react';
import { useAuth } from '@/lib/providers/AuthProvider';

export default function SellerPaymentsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-4">Payments</h1>
      <div className="p-4 rounded-lg border border-gray-700 bg-[#0b0b0b]/60">
        <p className="text-gray-300">Payments overview for <span className="font-semibold text-white">{user?.name}</span></p>
        <div className="mt-4 text-gray-400">No payment records available yet.</div>
      </div>
    </div>
  );
}
