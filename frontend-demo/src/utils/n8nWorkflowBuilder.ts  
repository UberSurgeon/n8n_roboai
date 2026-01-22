// src/utils/n8nWorkflowBuilder.ts
import { v4 as uuidv4 } from "uuid";

/**
 * Build an n8n workflow JSON based on selected trigger and actions.
 * @param triggerId - the selected trigger id
 * @param actionsIds - array of selected action ids
 * @param workflowName - optional workflow name
 * @returns n8n workflow JSON object
 */
export function buildN8nWorkflow(
  triggerId: string,
  actionsIds: string[],
  workflowName: string = "My AI Agent Workflow"
) {
  // Generate unique IDs for nodes
  const triggerNodeId = uuidv4();
  const nodes = [
    {
      id: triggerNodeId,
      name: `Trigger: ${triggerId}`,
      type: "n8n-nodes-base.manualTrigger", // default to manual trigger
      typeVersion: 2,
      position: [0, 0],
      parameters: {},
      webhookId: uuidv4()
    }
  ];

  const connections: Record<string, any> = {};
  connections[`Trigger: ${triggerId}`] = { main: [] };

  // Add action nodes
  actionsIds.forEach((actionId, index) => {
    const actionNodeId = uuidv4();
    nodes.push({
      id: actionNodeId,
      name: `Action: ${actionId}`,
      type: "n8n-nodes-base.function", // generic node type; can be changed per action
      typeVersion: 2,
      position: [300, index * 100],
      parameters: {
        action: actionId,
      },
    });

    // Connect trigger to this action
    connections[`Trigger: ${triggerId}`].main.push([
      { node: `Action: ${actionId}`, type: "main", index: 0 }
    ]);
  });

  return {
    name: workflowName,
    nodes,
    connections,
    active: false,
    settings: {},
    pinData: {},
    versionId: uuidv4(),
    tags: []
  };
}
