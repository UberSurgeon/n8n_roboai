// src/utils/n8nWorkflowBuilder.ts

const AI_TASK_INSTRUCTIONS: Record<string, string> = {
  summarize: "Summarize the provided content clearly and concisely.",
  "check-language": "Check grammar, spelling, clarity, and tone. Point out any issues.",
  "check-references": "Identify and verify references, citations, and bibliography formatting.",
  custom: "Follow any custom instructions provided by the user."
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

type ActionType =
  | "reply-gmail"
  | "reply-student"
  | "notify-me"
  | "save-result"
  | "generate-report";

function buildAIPrompt(tasks: AiTask[], triggerId: TriggerType): string {
  const instructions = tasks
    .map(task => AI_TASK_INSTRUCTIONS[task])
    .filter(Boolean)
    .map(i => `- ${i}`)
    .join("\n");

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

  return `Current time is: {{ $today }}.

You are an AI assistant helping with academic and professional tasks.

Content to analyze: ${contentRef}

Tasks to perform:
${instructions}

Analyze the content and return your findings as clear, structured text.`;
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
        parameters: {
          pollTimes: { item: [{ mode: "everyMinute" }] },
          filters: {}
        },
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
        parameters: {
          pollTimes: { item: [{ mode: "everyMinute" }] },
          filters: {}
        },
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

  /* ================ CHAT MODEL NODE ================ */
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
    parameters: {
      sessionIdType: "customKey",
      sessionKey: "={{ $json.id || $json.threadId || $execution.id }}",
      contextWindowLength: 5
    },
    type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
    typeVersion: 1.3,
    position: [580, 480],
    id: crypto.randomUUID(),
    name: memoryName
  };
  nodes.push(memoryNode);

  // Connect trigger → AI Agent
  connections[triggerNodeName] = { main: [[{ node: aiAgentName, type: "main", index: 0 }]] };
  
  // Connect Chat Model & Memory to AI Agent
  connections[chatModelName] = { ai_languageModel: [[{ node: aiAgentName, type: "ai_languageModel", index: 0 }]] };
  connections[memoryName] = { ai_memory: [[{ node: aiAgentName, type: "ai_memory", index: 0 }]] };

  /* ================ FILTER NODE (CHECK IF OUTPUT EXISTS) ================ */
  const filterNodeName = "Check AI Output";
  const filterNode = {
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict"
        },
        conditions: [
          {
            id: crypto.randomUUID(),
            leftValue: "={{ $json.output }}",
            rightValue: "",
            operator: {
              type: "string",
              operation: "notEmpty"
            }
          }
        ],
        combinator: "and"
      },
      options: {}
    },
    type: "n8n-nodes-base.if",
    typeVersion: 2,
    position: [690, 300],
    id: crypto.randomUUID(),
    name: filterNodeName
  };
  nodes.push(filterNode);

  // Connect AI Agent → Filter
  connections[aiAgentName] = { main: [[{ node: filterNodeName, type: "main", index: 0 }]] };

  /* ================ ACTION NODES ================ */
  const ifOutputs: any[] = [];

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
            message: "={{ $json.output }}",
            options: {}
          },
          type: "n8n-nodes-base.gmail",
          typeVersion: 2.2,
          position: [890, 200 + (index * 150)],
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
              bodyContent: "={{ $json.output }}",
              toRecipients: "={{ $('When this happens').item.json.from.emailAddress.address }}",
              bodyContentType: "text"
            }
          },
          type: "n8n-nodes-base.microsoftOutlook",
          typeVersion: 2.1,
          position: [890, 200 + (index * 150)],
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
            message: "=AI Analysis Complete:\n\n{{ $json.output }}",
            options: {}
          },
          type: "n8n-nodes-base.gmail",
          typeVersion: 2.2,
          position: [890, 200 + (index * 150)],
          id: crypto.randomUUID(),
          name: actionNodeName,
          webhookId: crypto.randomUUID(),
          credentials: { gmailOAuth2: { id: "{{GMAIL_CREDENTIAL_ID}}", name: "Gmail account" } }
        };
        break;

      case "generate-report":
        actionNode = {
          parameters: {
            mode: "runOnceForAllItems",
            jsCode: `const aiResult = $json.output || $json.text || "";
const timestamp = new Date().toISOString();
const triggerData = $('When this happens').item.json;

return {
  json: {
    timestamp,
    analysis: aiResult,
    subject: triggerData.Subject || triggerData.subject || "N/A",
    from: triggerData.From || triggerData.from || "N/A",
    status: 'completed'
  }
};`
          },
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [890, 200 + (index * 150)],
          id: crypto.randomUUID(),
          name: actionNodeName
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
                "AI Result": "={{ $json.output }}",
                Subject: "={{ $('When this happens').item.json.Subject || $('When this happens').item.json.subject || 'N/A' }}",
                From: "={{ $('When this happens').item.json.From || $('When this happens').item.json.from || 'N/A' }}"
              }
            },
            options: {}
          },
          type: "n8n-nodes-base.googleSheets",
          typeVersion: 4.4,
          position: [890, 200 + (index * 150)],
          id: crypto.randomUUID(),
          name: actionNodeName,
          credentials: { googleSheetsOAuth2Api: { id: "{{GOOGLE_SHEETS_CREDENTIAL_ID}}", name: "Google Sheets" } }
        };
        break;

      default:
        actionNode = {
          parameters: { mode: "runOnceForAllItems", jsCode: `return [{ json: $input.item.json }];` },
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [890, 200 + (index * 150)],
          id: crypto.randomUUID(),
          name: actionNodeName
        };
    }

    nodes.push(actionNode);
    ifOutputs.push({ node: actionNodeName, type: "main", index: 0 });
  });

  // Connect Filter → All Actions (only when condition is TRUE)
  connections[filterNodeName] = {
    main: [
      ifOutputs,  // TRUE branch - goes to all actions
      []          // FALSE branch - empty (stops execution)
    ]
  };

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
    tags: [
      {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: "1",
        name: "AI Agent"
      }
    ]
  };
}