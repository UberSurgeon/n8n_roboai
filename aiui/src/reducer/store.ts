import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userReducer.ts';
import authReducer from './authReducer.ts';
import n8nApiKeyReducer from './apiKeyReducer.ts'

const store = configureStore({
    reducer: {
        user: userReducer,
        auth: authReducer,
        n8nApiKey: n8nApiKeyReducer
    }
})

export default store
