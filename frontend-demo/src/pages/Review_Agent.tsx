// src/pages/Review_Agent.tsx
import React from "react";
import {
  ArrowLeft,
  Mail,
  FileText,
  Upload,
  Clock,
  CheckCircle,
  Languages,
  Pencil,
  MessageCircle,
  FileOutput,
  Bell,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../context/WizardContext";
import { buildN8nWorkflow } from "../utils/n8nWorkflowBuilder";

// Map IDs to display information
const triggerMap: Record<string, { icon: typeof Mail; title: string }> = {
  "gmail": { icon: Mail, title: "Gmail" },
  "outlook-email": { icon: Mail, title: "Outlook Email" },
  "moodle-assignment": { icon: FileText, title: "Moodle – Assignment Submitted" },
  "manual-upload": { icon: Upload, title: "Manual File Upload" },
  "scheduled-run": { icon: Clock, title: "Scheduled Run" },
};

const taskMap: Record<string, { icon: typeof CheckCircle; title: string }> = {
  "check-references": { icon: CheckCircle, title: "Check References" },
  "check-language": { icon: Languages, title: "Check Language" },
  "summarize": { icon: FileText, title: "Summarize Document" },
  "custom": { icon: Pencil, title: "Custom Instruction" },
};

const actionMap: Record<string, { icon: typeof MessageCircle; title: string }> = {
  "reply-gmail": { icon: Mail, title: "Reply via Gmail" },
  "reply-student": { icon: MessageCircle, title: "Reply via Outlook" },
  "generate-report": { icon: FileOutput, title: "Generate Report" },
  "notify-me": { icon: Bell, title: "Notify Me" },
  "save-result": { icon: Save, title: "Save Result" },
};

// Helper function to generate agent name
const generateAgentName = (trigger: string | null, tasks: string[]): string => {
  const triggerNames: Record<string, string> = {
    'gmail': 'Gmail',
    'outlook-email': 'Email',
    'moodle-assignment': 'Assignment',
    'manual-upload': 'Document',
    'scheduled-run': 'Scheduled'
  };
  
  const taskNames: Record<string, string> = {
    'check-references': 'Reference Checker',
    'check-language': 'Language Reviewer',
    'summarize': 'Summarizer',
    'custom': 'Custom Assistant'
  };

  const triggerName = trigger ? triggerNames[trigger] : 'Agent';
  const taskName = tasks.length > 0 ? taskNames[tasks[0]] : 'Assistant';
  
  return `${triggerName} ${taskName}`;
};

export default function ReviewAgent() {
  const navigate = useNavigate();
  const { 
    selectedTrigger, 
    selectedTasks, 
    selectedActions, 
    addAgent,
    resetWizard 
  } = useWizard();

  const trigger = selectedTrigger ? triggerMap[selectedTrigger] : null;

  const handleCreateAgent = () => {
    if (!selectedTrigger) {
      alert("No trigger selected");
      return;
    }

    // Generate workflow JSON
    const agentName = generateAgentName(selectedTrigger, selectedTasks);
    const workflow = buildN8nWorkflow(
      selectedTrigger as any,
      selectedTasks as any,
      selectedActions as any,
      agentName
    );

    console.log("Generated workflow:", workflow);

    // Download workflow as JSON file
    const blob = new Blob(
      [JSON.stringify(workflow, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agent_workflow.json";
    link.click();
    URL.revokeObjectURL(url);

    // Create new agent and add to dashboard
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: generateAgentName(selectedTrigger, selectedTasks),
      trigger: trigger?.title || 'Unknown',
      tasks: selectedTasks.map(taskId => taskMap[taskId]?.title || taskId),
      status: 'Active' as const,
      lastRun: 'Just created'
    };

    addAgent(newAgent);
    resetWizard();

    // Show success message and navigate to dashboard
    alert(`Agent "${newAgent.name}" created successfully!`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/after-analysis')}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div>
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
                Step 4 of 4
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-3">
              Review your agent
            </h1>
            <p className="text-muted-foreground">
              Confirm the settings below before creating your agent. You can always edit these later.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Trigger */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Trigger</h2>
          {trigger ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <trigger.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">{trigger.title}</span>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No trigger selected</p>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">AI Tasks</h2>
          {selectedTasks && selectedTasks.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {selectedTasks.map((taskId) => {
                const task = taskMap[taskId];
                if (!task) return null;
                const Icon = task.icon;
                return (
                  <div
                    key={taskId}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tasks selected</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          {selectedActions && selectedActions.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {selectedActions.map((actionId) => {
                const action = actionMap[actionId];
                if (!action) return null;
                const Icon = action.icon;
                return (
                  <div
                    key={actionId}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{action.title}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No actions selected</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <button
            onClick={() => navigate('/after-analysis')}
            className="px-6 py-3 font-medium bg-card border border-border rounded-lg hover:bg-muted/50"
          >
            Previous Step
          </button>
          <button
            onClick={handleCreateAgent}
            className="px-8 py-3 font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
          >
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}