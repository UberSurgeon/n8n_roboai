// src/context/WizardContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Agent {
  id: string;
  name: string;
  trigger: string;
  tasks: string[];
  status: 'Active' | 'Inactive';
  lastRun?: string;
}

interface WizardState {
  // Wizard selections
  selectedTrigger: string | null;
  selectedTasks: string[];
  selectedActions: string[];
  
  // Saved agents
  agents: Agent[];
  
  // Methods to update wizard state
  setTrigger: (trigger: string) => void;
  setTasks: (tasks: string[]) => void;
  setActions: (actions: string[]) => void;
  
  // Methods to manage agents
  addAgent: (agent: Agent) => void;
  deleteAgent: (agentId: string) => void;
  
  // Reset wizard
  resetWizard: () => void;
}

const WizardContext = createContext<WizardState | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  
  // Initial agents
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Assignment Feedback Assistant',
      trigger: 'Moodle – Assignment Submitted',
      tasks: ['Check References', 'Check Language'],
      status: 'Active',
      lastRun: '2 hours ago'
    },
    {
      id: 'agent-2',
      name: 'Email Response Helper',
      trigger: 'Outlook Email',
      tasks: ['Summarize Document', 'Reply to Student'],
      status: 'Active',
      lastRun: '1 day ago'
    },
    {
      id: 'agent-3',
      name: 'Weekly Report Generator',
      trigger: 'Scheduled Run',
      tasks: ['Summarize Document', 'Generate Report', 'Notify Me'],
      status: 'Inactive',
      lastRun: '3 days ago'
    }
  ]);

  const addAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
  };

  const deleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
  };

  const resetWizard = () => {
    setSelectedTrigger(null);
    setSelectedTasks([]);
    setSelectedActions([]);
  };

  return (
    <WizardContext.Provider
      value={{
        selectedTrigger,
        selectedTasks,
        selectedActions,
        agents,
        setTrigger: setSelectedTrigger,
        setTasks: setSelectedTasks,
        setActions: setSelectedActions,
        addAgent,
        deleteAgent,
        resetWizard,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
};