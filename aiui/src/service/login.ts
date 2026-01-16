import axios from "axios";
import type { Credentials } from "../types"

const baseUrl = "/api/login"

const login = async (credentials: Credentials) => {
    console.log(baseUrl)
    const response = await axios.post(baseUrl, credentials);
    return response.data;
}

export default { login };
