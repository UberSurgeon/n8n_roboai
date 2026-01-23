import { createSlice } from '@reduxjs/toolkit'

const n8nApiKeySlice = createSlice({
    name: 'n8nApiKey',
    initialState: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NGMwOTVhZi04ZTE3LTQwMWQtOGNiNi05ODhkMzE2NTk2N2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY4OTEwNDg0fQ.beC9bLwR3xKRuqQL3lpqgWzaQJF3afSMQmtVf6QJCSU"
    ,
    reducers: {
        setN8nApiKey(_state, action) {
            return action.payload;
        },
        clearN8nApiKey(_state, _action) {
            return {}
        }
    }
})

export const { setN8nApiKey, clearN8nApiKey } = n8nApiKeySlice.actions

export const initializeN8nApiKey = (n8nApiKey: string) => {
    return async dispatch => {
        dispatch(setN8nApiKey(n8nApiKey));
        console.log(n8nApiKey);
    }
}

export const deinitializeN8nApiKey = () => {
    return async dispatch => {
        dispatch(clearN8nApiKey())
    }
}

export default n8nApiKeySlice.reducer
