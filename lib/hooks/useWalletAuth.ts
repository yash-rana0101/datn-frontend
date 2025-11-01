/**
 * @fileoverview Wallet Authentication Hook
 * @description Enhanced wallet hook that integrates with backend authentication
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { walletProvider } from '@/lib/web3/walletProvider';
import authService, { createAuthMessage } from '@/lib/services/auth';
import { useLogin, useCurrentUser } from '@/lib/hooks/useAuthQuery';
import { setUser, clearUser } from '@/redux/feature/userSlice';
import { setAddress, setBalance, setChainId, clearWallet } from '@/redux/feature/walletSlice';
import type { RootState } from '@/redux/store';
import type { WalletProviderType } from '@/lib/web3/types';
import { toast } from 'sonner';

export interface UseWalletAuthReturn {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isAuthenticating: boolean;
  isRegistered: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    wallet: string;
    country: string;
    role: 'BUYER' | 'SELLER';
  } | null;
  error: string | null;
  connect: (provider: WalletProviderType) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshUser: () => void;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const dispatch = useDispatch();
  const loginMutation = useLogin();
  
  const walletState = useSelector((state: RootState) => state.wallet);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data when authenticated
  const { data: userData, refetch } = useCurrentUser(walletState.isConnected);

  // Update Redux state when user data is fetched
  useEffect(() => {
    if (userData) {
      dispatch(setUser({
        walletAddress: userData.wallet,
        username: userData.name,
        role: userData.role,
      }));
    }
  }, [userData, dispatch]);

  /**
   * Connect wallet and authenticate with backend
   */
  const connect = useCallback(async (providerId: WalletProviderType) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Connect to wallet provider
      const address = await walletProvider.connect(providerId);
      dispatch(setAddress(address));

      // Step 2: Get wallet balance
      const balance = await walletProvider.getBalance(address);
      dispatch(setBalance(balance));

      // Step 3: Get chain ID
      const chainId = await walletProvider.getChainId();
      dispatch(setChainId(chainId || 0));

      // Step 4: Create nonce and message
      const nonce = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      const message = createAuthMessage(address, nonce, timestamp);

      // Step 5: Sign message with wallet (pass nonce for correct verification)
      setIsAuthenticating(true);
      const signResult = await walletProvider.signMessage(message, nonce);

      // Step 6: Get public key for verification
      const publicKey = await walletProvider.getPublicKey();
      if (!publicKey) {
        throw new Error('Failed to get public key from wallet');
      }

      // Step 7: Login to backend with the fullMessage that was actually signed
      const loginResponse = await loginMutation.mutateAsync({
        wallet: address,
        signature: signResult.signature,
        message: signResult.fullMessage, // Send the fullMessage that Petra signed
        nonce,
        timestamp,
        publicKey,
      });

      if (loginResponse.success) {
        // Fetch user data
        await refetch();
        toast.success('Wallet connected successfully!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      
      // Clean up wallet state on error
      dispatch(clearWallet());
      dispatch(clearUser());
      
      // Check if user not found (needs registration)
      if (errorMessage.includes('User not found') || errorMessage.includes('404')) {
        toast.error('Wallet not registered. Please complete registration.');
      } else {
        toast.error(errorMessage);
      }
      
      throw err;
    } finally {
      setIsConnecting(false);
      setIsAuthenticating(false);
    }
  }, [dispatch, loginMutation, refetch]);

  /**
   * Disconnect wallet and logout from backend
   */
  const disconnect = useCallback(async () => {
    try {
      // Call logout API
      await authService.logout();
      
      // Disconnect wallet provider
      walletProvider.disconnect();
      
      // Clear Redux state
      dispatch(clearWallet());
      dispatch(clearUser());
      
      toast.success('Wallet disconnected');
    } catch (err) {
      console.error('Disconnect error:', err);
      toast.error('Failed to disconnect wallet');
    }
  }, [dispatch]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(() => {
    refetch();
  }, [refetch]);

  // Listen for auth logout events (from API client interceptor)
  useEffect(() => {
    const handleAuthLogout = () => {
      disconnect();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [disconnect]);

  return {
    address: walletState.address,
    balance: walletState.balance,
    chainId: walletState.chainId,
    isConnected: walletState.isConnected,
    isConnecting,
    isAuthenticating,
    isRegistered: !!userData,
    user: userData || null,
    error: error || walletState.error,
    connect,
    disconnect,
    refreshUser,
  };
}
