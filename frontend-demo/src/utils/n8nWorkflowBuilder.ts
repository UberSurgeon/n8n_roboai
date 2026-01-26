// src/utils/n8nWorkflowBuilder.ts

const AI_TASK_INSTRUCTIONS: Record<string, string> = {
  summarize: "Summarize the provided content clearly and concisely.",
  "check-language": "Check grammar, spelling, clarity, and tone. Point out any issues.",
  "check-references": "Identify and verify references, citations, and bibliography formatting.",
  custom: "Follow any custom instructions provided by the user."
};

type CompiledTask = {
  id: AiTask;
  instruction: string;
  outputKey: string;
};

type TriggerType =
  | "gmail"
  | "outlook-email"
  | "moodle-assignment"
  | "manual-upload"
  | "scheduled-run"
  | "custom-trigger";

type AiTask =
  | "summarize"
  | "check-language"
  | "check-references"
  | "custom";

const AI_TASK_DEFINITIONS: Record<AiTask, CompiledTask> = {
  summarize: {
    id: "summarize",
    instruction: "Summarize the content clearly and concisely.",
    outputKey: "summary"
  },
  "check-language": {
    id: "check-language",
    instruction: "Check grammar, spelling, clarity, and tone. List issues and suggestions.",
    outputKey: "languageIssues"
  },
  "check-references": {
    id: "check-references",
    instruction: "Identify references and assess their correctness and formatting.",
    outputKey: "references"
  },
  custom: {
    id: "custom",
    instruction: "Follow the custom instructions provided by the user.",
    outputKey: "customResult"
  }
};

type ActionType =
  | "reply-gmail"
  | "reply-student"
  | "notify-me"
  | "save-result"
  | "generate-report";

// Maps action nodes to the normalized key they require
const ACTION_CONDITIONS: Record<ActionType, string> = {
  "reply-gmail": "summary",
  "reply-student": "summary",
  "notify-me": "summary",
  "save-result": "summary",
  "generate-report": "raw"
};

function buildAIPrompt(tasks: AiTask[], triggerId: TriggerType): string {
  const compiledTasks = tasks.map(task => AI_TASK_DEFINITIONS[task]);

  let contentRef = "";
  switch (triggerId) {
    case "gmail":
      contentRef = "{{ $json.snippet }}";
      break;
    case "outlook-email":
      contentRef = "{{ $json.bodyPreview || $json.body }}";
      break;
    case "moodle-assignment":
      contentRef = "{{ $json.content }}";
      break;
    default:
      contentRef = "{{ $json.content }}";
  }

  const taskList = compiledTasks
    .map(t => `- (${t.outputKey}) ${t.instruction}`)
    .join("\n");

  const outputSchema = compiledTasks
    .map(t => `  "${t.outputKey}": string`)
    .join(",\n");

  return `Current time is: {{ $today }}.

You are an AI assistant helping with academic and professional tasks.

CONTENT:
${contentRef}

TASKS:
${taskList}

OUTPUT FORMAT (JSON ONLY):
{
${outputSchema}
}

Rules:
- Return ONLY valid JSON
- Do not include explanations outside JSON
- If a task cannot be completed, return an empty string for that key
`;
}

export function buildN8nWorkflow(
  triggerId: TriggerType,
  aiTasks: AiTask[],
  actions: ActionType[],
  workflowName = "AI Agent Workflow"
) {
  const nodes: any[] = [];
  const connections: Record<string, any> = {};

  /* ================ TRIGGER NODE ================ */
  const triggerNodeName = "When this happens";
  let triggerNode: any;

  switch (triggerId) {
    case "gmail":
      triggerNode = {
        parameters: { pollTimes: { item: [{ mode: "everyMinute" }] }, filters: {} },
        name: triggerNodeName,
        type: "n8n-nodes-base.gmailTrigger",
        typeVersion: 1.3,
        position: [250, 300],
        id: crypto.randomUUID(),
        credentials: { gmailOAuth2: { id: "{{GMAIL_CREDENTIAL_ID}}", name: "Gmail account" } }
      };
      break;

    case "outlook-email":
      triggerNode = {
        parameters: { pollTimes: { item: [{ mode: "everyMinute" }] }, filters: {} },
        name: triggerNodeName,
        type: "n8n-nodes-base.microsoftOutlookTrigger",
        typeVersion: 1,
        position: [250, 300],
        id: crypto.randomUUID(),
        credentials: { microsoftOutlookOAuth2Api: { id: "{{OUTLOOK_CREDENTIAL_ID}}", name: "Microsoft Outlook" } }
      };
      break;

    case "scheduled-run":
      triggerNode = {
        parameters: { rule: { interval: [{ field: "hours", hoursInterval: 1 }] } },
        name: triggerNodeName,
        type: "n8n-nodes-base.scheduleTrigger",
        typeVersion: 1.2,
        position: [250, 300],
        id: crypto.randomUUID()
      };
      break;

    default:
      triggerNode = {
        parameters: {},
        name: triggerNodeName,
        type: "n8n-nodes-base.manualTrigger",
        typeVersion: 1,
        position: [250, 300],
        id: crypto.randomUUID()
      };
  }

  nodes.push(triggerNode);

  /* ================ AI AGENT NODE ================ */
  const aiAgentName = "AI Agent";
  const aiAgentNode = {
    parameters: {
      promptType: "define",
      text: `=${buildAIPrompt(aiTasks, triggerId)}`,
      options: { systemMessage: "You are a helpful AI assistant for academic tasks." }
    },
    type: "@n8n/n8n-nodes-langchain.agent",
    typeVersion: 3.1,
    position: [470, 300],
    id: crypto.randomUUID(),
    name: aiAgentName
  };
  nodes.push(aiAgentNode);

  /* ================ CHAT MODEL (OpenAI) ================ */
  const chatModelName = "OpenAI Chat Model";
  const chatModelNode = {
    parameters: { model: "gpt-4o-mini", options: {} },
    type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
    typeVersion: 1,
    position: [470, 480],
    id: crypto.randomUUID(),
    name: chatModelName,
    credentials: { openAiApi: { id: "{{OPENAI_CREDENTIAL_ID}}", name: "OpenAI API" } }
  };
  nodes.push(chatModelNode);

  /* ================ MEMORY NODE ================ */
  const memoryName = "Window Buffer Memory";
  const memoryNode = {
    parameters: { sessionIdType: "customKey", sessionKey: "={{ $json.id || $json.threadId || $execution.id }}", contextWindowLength: 5 },
    type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
    typeVersion: 1.3,
    position: [580, 480],
    id: crypto.randomUUID(),
    name: memoryName
  };
  nodes.push(memoryNode);

  /* ================ NORMALIZATION NODE ================ */
  const normalizeNodeName = "Normalize AI Output";
  const normalizeNode = {
    parameters: {
      mode: "runOnceForAllItems",
      jsCode: `
return {
  json: {
    summary: $json.summary || "",
    languageIssues: $json.languageIssues || "",
    references: $json.references || "",
    customResult: $json.customResult || "",
    raw: $json
  }
};
`
    },
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position: [660, 300],
    id: crypto.randomUUID(),
    name: normalizeNodeName
  };
  nodes.push(normalizeNode);

  // === Connections: Trigger → AI Agent → Chat → Memory → Normalize ===
  connections[triggerNodeName] = { main: [[{ node: aiAgentName, type: "main", index: 0 }]] };
  connections[chatModelName] = { ai_languageModel: [[{ node: aiAgentName, type: "ai_languageModel", index: 0 }]] };
  connections[memoryName] = { ai_memory: [[{ node: aiAgentName, type: "ai_memory", index: 0 }]] };
  connections[aiAgentName] = { main: [[{ node: normalizeNodeName, type: "main", index: 0 }]] };

  /* ================ ACTION NODES + IF LOGIC ================ */
  let actionNodeNames: { ifNodeName: string; actionNodeName: string }[] = [];

  actions.forEach((action, index) => {
    const actionNodeName = `${action.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`;
    let actionNode: any;

    switch (action) {
      case "reply-gmail":
        actionNode = {
          parameters: {
            sendTo: "={{ $('When this happens').item.json.From }}",
            subject: "=Re: {{ $('When this happens').item.json.Subject }}",
            emailType: "text",
            message: "={{ $json.summary }}",
            options: {}
          },
          type: "n8n-nodes-base.gmail",
          typeVersion: 2.2,
          position: [1000, 300 + index * 120],
          id: crypto.randomUUID(),
          name: actionNodeName,
          webhookId: crypto.randomUUID(),
          credentials: { gmailOAuth2: { id: "{{GMAIL_CREDENTIAL_ID}}", name: "Gmail account" } }
        };
        break;

      case "reply-student":
        actionNode = {
          parameters: {
            resource: "message",
            operation: "send",
            message: {
              subject: "=Re: {{ $('When this happens').item.json.Subject }}",
              bodyContent: "={{ $json.summary }}",
              toRecipients: "={{ $('When this happens').item.json.from.emailAddress.address }}",
              bodyContentType: "text"
            }
          },
          type: "n8n-nodes-base.microsoftOutlook",
          typeVersion: 2.1,
          position: [1000, 300 + index * 120],
          id: crypto.randomUUID(),
          name: actionNodeName,
          credentials: { microsoftOutlookOAuth2Api: { id: "{{OUTLOOK_CREDENTIAL_ID}}", name: "Microsoft Outlook" } }
        };
        break;

      case "notify-me":
        actionNode = {
          parameters: {
            sendTo: "your-email@example.com",
            subject: "AI Agent Notification",
            emailType: "text",
            message: "={{ $json.summary || JSON.stringify($json.raw, null, 2) }}",
            options: {}
          },
          type: "n8n-nodes-base.gmail",
          typeVersion: 2.2,
          position: [1000, 300 + index * 120],
          id: crypto.randomUUID(),
          name: actionNodeName,
          webhookId: crypto.randomUUID(),
          credentials: { gmailOAuth2: { id: "{{GMAIL_CREDENTIAL_ID}}", name: "Gmail account" } }
        };
        break;

      case "save-result":
        actionNode = {
          parameters: {
            operation: "append",
            documentId: { __rl: true, value: "{{GOOGLE_SHEET_ID}}", mode: "id" },
            sheetName: { __rl: true, value: "Sheet1", mode: "name" },
            columns: {
              mappingMode: "defineBelow",
              value: {
                Timestamp: "={{ new Date().toISOString() }}",
                "AI Result": "={{ JSON.stringify($json.raw) }}",
                Source: "={{ $('When this happens').item.json.Subject || 'N/A' }}"
              }
            },
            options: {}
          },
          type: "n8n-nodes-base.googleSheets",
          typeVersion: 4.4,
          position: [1000, 300 + index * 120],
          id: crypto.randomUUID(),
          name: actionNodeName,
          credentials: { googleSheetsOAuth2Api: { id: "{{GOOGLE_SHEETS_CREDENTIAL_ID}}", name: "Google Sheets" } }
        };
        break;

      case "generate-report":
        actionNode = {
          parameters: {
            mode: "runOnceForAllItems",
            jsCode: `
const aiResult = $json;
const timestamp = new Date().toISOString();
return {
  json: {
    timestamp: timestamp,
    analysis: aiResult,
    triggerData: $('When this happens').item.json,
    status: 'completed'
  }
};`
          },
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [1000, 300 + index * 120],
          id: crypto.randomUUID(),
          name: actionNodeName
        };
        break;

      default:
        actionNode = {
          parameters: { mode: "runOnceForAllItems", jsCode: "return [{ json: $input.item.json }];" },
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [1000, 300 + index * 120],
          id: crypto.randomUUID(),
          name: actionNodeName
        };
    }

    // Add IF node before action
    const ifNodeName = `If ${actionNodeName}`;
    const ifNode = {
      parameters: { conditions: { string: [{ value1: `={{ $json.${ACTION_CONDITIONS[action]} }}`, operation: "notEmpty" }] } },
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [830, 300 + index * 120],
      id: crypto.randomUUID(),
      name: ifNodeName
    };

    nodes.push(ifNode);
    nodes.push(actionNode);
    actionNodeNames.push({ ifNodeName, actionNodeName });
  });

  // Normalize → IF nodes
  connections[normalizeNodeName] = {
    main: [actionNodeNames.map(({ ifNodeName }) => ({ node: ifNodeName, type: "main", index: 0 }))]
  };

  // IF → Action (TRUE branch)
  actionNodeNames.forEach(({ ifNodeName, actionNodeName }) => {
    connections[ifNodeName] = { main: [[{ node: actionNodeName, type: "main", index: 0 }]], false: [] };
  });

  /* ================ WORKFLOW METADATA ================ */
  return {
    name: workflowName,
    nodes,
    connections,
    active: false,
    settings: { executionOrder: "v1" },
    pinData: {},
    versionId: crypto.randomUUID(),
    meta: { instanceId: "n8n-instance" },
    tags: [{ createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), id: "1", name: "AI Agent" }]
  };
}
