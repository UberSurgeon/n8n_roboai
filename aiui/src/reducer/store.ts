import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from 'react';

const store = configureStore({
    reducer: {
        user: userReducer,
    }
})

export default store
