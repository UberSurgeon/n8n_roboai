import { useState } from "react"
import { useSelector } from 'react-redux';
import store from '../reducer/store';
import workFlowservice from '../service/public/workflow'



const Workflowform = () => {
    const [workFlow, setNewWorkFlow] = useState("")

    const n8nApiKey = useSelector((store) => store.n8nApiKey);

    const onCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        console.log(workFlow)
        console.log(n8nApiKey)
        try {
            const data = await workFlowservice.createWorkFlows(n8nApiKey, workFlow);
            console.log(data);
        } catch (exception) {
            console.error("workflow error", exception);
        }
        
    }

    return (
        <>
            <div>
                <form onSubmit={onCreate}>
                    <input 
                    value={workFlow}
                    onChange={(e) => setNewWorkFlow(e.target.value)}
                    />
                    <button type='submit'>create workflow</button>
                </form>
            </div>
        </>
    )
}

export default Workflowform
