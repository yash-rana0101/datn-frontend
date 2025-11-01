/**
 * @fileoverview Wallet Redux Slice
 * @description Redux slice for managing wallet connection state
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { WalletState, WalletProviderType, UserProfile } from '@/lib/web3/types';
import { walletProvider } from '@/lib/web3/walletProvider';
import { authService } from '@/lib/web3/authService';

// Extended wallet state with user profile
interface ExtendedWalletState extends WalletState {
  user: UserProfile | null;
  token: string | null;
}

const initialState: ExtendedWalletState = {
  address: null,
  balance: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  user: null,
  token: null,
};

/**
 * Async thunk for connecting wallet
 */
export const connectWallet = createAsyncThunk<
  { address: string; balance: string; chainId: number; user: UserProfile; token: string },
  WalletProviderType,
  { rejectValue: string }
>('wallet/connect', async (providerId, { rejectWithValue }) => {
  try {
    // 1. Connect to wallet provider
    const address = await walletProvider.connect(providerId);

    // 2. Get wallet balance
    const balance = await walletProvider.getBalance(address);

    // 3. Get chain ID
    const chainId = await walletProvider.getChainId();

    // 4. Authenticate with backend
    const authResponse = await authService.authenticate(address);

    return {
      address,
      balance,
      chainId: chainId || 0,
      user: authResponse.data.user,
      token: authResponse.data.token,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to connect wallet';
    return rejectWithValue(message);
  }
});

/**
 * Async thunk for disconnecting wallet
 */
export const disconnectWallet = createAsyncThunk('wallet/disconnect', async () => {
  walletProvider.disconnect();
  authService.logout();
});

/**
 * Async thunk for updating balance
 */
export const updateBalance = createAsyncThunk<
  string,
  void,
  { rejectValue: string; state: { wallet: ExtendedWalletState } }
>('wallet/updateBalance', async (_, { getState, rejectWithValue }) => {
  try {
    const { wallet } = getState();
    if (!wallet.address) {
      return rejectWithValue('No wallet connected');
    }

    const balance = await walletProvider.getBalance(wallet.address);
    return balance;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update balance';
    return rejectWithValue(message);
  }
});

/**
 * Async thunk for refreshing user profile
 */
export const refreshUserProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>('wallet/refreshProfile', async (_, { rejectWithValue }) => {
  try {
    const profile = await authService.getProfile();
    return profile;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to refresh profile';
    return rejectWithValue(message);
  }
});

/**
 * Wallet slice
 */
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    /**
     * Update wallet address
     */
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },

    /**
     * Update chain ID
     */
    setChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
    },

    /**
     * Update balance
     */
    setBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Set user profile
     */
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },

    /**
     * Update user profile
     */
    updateUser: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    /**
     * Clear wallet state
     */
    clearWallet: (state) => {
      state.address = null;
      state.balance = null;
      state.chainId = null;
      state.isConnected = false;
      state.error = null;
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    // Connect Wallet
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.balance = action.payload.balance;
        state.chainId = action.payload.chainId;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error = action.payload || 'Failed to connect wallet';
      });

    // Disconnect Wallet
    builder
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.address = null;
        state.balance = null;
        state.chainId = null;
        state.isConnected = false;
        state.error = null;
        state.user = null;
        state.token = null;
      });

    // Update Balance
    builder
      .addCase(updateBalance.fulfilled, (state, action) => {
        state.balance = action.payload;
      })
      .addCase(updateBalance.rejected, (state, action) => {
        state.error = action.payload || 'Failed to update balance';
      });

    // Refresh User Profile
    builder
      .addCase(refreshUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(refreshUserProfile.rejected, (state, action) => {
        state.error = action.payload || 'Failed to refresh profile';
      });
  },
});

export const {
  setAddress,
  setChainId,
  setBalance,
  clearError,
  setUser,
  updateUser,
  clearWallet,
} = walletSlice.actions;

export default walletSlice.reducer;
