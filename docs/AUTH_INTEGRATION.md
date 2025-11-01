# Authentication Integration Guide

## Overview

This application now uses a **wallet-based authentication system** integrated with your backend API. Authentication is handled via wallet signatures (no passwords), with user data and sessions managed through HTTP-only cookies.

## Architecture

### Frontend Stack
- **TanStack Query (React Query)**: API state management and caching
- **Redux Toolkit**: Global wallet and user state
- **Axios**: HTTP client with automatic token refresh
- **Cookie-based Auth**: Tokens stored in HTTP-only cookies (secure)

### Authentication Flow

```
1. User connects wallet (MetaMask, WalletConnect, etc.)
   ↓
2. Frontend creates signature message with nonce
   ↓
3. User signs message with wallet
   ↓
4. Backend verifies signature and checks if user exists
   ↓
5a. If user exists → Login successful (cookies set)
   ↓
5b. If user doesn't exist → Show registration form
   ↓
6. User completes registration form
   ↓
7. Backend creates user account
   ↓
8. User automatically logged in (cookies set)
```

## Key Features

### ✅ Implemented

1. **Wallet-Based Authentication**
   - No traditional login/signup forms
   - Signature-based authentication
   - Multiple wallet support (MetaMask, WalletConnect, etc.)

2. **User Persistence**
   - Automatic user data fetching on wallet connection
   - Redux state synchronization
   - Auth context for easy access

3. **Registration Flow**
   - Automatic registration form after first wallet connection
   - User details: Name, Email, Country, Role (Buyer/Seller)
   - Beautiful UI with glassmorphism design

4. **Protected Routes**
   - Public routes: Home, Products, Search
   - Protected routes: Orders, Profile, Checkout
   - Automatic redirect for unauthenticated users

5. **Token Management**
   - Access tokens (15 min expiry)
   - Refresh tokens (7 days expiry)
   - Automatic token refresh on 401 errors
   - HTTP-only cookies (no localStorage for tokens)

6. **API Integration**
   - Axios interceptors for auth headers
   - Automatic retry on token expiration
   - Error handling with toast notifications

## File Structure

```
client/
├── lib/
│   ├── api/
│   │   └── client.ts              # Axios instance with interceptors
│   ├── hooks/
│   │   ├── useAuthQuery.ts        # TanStack Query hooks
│   │   └── useWalletAuth.ts       # Enhanced wallet hook
│   ├── providers/
│   │   ├── QueryProvider.tsx      # React Query provider
│   │   └── AuthProvider.tsx       # Auth context provider
│   ├── services/
│   │   └── auth.ts                # Auth API service
│   └── types/
│       └── auth.types.ts          # TypeScript types
├── components/
│   ├── auth/
│   │   └── RegistrationForm.tsx   # User registration form
│   └── wallet/
│       ├── WalletButton.tsx       # Wallet connection button
│       └── WalletConnectModal.tsx # Wallet selection modal
└── redux/
    └── feature/
        ├── userSlice.ts           # User state
        └── walletSlice.ts         # Wallet state
```

## API Endpoints

### Authentication
- `POST /v1/auth/login` - Login with wallet signature
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout user

### User
- `GET /v1/user/me` - Get current user
- `PATCH /v1/user/me` - Update current user

## Usage Examples

### Using Auth in Components

```typescript
import { useAuth } from '@/lib/providers/AuthProvider';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please connect wallet</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

### Wallet Connection

```typescript
import { useWalletAuth } from '@/lib/hooks/useWalletAuth';

function ConnectButton() {
  const { connect, isConnecting } = useWalletAuth();

  const handleConnect = async () => {
    try {
      await connect('metamask');
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

### API Calls with TanStack Query

```typescript
import { useCurrentUser, useUpdateUser } from '@/lib/hooks/useAuthQuery';

function Profile() {
  const { data: user } = useCurrentUser();
  const updateUser = useUpdateUser();

  const handleUpdate = async () => {
    await updateUser.mutateAsync({
      name: 'New Name',
      country: 'USA',
    });
  };

  return (
    <div>
      <h1>{user?.name}</h1>
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
}
```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Backend Requirements

Your backend must:

1. **Set HTTP-only cookies** for tokens:
   ```typescript
   res.cookie('access_token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 15 * 60 * 1000, // 15 minutes
   });
   ```

2. **Handle CORS** with credentials:
   ```typescript
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true,
   }));
   ```

3. **Return user data** in responses:
   ```typescript
   // Login response
   {
     success: true,
     data: {
       accessToken: string,
       refreshToken: string,
     }
   }

   // User response
   {
     success: true,
     data: {
       id: string,
       email: string,
       name: string,
       wallet: string,
       country: string,
       role: 'BUYER' | 'SELLER',
     }
   }
   ```

## Security Features

1. **HTTP-only Cookies**: Tokens not accessible via JavaScript
2. **Automatic Token Refresh**: Seamless session management
3. **Signature Verification**: Backend verifies wallet ownership
4. **Nonce System**: Prevents replay attacks
5. **CORS Protection**: Only allowed origins can access API

## Next Steps

1. ✅ Auth integration complete
2. ✅ User persistence working
3. ✅ Registration form created
4. ✅ Protected routes configured
5. 🔄 Test wallet connection flow
6. 🔄 Test registration flow
7. 🔄 Test protected routes
8. 📝 Implement additional API endpoints (products, orders, etc.)

## Troubleshooting

### Cookie not being sent
- Check `withCredentials: true` in Axios config
- Verify CORS settings in backend
- Ensure same-origin or proper CORS setup

### Token refresh not working
- Check `/v1/auth/refresh` endpoint
- Verify refresh token in cookies
- Check interceptor implementation

### User data not loading
- Verify `/v1/user/me` endpoint requires auth
- Check JWT middleware on backend
- Ensure cookies are being sent with requests

## Support

For issues or questions, check:
- Backend API documentation: `api/docs/`
- Frontend types: `lib/types/auth.types.ts`
- Redux state: Chrome DevTools Redux extension
- React Query: React Query DevTools (auto-enabled)
