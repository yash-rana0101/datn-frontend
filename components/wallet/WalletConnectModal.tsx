/**
 * @fileoverview Wallet Connect Modal Component
 * @description Modal for connecting to Web3 wallets with registration flow
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { cn } from '@/lib/utils';
import { Wallet, Info, X, ArrowRight } from 'lucide-react';
import { useWalletAuth } from '@/lib/hooks/useWalletAuth';
import { useAuth } from '@/lib/providers/AuthProvider';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { walletProvider } from '@/lib/web3/walletProvider';
import { createAuthMessage } from '@/lib/services/auth';
import authService from '@/lib/services/auth';
import { setAddress, setBalance, setChainId } from '@/redux/feature/walletSlice';
import { toast } from 'sonner';
import type { WalletProviderType } from '@/lib/web3/types';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const walletProviders = [
  {
    id: 'petra',
    name: 'Petra Wallet',
    Icon: Wallet,
    description: 'Connect with Petra wallet for Aptos',
  },
];

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  className,
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isConnecting } = useWalletAuth();
  const { refetchUser } = useAuth();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    walletAddress: string;
    signature: string;
    fullMessage: string;
    nonce: string;
    timestamp: number;
    publicKey: string;
  } | null>(null);

  const handleConnect = async (providerId: WalletProviderType) => {
    setSelectedProvider(providerId);
    try {
      // Step 1: Connect to Petra wallet
      const address = await walletProvider.connect(providerId);

      // Step 2: Create signature message for auth
      const nonceStr = Math.random().toString(36).substring(2, 15);
      const timestamp = Date.now();
      const message = createAuthMessage(address, nonceStr, timestamp);

      // Step 3: Sign message with Petra (pass nonce for correct verification)
      const signResult = await walletProvider.signMessage(message, nonceStr);

      // Step 4: Get public key for signature verification
      const publicKey = await walletProvider.getPublicKey();
      if (!publicKey) {
        throw new Error('Failed to get public key from wallet');
      }

      // Step 5: Try to login with backend format
      const loginResponse = await authService.login({
        wallet: address, // Aptos wallet address
        signature: signResult.signature, // Signature from Petra
        message: signResult.fullMessage, // The fullMessage that Petra signed
        nonce: nonceStr, // Random nonce
        timestamp, // Current timestamp
        publicKey, // Ed25519 public key for verification
      });

      if (loginResponse.success) {
        // Login successful - update Redux wallet state
        const balance = await walletProvider.getBalance(address);
        const chainId = await walletProvider.getChainId();

        dispatch(setAddress(address));
        dispatch(setBalance(balance));
        if (chainId) dispatch(setChainId(chainId));

        toast.success('Login successful! Redirecting to products...');

        // Refetch user data to update navbar and auth context
        await refetchUser();

        onClose();
        // Redirect to products page
        setTimeout(() => {
          router.push('/product');
        }, 300);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '';

      // Check if user not found - show registration form
      if (errorMessage.includes('User not found') || errorMessage.includes('404')) {
        // Get wallet data for registration
        const address = await walletProvider.getAddress();
        const publicKey = await walletProvider.getPublicKey();
        if (address && publicKey) {
          const nonceStr = Math.random().toString(36).substring(2, 15);
          const timestamp = Date.now();
          const message = createAuthMessage(address, nonceStr, timestamp);
          const signResult = await walletProvider.signMessage(message, nonceStr);

          setRegistrationData({
            walletAddress: address,
            signature: signResult.signature,
            fullMessage: signResult.fullMessage,
            nonce: nonceStr, // Store nonce separately
            timestamp,
            publicKey, // Add public key for verification
          });
          setShowRegistration(true);
        }
      } else {
        toast.error(errorMessage || 'Connection failed');
        console.error('Connection error:', error);
      }
    } finally {
      setSelectedProvider(null);
    }
  };

  const handleRegistrationSuccess = async () => {
    setShowRegistration(false);
    toast.success('Registration successful! Logging you in...');

    // After successful registration, try to login with the same signature
    if (registrationData) {
      try {
        const loginResponse = await authService.login({
          wallet: registrationData.walletAddress,
          signature: registrationData.signature,
          message: registrationData.fullMessage, // The fullMessage that was signed
          nonce: registrationData.nonce, // Use the same nonce
          timestamp: registrationData.timestamp, // Use the same timestamp
          publicKey: registrationData.publicKey, // Use the same public key
        });

        if (loginResponse.success) {
          // Update Redux wallet state
          const balance = await walletProvider.getBalance(registrationData.walletAddress);
          const chainId = await walletProvider.getChainId();

          dispatch(setAddress(registrationData.walletAddress));
          dispatch(setBalance(balance));
          if (chainId) dispatch(setChainId(chainId));

          setRegistrationData(null);
          toast.success('Welcome! Redirecting to products...');

          // Refetch user data to update navbar and auth context
          await refetchUser();

          onClose();
          // Redirect to products page
          setTimeout(() => {
            router.push('/product');
          }, 300);
        }
      } catch (error) {
        console.error('Auto-login after registration failed:', error);
        setRegistrationData(null);
        toast.error('Please try connecting your wallet again');
      }
    }
  };

  const handleRegistrationCancel = () => {
    setShowRegistration(false);
    setRegistrationData(null);
    walletProvider.disconnect();
  };

  if (!isOpen) return null;

  // Show registration form if needed
  if (showRegistration && registrationData) {
    return (
      <RegistrationForm
        walletAddress={registrationData.walletAddress}
        signature={registrationData.signature}
        message={registrationData.fullMessage}
        timestamp={registrationData.timestamp}
        publicKey={registrationData.publicKey}
        nonce={registrationData.nonce}
        onSuccess={handleRegistrationSuccess}
        onCancel={handleRegistrationCancel}
      />
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'bg-white dark:bg-gray-950 rounded-xl shadow-2xl max-w-md w-full',
            'border border-gray-200 dark:border-gray-800',
            'animate-in fade-in zoom-in duration-200',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div>
              <h2 className="text-xl font-bold text-black dark:text-white">
                Connect Wallet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred wallet provider
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              disabled={isConnecting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wallet Providers */}
          <div className="p-6 space-y-3">
            {walletProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleConnect(provider.id as WalletProviderType)}
                disabled={isConnecting}
                className={cn(
                  'w-full p-4 rounded-lg border border-gray-200 dark:border-gray-800',
                  'flex items-center gap-4 text-left',
                  'transition-all duration-200',
                  'hover:border-[#C6D870] hover:bg-[#C6D870]/10',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'group',
                  isConnecting && selectedProvider === provider.id && 'border-[#C6D870] bg-[#C6D870]/10'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-[#C6D870]/20 flex items-center justify-center">
                  <provider.Icon className="w-5 h-5 text-[#C6D870]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-black dark:text-white group-hover:text-[#C6D870]">
                    {provider.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {provider.description}
                  </div>
                </div>
                {isConnecting && selectedProvider === provider.id ? (
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-[#C6D870] rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#C6D870] transition-colors" />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#C6D870] shrink-0" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <p className="font-medium text-black dark:text-white mb-1">
                    New to wallets?
                  </p>
                  <p>
                    Learn how to create and secure your wallet before connecting.
                  </p>
                  <a
                    href="https://petra.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C6D870] hover:underline mt-1 inline-block"
                  >
                    Get Petra Wallet →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Loading Overlay */}
          {isConnecting && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-[#C6D870] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-black dark:text-white">
                  Connecting...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Check your wallet for approval
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WalletConnectModal;