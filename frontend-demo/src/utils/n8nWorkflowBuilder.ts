// src/utils/n8nWorkflowBuilder.ts
import { v4 as uuidv4 } from "uuid";

type TriggerType =
  | "outlook-email"
  | "manual-upload"
  | "scheduled-run"
  | "custom-trigger";

type AiTask =
  | "summarize"
  | "check-language"
  | "custom";

type ActionType =
  | "reply-student"
  | "notify-me"
  | "save"
  | "generate-report";

export function buildN8nWorkflow(
  triggerId: TriggerType,
  aiTasks: AiTask[],
  actions: ActionType[],
  workflowName = "AI Agent Workflow"
) {
  const nodes: any[] = [];
  const connections: Record<string, any> = {};

  /* ---------------- TRIGGER ---------------- */
  const triggerNodeId = uuidv4();
  let triggerNode: any;

  switch (triggerId) {
    case "outlook-email":
      triggerNode = {
        id: triggerNodeId,
        name: "Trigger: Outlook Email",
        type: "n8n-nodes-base.microsoftOutlookTrigger",
        typeVersion: 1,
        position: [0, 0],
        parameters: {
          resource: "message",
          operation: "watch",
        },
      };
      break;

    case "scheduled-run":
      triggerNode = {
        id: triggerNodeId,
        name: "Trigger: Schedule",
        type: "n8n-nodes-base.cron",
        typeVersion: 1,
        position: [0, 0],
        parameters: {
          triggerTimes: [{ mode: "everyDay" }],
        },
      };
      break;

    case "custom-trigger":
      triggerNode = {
        id: triggerNodeId,
        name: "Trigger: Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [0, 0],
        parameters: {
          path: "ai-agent",
          httpMethod: "POST",
        },
      };
      break;

    default:
      triggerNode = {
        id: triggerNodeId,
        name: "Trigger: Manual",
        type: "n8n-nodes-base.manualTrigger",
        typeVersion: 1,
        position: [0, 0],
        parameters: {},
      };
  }

  nodes.push(triggerNode);
  connections[triggerNode.name] = { main: [[]] };

  let lastNodeName = triggerNode.name;
  let xPos = 300;

  /* ---------------- AI TASKS ---------------- */
  aiTasks.forEach((task, index) => {
    const id = uuidv4();

    const instructionMap: Record<AiTask, string> = {
      summarize: "Summarize the input text clearly and concisely.",
      "check-language": "Detect the language of the input text.",
      custom: "Follow the custom instructions provided by the user.",
    };

    const node = {
      id,
      name: `AI: ${task}`,
      type: "n8n-nodes-base.function", // replace with OpenAI node later
      typeVersion: 1,
      position: [xPos, index * 120],
      parameters: {
        prompt: instructionMap[task],
      },
    };

    nodes.push(node);

    connections[lastNodeName] = {
      main: [[{ node: node.name, type: "main", index: 0 }]],
    };

    lastNodeName = node.name;
    xPos += 300;
  });

  /* ---------------- ACTIONS ---------------- */
  actions.forEach((action, index) => {
    const id = uuidv4();

    let node: any;

    switch (action) {
      case "reply-student":
        node = {
          id,
          name: "Action: Reply Email",
          type: "n8n-nodes-base.microsoftOutlook",
          typeVersion: 1,
          position: [xPos, index * 120],
          parameters: {
            resource: "message",
            operation: "send",
            subject: "Automated Response",
            text: "{{$json}}",
          },
        };
        break;

      case "notify-me":
        node = {
          id,
          name: "Action: Notify Me",
          type: "n8n-nodes-base.microsoftOutlook",
          typeVersion: 1,
          position: [xPos, index * 120],
          parameters: {
            resource: "message",
            operation: "send",
            subject: "AI Agent Notification",
            text: "{{$json}}",
          },
        };
        break;

      default:
        node = {
          id,
          name: `Action: ${action}`,
          type: "n8n-nodes-base.function",
          typeVersion: 1,
          position: [xPos, index * 120],
          parameters: {},
        };
    }

    nodes.push(node);

    connections[lastNodeName] = {
      main: [[{ node: node.name, type: "main", index: 0 }]],
    };

    lastNodeName = node.name;
  });

  return {
    name: workflowName,
    nodes,
    connections,
    active: false,
    settings: {},
    pinData: {},
    versionId: uuidv4(),
    tags: [],
  };
}
