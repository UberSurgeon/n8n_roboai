import axios from "axios";
import type { N8nAuth } from "../../types";

const baseUrl = "/api/createapi"


const createapi = async (N8nAuth: N8nAuth) => {
    

    console.log(N8nAuth)
    console.log(baseUrl)
    const response = await axios.post(baseUrl, N8nAuth);

    // change this in future to only store id in state to be more sceure
    // console.log(response.data)
    
    return response.data;
}

export default { createapi };
