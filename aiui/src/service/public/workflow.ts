import axios from "axios";
import type { N8nWorkflow } from "../../types";
const baseUrl = "/api/workflows"



const createWorkFlows = async (n8nApikey: string, n8nWorkflow: N8nWorkflow) => {
    console.log(n8nWorkflow);
    console.log(baseUrl);
    const payload = {
        "n8nApiKey" : n8nApikey,
        "n8nWorkflow": n8nWorkflow
    };

    console.log(payload);
    const response = await axios.post(baseUrl, payload);

    return response.data;
}

export default { createWorkFlows };
