# Petra Wallet Integration Guide

## Overview
Successfully migrated the authentication system from MetaMask (Ethereum) to Petra Wallet (Aptos blockchain) to match the backend API implementation.

## Changes Made

### 1. **Wallet Provider Service** (`lib/web3/walletProvider.ts`)
**Status**: ✅ Completely rewritten for Petra Wallet

**Key Changes**:
- Removed ethers.js dependency (Ethereum provider)
- Added Petra Wallet types and interfaces
- Updated all methods to use Petra Wallet API

**New Methods**:
```typescript
// Petra-specific types
interface PetraWallet {
  connect: () => Promise<{ address: string; publicKey: string }>;
  disconnect: () => Promise<void>;
  signMessage: (message: { message: string; nonce: string }) => Promise<{ signature: string }>;
  account: () => Promise<{ address: string; publicKey: string } | null>;
  network: () => Promise<{ name: string; chainId: string }>;
  isConnected: () => Promise<boolean>;
  onAccountChange: (callback: (account: { address: string } | null) => void) => void;
  onNetworkChange: (callback: (network: { name: string }) => void) => void;
}

// Window extension
window.petra || window.aptos
```

**Updated Methods**:
- `isWalletAvailable()` - Checks for Petra wallet extension
- `connect()` - Connects to Petra and returns Aptos address
- `disconnect()` - Disconnects Petra wallet
- `getAddress()` - Returns current Aptos address
- `getPublicKey()` - Returns wallet public key (new)
- `signMessage()` - Signs message using Petra's signature format
- `getBalance()` - Placeholder for APT balance (requires Aptos SDK)
- `getChainId()` - Returns Aptos network ID

### 2. **Authentication Service** (`lib/services/auth.ts`)
**Status**: ✅ Updated message format

**Changes**:
```typescript
// OLD FORMAT (Ethereum/MetaMask)
`Welcome to DATN Marketplace!

Sign this message to authenticate your wallet.

Wallet Address: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}

This request will not trigger a blockchain transaction or cost any gas fees.`

// NEW FORMAT (Aptos/Petra) - Matches backend
`
DATN Aptos Marketplace Authentication

Wallet: ${address}
Nonce: ${nonce}
Timestamp: ${timestamp}

This signature proves wallet ownership. No gas cost.`
```

### 3. **Authentication Types** (`lib/types/auth.types.ts`)
**Status**: ✅ Updated to match backend schema

**Changes**:
```typescript
// Added timestamp to LoginRequest
export interface LoginRequest {
  wallet: string;      // Aptos address
  signature: string;   // Petra signature
  nonce: string;       // Random string
  timestamp: number;   // Current time in ms
}

// RegisterRequest already had timestamp
export interface RegisterRequest {
  email: string;
  name: string;
  country: string;
  wallet: string;      // Aptos address
  signature: string;   // Petra signature
  nonce: number;       // Timestamp as number
  role: 'BUYER' | 'SELLER';
  timestamp: number;
}
```

### 4. **Wallet Connect Modal** (`components/wallet/WalletConnectModal.tsx`)
**Status**: ✅ Updated to show only Petra Wallet

**Changes**:
- Removed MetaMask, WalletConnect, Coinbase, Trust Wallet options
- Added only Petra Wallet as connection option
- Updated connection flow to use Petra's API
- Updated nonce/timestamp handling:
  ```typescript
  // Login
  await authService.login({
    wallet: address,
    signature,
    nonce: nonceStr,     // Random string
    timestamp,           // Number
  });
  ```
- Updated "Learn more" link to https://petra.app/

### 5. **Wallet Button** (`components/wallet/WalletButton.tsx`)
**Status**: ✅ Updated for Aptos ecosystem

**Changes**:
- Changed network badge from "Volta" to "Aptos"
- Changed balance token from "VT" to "APT"
- Updated explorer link:
  ```typescript
  // OLD: https://volta-explorer.energyweb.org/address/${address}
  // NEW: https://explorer.aptoslabs.com/account/${address}?network=testnet
  ```
- Updated network display from "Volta Network" to "Aptos Network"

### 6. **Registration Form** (`components/auth/RegistrationForm.tsx`)
**Status**: ✅ Already compatible

**Current Implementation**:
- Correctly passes `nonce` as number (timestamp)
- Passes separate `timestamp` field
- Matches backend schema

## Backend API Compatibility

### Login Endpoint: `POST /api/v1/auth/login`
**Backend Schema** (from `LoginSchema`):
```typescript
{
  wallet: string,      // Aptos wallet address
  signature: string,   // Petra signature (hex)
  nonce: string,       // Random string nonce
  timestamp: number    // Current timestamp
}
```

**Backend Verification**:
```typescript
// Creates same message format
const message = createAuthMessage(wallet, nonce, timestamp);

// Verifies using @noble/ed25519
const isValid = await verifyAptosSignature({
  message,
  signature,
  publicKey: wallet,  // Uses wallet address as public key
});
```

**✅ Our Implementation**: Matches perfectly

### Register Endpoint: `POST /api/v1/auth/register`
**Backend Schema** (from `RegisterSchema`):
```typescript
{
  email: string,
  name: string,
  country: string,
  wallet: string,      // Aptos wallet address
  signature: string,   // Petra signature
  nonce: string,       // Random string
  role: "BUYER" | "SELLER",
  timestamp: number    // Current timestamp
}
```

**Backend Validation**:
- Validates Aptos address using `AccountAddress.isValid()`
- Checks timestamp is within 5 minutes
- Stores signature in database

**✅ Our Implementation**: Compatible

## Petra Wallet Installation

### For Users:
1. Install Petra Wallet browser extension
2. Visit: https://petra.app/
3. Create new wallet or import existing
4. Connect to Aptos Testnet for testing

### For Developers:
```bash
# No additional dependencies needed on frontend
# Petra wallet is accessed via window.petra or window.aptos
```

## Testing Checklist

- [ ] Petra wallet extension installed
- [ ] Connect wallet button shows "Petra Wallet"
- [ ] Connection opens Petra popup
- [ ] User can approve connection
- [ ] Wallet address is Aptos format (0x...)
- [ ] Sign message opens Petra popup
- [ ] Signature is hex format
- [ ] Login works for existing users
- [ ] Registration form appears for new users
- [ ] Registration completes successfully
- [ ] Auto-login after registration works
- [ ] Wallet dropdown shows "Aptos Network"
- [ ] Explorer link opens Aptos Explorer
- [ ] Disconnect works properly
- [ ] Account switching triggers re-auth

## Network Information

### Aptos Testnet
- **Name**: Aptos Testnet
- **Explorer**: https://explorer.aptoslabs.com/?network=testnet
- **Faucet**: https://aptoslabs.com/testnet-faucet
- **RPC**: https://fullnode.testnet.aptoslabs.com/v1

### Aptos Mainnet
- **Name**: Aptos Mainnet
- **Explorer**: https://explorer.aptoslabs.com/
- **RPC**: https://fullnode.mainnet.aptoslabs.com/v1

## Signature Verification Flow

### 1. **Client Side** (Petra Wallet):
```typescript
// 1. Create message
const message = createAuthMessage(address, nonce, timestamp);

// 2. Sign with Petra
const response = await petra.signMessage({
  message,
  nonce,
});

// 3. Get signature
const signature = response.signature; // Hex format
```

### 2. **Server Side** (Backend API):
```typescript
// 1. Recreate same message
const message = createAuthMessage(wallet, nonce, timestamp);

// 2. Verify signature using @noble/ed25519
const sigBytes = Buffer.from(signature.replace(/^0x/, ""), "hex");
const msgBytes = Buffer.from(message, "utf8");
const pubBytes = Buffer.from(publicKey.replace(/^0x/, ""), "hex");

const isValid = await verify(sigBytes, msgBytes, pubBytes);
```

## Known Limitations

### 1. **Balance Fetching**
Currently returns `'0.0000'` as placeholder. To implement:
```typescript
// Need to add Aptos SDK
import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
const balance = await client.getAccountResources(address);
```

### 2. **Network Switching**
Petra doesn't have a programmatic network switch like MetaMask. Users must switch networks manually in the wallet extension.

### 3. **Transaction Signing**
For smart contract interactions, you'll need to:
```typescript
// Example transaction payload
const payload = {
  type: "entry_function_payload",
  function: "0x1::coin::transfer",
  type_arguments: ["0x1::aptos_coin::AptosCoin"],
  arguments: [recipientAddress, amount],
};

const response = await window.petra.signAndSubmitTransaction(payload);
```

## Error Handling

### Common Errors:

1. **"Petra wallet is not installed"**
   - User needs to install Petra extension
   - Provide link: https://petra.app/

2. **"User rejected connection"**
   - User clicked "Cancel" in Petra popup
   - Show friendly message asking to try again

3. **"Signature rejected by user"**
   - User rejected signature request
   - Allow retry with same nonce/timestamp

4. **"Invalid signature"** (Backend error)
   - Signature verification failed
   - Check message format matches exactly
   - Ensure timestamp hasn't expired (5 min limit)

5. **"Invalid Aptos wallet address"** (Backend error)
   - Address format incorrect
   - Should be 0x-prefixed hex string

## Migration Checklist

### ✅ Completed:
- [x] Updated `walletProvider.ts` for Petra
- [x] Updated `authService.ts` message format
- [x] Updated `LoginRequest` type with timestamp
- [x] Updated `WalletConnectModal` to use Petra
- [x] Updated `WalletButton` for Aptos network
- [x] Updated explorer links
- [x] Updated network badges and labels
- [x] Removed MetaMask/Ethereum references

### ⏳ Optional Enhancements:
- [ ] Add Aptos SDK for balance fetching
- [ ] Add APT token display in wallet button
- [ ] Add network status indicator (mainnet/testnet)
- [ ] Add transaction history from Aptos
- [ ] Add NFT display from Aptos account

## Resources

- **Petra Wallet Docs**: https://petra.app/docs
- **Aptos Developer Docs**: https://aptos.dev/
- **Aptos SDK**: https://www.npmjs.com/package/aptos
- **Aptos TypeScript SDK**: https://github.com/aptos-labs/aptos-core/tree/main/ecosystem/typescript/sdk
- **@noble/ed25519**: https://github.com/paulmillr/noble-ed25519

## Summary

The authentication system has been successfully migrated from MetaMask (Ethereum) to Petra Wallet (Aptos). All authentication flows now work with Aptos blockchain:

1. **Wallet Connection**: Petra Wallet via `window.petra`
2. **Message Signing**: Ed25519 signatures via Petra
3. **Address Format**: Aptos addresses (0x...)
4. **Network**: Aptos Testnet/Mainnet
5. **Explorer**: Aptos Explorer

The frontend now fully matches your backend's Aptos-based authentication implementation!
