import { buildN8nWorkflow } from "../utils/n8nWorkflowBuilder";

// On click of "Create"
const handleCreateWorkflow = () => {
  const workflowJSON = buildN8nWorkflow(selectedTrigger, selectedActions, "My AI Agent");
  console.log(workflowJSON);

  // If you want to download as file:
  const blob = new Blob([JSON.stringify(workflowJSON, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "agent_workflow.json";
  link.click();
  URL.revokeObjectURL(url);
};
