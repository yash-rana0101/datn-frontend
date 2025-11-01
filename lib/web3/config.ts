/**
 * @fileoverview Web3 Configuration
 * @description Configuration for Web3 providers and network settings
 */

export const WEB3_CONFIG = {
  // Volta Network Configuration
  VOLTA_NETWORK: {
    chainId: '0x12047', // 73799 in hex
    chainName: 'Volta',
    nativeCurrency: {
      name: 'Volta Token',
      symbol: 'VT',
      decimals: 18,
    },
    rpcUrls: ['https://volta-rpc.energyweb.org'],
    blockExplorerUrls: ['https://volta-explorer.energyweb.org'],
  },

  // Supported Networks
  SUPPORTED_CHAINS: {
    VOLTA: 73799,
    // Add more networks as needed
  },

  // API Endpoints
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',

  // Local Storage Keys
  STORAGE_KEYS: {
    WALLET_ADDRESS: 'wallet_address',
    AUTH_TOKEN: 'auth_token',
    NONCE: 'auth_nonce',
  },
} as const;

export default WEB3_CONFIG;
