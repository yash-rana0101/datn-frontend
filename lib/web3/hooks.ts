/**
 * @fileoverview Wallet Hooks
 * @description Custom React hooks for wallet functionality
 */

import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
  connectWallet as connectWalletAction,
  disconnectWallet as disconnectWalletAction,
  updateBalance,
  refreshUserProfile,
  setAddress,
  clearError,
} from '@/redux/feature/walletSlice';
import { WalletProviderType } from '@/lib/web3/types';
import { walletProvider } from '@/lib/web3/walletProvider';
import { toast } from 'sonner';

/**
 * Hook for wallet connection and management
 */
export const useWallet = () => {
  const dispatch = useDispatch<AppDispatch>();
  const walletState = useSelector((state: RootState) => state.wallet);

  /**
   * Connect wallet
   */
  const connect = useCallback(
    async (providerId: WalletProviderType) => {
      try {
        await dispatch(connectWalletAction(providerId)).unwrap();
        toast.success('Wallet connected successfully!');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to connect wallet';
        toast.error(message);
        throw error;
      }
    },
    [dispatch]
  );

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    try {
      await dispatch(disconnectWalletAction()).unwrap();
      toast.success('Wallet disconnected');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to disconnect wallet';
      toast.error(message);
    }
  }, [dispatch]);

  /**
   * Refresh balance
   */
  const refreshBalance = useCallback(async () => {
    try {
      await dispatch(updateBalance()).unwrap();
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  }, [dispatch]);

  /**
   * Refresh user profile
   */
  const refreshProfile = useCallback(async () => {
    try {
      await dispatch(refreshUserProfile()).unwrap();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [dispatch]);

  /**
   * Clear error state
   */
  const clearWalletError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...walletState,
    connect,
    disconnect,
    refreshBalance,
    refreshProfile,
    clearError: clearWalletError,
  };
};

/**
 * Hook for setting up wallet event listeners
 */
export const useWalletEvents = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleAccountsChanged = (account: { address: string } | null) => {
      if (!account) {
        // User disconnected their wallet
        dispatch(disconnectWalletAction());
        toast.info('Wallet disconnected');
      } else {
        // User switched accounts
        dispatch(setAddress(account.address));
        dispatch(updateBalance());
        toast.info('Wallet account changed');
      }
    };

    const handleChainChanged = (network: { name: string }) => {
      toast.info(`Network changed to ${network.name}`);
      
      // Reload the page to reset the app state
      window.location.reload();
    };

    const handleDisconnect = () => {
      dispatch(disconnectWalletAction());
      toast.info('Wallet disconnected');
    };

    // Setup event listeners
    walletProvider.setupEventListeners({
      onAccountsChanged: handleAccountsChanged,
      onChainChanged: handleChainChanged,
      onDisconnect: handleDisconnect,
    });

    // Cleanup
    return () => {
      walletProvider.removeEventListeners({
        onAccountsChanged: handleAccountsChanged,
        onChainChanged: handleChainChanged,
        onDisconnect: handleDisconnect,
      });
    };
  }, [dispatch]);
};

/**
 * Hook to check if wallet is installed
 */
export const useWalletInstalled = (providerId: WalletProviderType) => {
  return walletProvider.isWalletAvailable(providerId);
};

/**
 * Hook for user authentication status
 */
export const useAuth = () => {
  const { isConnected, user, token, address } = useSelector((state: RootState) => state.wallet);

  return {
    isAuthenticated: isConnected && !!user && !!token,
    user,
    token,
    address,
  };
};
