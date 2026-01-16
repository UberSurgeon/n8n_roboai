import { useState } from "react";

const Workflowform = () => {
    const [workFlow, setNewWorkFlow] = useState("")

    const onCreate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        console.log(workFlow)
    }

    return (
        <>
            <div>
                <form onSubmit={onCreate}>
                    <input 
                    value={workFlow}
                    onChange={(e) => setNewWorkFlow(e.target.value)}
                    />
                    <button type='submit'>create</button>
                </form>
            </div>
        </>
    )
}

export default Workflowform
