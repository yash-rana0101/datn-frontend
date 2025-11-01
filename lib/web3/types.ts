/**
 * @fileoverview Web3 Type Definitions
 * @description Type definitions for wallet and Web3 functionality
 */

export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

export interface AuthenticationPayload {
  walletAddress: string;
  signature: string;
  nonce: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  name?: string;
  email?: string;
  role: 'buyer' | 'seller' | 'admin';
  profileImage?: string;
  bio?: string;
  rating: number;
  totalTrades: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    token: string;
    nonce?: string;
  };
}

export type WalletProviderType = 'metamask' | 'walletconnect' | 'coinbase' | 'trust';

export interface ConnectWalletOptions {
  providerId: WalletProviderType;
}
