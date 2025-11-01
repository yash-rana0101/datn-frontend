import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
    walletAddress: string | null;
    username: string | null;
    role: string | null;
    isAuthenticated: boolean;
}

const initialState: UserState = {
    walletAddress: null,
    username: null,
    role: null,
    isAuthenticated: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ walletAddress: string; username?: string; role?: string }>
        ) => {
            state.walletAddress = action.payload.walletAddress;
            state.username = action.payload.username || null;
            state.role = action.payload.role || null;
            state.isAuthenticated = true;
        },
        clearUser: (state) => {
            state.walletAddress = null;
            state.username = null;
            state.role = null;
            state.isAuthenticated = false;
        }
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
