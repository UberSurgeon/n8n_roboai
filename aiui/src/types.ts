export interface Credentials {
  emailOrLdapLoginId: string;
  password: string;
};

export interface N8nAuth {
  raw_cookie: string;
};

export interface N8nWorkflow {
  name: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnections;
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
  shared?: SharedAccess[];
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  webhookId?: string;
  disabled?: boolean;
  notesInFlow?: boolean;
  notes?: string;
  executeOnce?: boolean;
  alwaysOutputData?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
  credentials?: {
    [credentialType: string]: {
      id: string;
      name: string;
    };
  };
}


//NodeName -> ConnectionType -> Array of Outputs -> Array of Targets

export interface WorkflowConnections {
  [nodeName: string]: {
    main: ConnectionTarget[][];
  };
}

export interface ConnectionTarget {
  node: string;
  type: string;
  index: number;
}

export interface WorkflowSettings {
  saveExecutionProgress?: boolean;
  saveManualExecutions?: boolean;
  saveDataErrorExecution?: 'all' | 'none' | 'error' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  executionTimeout?: number;
  errorWorkflow?: string;
  timezone?: string;
  executionOrder?: 'v1';
  callerPolicy?: 'workflowsFromSameOwner' | 'any' | 'none';
  callerIds?: string;
  timeSavedPerExecution?: number;
  availableInMCP?: boolean;
}

export interface SharedAccess {
  role: string;
  workflowId: string;
  projectId: string;
  project: {
    name: string;
  };
}
