/**
 * @fileoverview User Registration Form
 * @description Form component for new user registration after wallet authentication
 */

'use client';

import { useState } from 'react';
import { useRegister } from '@/lib/hooks/useAuthQuery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User, Mail, Globe, UserCircle, Store } from 'lucide-react';
import type { RegisterRequest } from '@/lib/types/auth.types';

interface RegistrationFormProps {
  walletAddress: string;
  signature: string;
  message: string; // The fullMessage that was signed by Petra
  timestamp: number;
  publicKey: string;
  nonce: string; // Add nonce to props
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RegistrationForm({
  walletAddress,
  signature,
  message,
  timestamp,
  publicKey,
  nonce,
  onSuccess,
  onCancel,
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    role: 'BUYER' as 'BUYER' | 'SELLER',
  });

  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const registrationData: RegisterRequest = {
      ...formData,
      wallet: walletAddress,
      signature,
      message, // The fullMessage that was signed by Petra
      nonce, // Use the actual nonce that was used to create the signature
      timestamp,
      publicKey,
    };

    try {
      await registerMutation.mutateAsync(registrationData);
      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isValid =
    formData.name.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.country.trim() !== '' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="bg-black border   border-[#C6D870] w-full max-w-md p-8 mx-4 h-[80vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="neo-flat rounded-full p-4 bg-black">
              <UserCircle className="w-12 h-12 text-[#C6D870]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
          <p className="text-gray-400 text-sm">
            Set up your account to start using DATN Marketplace
          </p>
        </div>

        {/* Wallet Badge */}
        <div className="mb-6 p-3 rounded-lg bg-black/40 border border-white/10">
          <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
          <p className="text-sm text-white font-mono truncate">{walletAddress}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-[#C6D870]" />
              Full Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C6D870]" />
              Email Address *
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C6D870]" />
              Country *
            </label>
            <Input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Enter your country"
              className="glass-neo border-white/10 focus:border-[#C6D870] bg-black/40 text-white placeholder:text-gray-500"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm text-gray-300 font-medium">Choose Your Role *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'BUYER' }))}
                className={`
                  neo-flat p-4 rounded-lg transition-all duration-200
                  ${formData.role === 'BUYER'
                    ? 'bg-[#C6D870]/20 border-2 border-[#C6D870]'
                    : 'bg-black/40 border-2 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <UserCircle
                  className={`w-8 h-8 mx-auto mb-2 ${formData.role === 'BUYER' ? 'text-[#C6D870]' : 'text-gray-400'
                    }`}
                />
                <p
                  className={`text-sm font-medium ${formData.role === 'BUYER' ? 'text-[#C6D870]' : 'text-gray-300'
                    }`}
                >
                  Buyer
                </p>
                <p className="text-xs text-gray-500 mt-1">Browse & purchase products</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, role: 'SELLER' }))}
                className={`
                  neo-flat p-4 rounded-lg transition-all duration-200
                  ${formData.role === 'SELLER'
                    ? 'bg-[#C6D870]/20 border-2 border-[#C6D870]'
                    : 'bg-black/40 border-2 border-white/10 hover:border-white/20'
                  }
                `}
              >
                <Store
                  className={`w-8 h-8 mx-auto mb-2 ${formData.role === 'SELLER' ? 'text-[#C6D870]' : 'text-gray-400'
                    }`}
                />
                <p
                  className={`text-sm font-medium ${formData.role === 'SELLER' ? 'text-[#C6D870]' : 'text-gray-300'
                    }`}
                >
                  Seller
                </p>
                <p className="text-xs text-gray-500 mt-1">List & sell products</p>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1 neo-flat border-white/10 hover:border-white/20 text-white"
                disabled={registerMutation.isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || registerMutation.isPending}
              className="flex-1 neo-flat bg-[#C6D870]! hover:bg-[#454d1d]! text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {registerMutation.isError && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 text-center">
              {registerMutation.error.message || 'Registration failed. Please try again.'}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
}
