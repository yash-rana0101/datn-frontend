/**
 * @fileoverview Web3 Module Exports
 * @description Central export point for Web3 functionality
 */

// Configuration
export { default as WEB3_CONFIG } from './config';

// Types
export * from './types';

// Services
export { walletProvider, WalletProviderService } from './walletProvider';
export { authService, AuthService } from './authService';

// Hooks
export { useWallet, useWalletEvents, useWalletInstalled, useAuth } from './hooks';
