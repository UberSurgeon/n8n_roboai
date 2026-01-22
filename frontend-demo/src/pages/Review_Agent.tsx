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

import { buildN8nWorkflow } from "../utils/n8nWorkflowBuilder";

interface WizardStep4Props {
  onBack: () => void;
  selectedTrigger: string | null;
  selectedTasks: string[];
  selectedActions: string[];
}

// Map IDs to display information
const triggerMap: Record<string, { icon: typeof Mail; title: string }> = {
  "outlook-email": { icon: Mail, title: "Outlook Email" },
  "moodle-assignment": { icon: FileText, title: "Moodle – Assignment Submitted" },
  "manual-upload": { icon: Upload, title: "Manual File Upload" },
  "scheduled-run": { icon: Clock, title: "Scheduled Run" },
};

const taskMap: Record<string, { icon: typeof CheckCircle; title: string }> = {
  "check-references": { icon: CheckCircle, title: "Check References" },
  "check-language": { icon: Languages, title: "Check Language" },
  summarize: { icon: FileText, title: "Summarize Document" },
  custom: { icon: Pencil, title: "Custom Instruction" },
};

const actionMap: Record<string, { icon: typeof MessageCircle; title: string }> = {
  "reply-student": { icon: MessageCircle, title: "Reply to Student" },
  "generate-report": { icon: FileOutput, title: "Generate Report" },
  "notify-me": { icon: Bell, title: "Notify Me" },
  "save-result": { icon: Save, title: "Save Result" },
};

export default function Review_Agent({
  onBack,
  selectedTrigger,
  selectedTasks = [],
  selectedActions = [],
}: WizardStep4Props) {
  const trigger = selectedTrigger ? triggerMap[selectedTrigger] : null;

  const handleCreateWorkflow = () => {
    if (!selectedTrigger) {
      alert("No trigger selected");
      return;
    }

    const workflowJSON = buildN8nWorkflow(
      selectedTrigger,
      selectedActions,
      "My AI Agent"
    );

    console.log("Generated workflow:", workflowJSON);

    const blob = new Blob(
      [JSON.stringify(workflowJSON, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agent_workflow.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={onBack}
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
              Confirm the settings below before creating your agent.
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
          {selectedTasks.length > 0 ? (
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
          {selectedActions.length > 0 ? (
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
            onClick={onBack}
            className="px-6 py-3 font-medium bg-card border border-border rounded-lg hover:bg-muted/50"
          >
            Previous Step
          </button>
          <button
            onClick={handleCreateWorkflow}
            className="px-8 py-3 font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm"
          >
            Create Agent
          </button>
        </div>
      </div>
    </div>
  );
}
