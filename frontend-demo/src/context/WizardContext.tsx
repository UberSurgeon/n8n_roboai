// src/context/WizardContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

interface WizardState {
  selectedTrigger: string | null;
  selectedTasks: string[];
  selectedActions: string[];
  setTrigger: (trigger: string) => void;
  setTasks: (tasks: string[]) => void;
  setActions: (actions: string[]) => void;
}

const WizardContext = createContext<WizardState | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  return (
    <WizardContext.Provider
      value={{
        selectedTrigger,
        selectedTasks,
        selectedActions,
        setTrigger: setSelectedTrigger,
        setTasks: setSelectedTasks,
        setActions: setSelectedActions,
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
