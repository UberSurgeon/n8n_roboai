import axios from "axios";
import type { Credentials } from "../types"
import { useDispatch } from 'react-redux'
import { initializeAuth } from "../reducer/authReducer";
const baseUrl = "/api/login"


export const useLogin = () => {
    const dispatch = useDispatch();

    const login = async (credentials: Credentials) => {
        try{
            console.log(baseUrl)
            const response = await axios.post(baseUrl, credentials);
            dispatch(initializeAuth(response.data));
            return response.data;
            
        } catch (exception) {
            console.error("login fail", exception);
        }        
    }
    return login;
}
