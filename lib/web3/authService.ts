/**
 * @fileoverview Authentication Service
 * @description Handles authentication flow with backend API using wallet signatures
 */

import axios, { AxiosInstance } from 'axios';
import { AuthResponse, AuthenticationPayload, UserProfile } from './types';
import WEB3_CONFIG from './config';
import { walletProvider } from './walletProvider';

export class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: WEB3_CONFIG.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = this.getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get nonce from backend for wallet signature
   */
  async getNonce(walletAddress: string): Promise<string> {
    try {
      const response = await this.api.post('/auth/nonce', {
        walletAddress: walletAddress.toLowerCase(),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get nonce');
      }

      return response.data.data.nonce;
    } catch (error) {
      console.error('Error getting nonce:', error);
      throw new Error('Failed to get authentication nonce');
    }
  }

  /**
   * Verify wallet signature and authenticate user
   */
  async verifySignature(payload: AuthenticationPayload): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/verify', payload);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Authentication failed');
      }

      // Store token and wallet address
      this.storeAuthData(response.data.data.token, payload.walletAddress);

      return response.data;
    } catch (error) {
      console.error('Error verifying signature:', error);
      throw new Error('Failed to verify wallet signature');
    }
  }

  /**
   * Complete authentication flow
   */
  async authenticate(walletAddress: string): Promise<AuthResponse> {
    try {
      // 1. Get nonce from backend
      const nonce = await this.getNonce(walletAddress);

      // 2. Create message to sign
      const timestamp = Date.now();
      const message = this.createSignatureMessage(walletAddress, nonce, timestamp);

      // 3. Sign message with wallet (pass nonce for Petra verification)
      const signature = await walletProvider.signMessage(message, nonce);

      // 4. Send signature to backend for verification
      const authPayload: AuthenticationPayload = {
        walletAddress: walletAddress.toLowerCase(),
        signature,
        nonce,
        timestamp,
      };

      const response = await this.verifySignature(authPayload);
      return response;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: {
    walletAddress: string;
    name?: string;
    email?: string;
    role?: 'buyer' | 'seller';
  }): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/register', {
        ...userData,
        walletAddress: userData.walletAddress.toLowerCase(),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register user');
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await this.api.get<{ success: boolean; data: UserProfile }>('/auth/profile');

      if (!response.data.success) {
        throw new Error('Failed to get profile');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await this.api.patch<{ success: boolean; data: UserProfile }>('/auth/profile', updates);

      if (!response.data.success) {
        throw new Error('Failed to update profile');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear auth data from storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WEB3_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(WEB3_CONFIG.STORAGE_KEYS.WALLET_ADDRESS);
      localStorage.removeItem(WEB3_CONFIG.STORAGE_KEYS.NONCE);
    }

    // Disconnect wallet
    walletProvider.disconnect();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const address = this.getStoredAddress();
    return !!token && !!address;
  }

  /**
   * Get stored authentication token
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WEB3_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Get stored wallet address
   */
  private getStoredAddress(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WEB3_CONFIG.STORAGE_KEYS.WALLET_ADDRESS);
  }

  /**
   * Store authentication data
   */
  private storeAuthData(token: string, address: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(WEB3_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(WEB3_CONFIG.STORAGE_KEYS.WALLET_ADDRESS, address.toLowerCase());
  }

  /**
   * Create signature message
   */
  private createSignatureMessage(address: string, nonce: string, timestamp: number): string {
    return `Welcome to DATN Marketplace!

Sign this message to authenticate your wallet.

Wallet Address: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}

This request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  /**
   * Get API instance
   */
  getApiInstance(): AxiosInstance {
    return this.api;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
