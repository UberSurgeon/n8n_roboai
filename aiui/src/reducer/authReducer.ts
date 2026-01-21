import { createSlice } from '@reduxjs/toolkit'
import type { N8nAuth } from '../types';

const authSlice = createSlice({
    name: 'auth',
    initialState: {},
    reducers: {
        setAuth(_state, action) {
            return action.payload;
        },
        clearAuth(_state, _action) {
            return {}
        }
    }
})

export const { setAuth, clearAuth } = authSlice.actions

export const initializeAuth = (n8nAuth: N8nAuth) => {
    return async dispatch => {
        dispatch(setAuth(n8nAuth));
        console.log(n8nAuth);
    }
}

export const deinitializeAuth = () => {
    return async dispatch => {
        dispatch(clearAuth())
    }
}

export default authSlice.reducer
