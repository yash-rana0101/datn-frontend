/**
 * @fileoverview Auth Context Provider
 * @description Manages authentication state and user persistence
 */

'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useCurrentUser } from '@/lib/hooks/useAuthQuery';
import { useWalletAuth } from '@/lib/hooks/useWalletAuth';
import { setUser, clearUser } from '@/redux/feature/userSlice';
import type { User } from '@/lib/types/auth.types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const { isConnected, address } = useWalletAuth();

  // Always try to fetch user data (backend will check cookies)
  const { data: userData, isLoading, refetch } = useCurrentUser(true);

  // Debug logging
  useEffect(() => {
    console.log('🔍 AuthProvider State:', {
      userData,
      isLoading,
      isConnected,
      address,
      isAuthenticated: isConnected && !!userData
    });
  }, [userData, isLoading, isConnected, address]);

  // Update Redux state when user data changes
  useEffect(() => {
    if (userData) {
      console.log('✅ Setting user in Redux:', userData);
      dispatch(setUser({
        walletAddress: userData.wallet,
        username: userData.name,
        role: userData.role,
      }));
    } else {
      console.log('❌ Clearing user from Redux');
      dispatch(clearUser());
    }
  }, [userData, dispatch]);

  // Refetch when wallet connects (in case user was logged out)
  useEffect(() => {
    if (isConnected && address) {
      refetch();
    }
  }, [isConnected, address, refetch]);

  const value: AuthContextValue = {
    user: userData || null,
    isLoading: isLoading,
    // User is authenticated if they have user data (backend validated cookies)
    isAuthenticated: !!userData,
    refetchUser: refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
