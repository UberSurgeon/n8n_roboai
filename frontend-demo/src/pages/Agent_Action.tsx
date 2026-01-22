// src/pages/Agent_Action.tsx
import React, { useState } from "react";
import { CheckCircle, Languages, FileText, Pencil, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../context/WizardContext";

interface AITask {
  id: string;
  icon: typeof CheckCircle;
  title: string;
  description: string;
}

const aiTasks: AITask[] = [
  {
    id: 'check-references',
    icon: CheckCircle,
    title: 'Check References',
    description: 'Detect citation and formatting issues in academic documents'
  },
  {
    id: 'check-language',
    icon: Languages,
    title: 'Check Language',
    description: 'Review grammar, spelling, and clarity of writing'
  },
  {
    id: 'summarize',
    icon: FileText,
    title: 'Summarize Document',
    description: 'Create a short summary of the document for quick review'
  },
  {
    id: 'custom',
    icon: Pencil,
    title: 'Custom Instruction',
    description: 'Describe your own task in plain language'
  }
];

function TaskOption({ 
  task, 
  selected, 
  onClick 
}: { 
  task: AITask; 
  selected: boolean; 
  onClick: () => void;
}) {
  const Icon = task.icon;
  
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-lg border transition-all text-left ${
        selected
          ? 'border-blue-600 bg-blue-50 shadow-sm'
          : 'border-border bg-card hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
          selected ? 'bg-blue-100' : 'bg-muted'
        }`}>
          <Icon className={`w-6 h-6 ${
            selected ? 'text-blue-600' : 'text-foreground'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-foreground mb-1">
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {task.description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function AgentAction() {
  const navigate = useNavigate();
  const { selectedTasks, setTasks } = useWizard();
  const [search, setSearch] = useState("");

  const filteredTasks = aiTasks.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTask = (taskId: string) => {
    const newTasks = selectedTasks.includes(taskId)
      ? selectedTasks.filter(id => id !== taskId)
      : [...selectedTasks, taskId];
    setTasks(newTasks);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/trigger-page")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <span className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
            Step 2 of 4
          </span>

          <h1 className="text-3xl font-semibold text-foreground mb-3">
            What should the agent do with the document?
          </h1>
          <p className="text-muted-foreground mb-1">
            Select the type of review or task you'd like the AI to perform.
          </p>
          <p className="text-blue-600 font-medium">
            You can choose more than one task.
          </p>
        </div>
      </div>

      {/* Sticky search */}
      <div className="sticky top-0 z-10 bg-blue-500/90 backdrop-blur border-b border-blue-700">
        <div className="max-w-4xl mx-auto px-6 py-4 relative">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* Task list */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {filteredTasks.map((task) => (
          <TaskOption
            key={task.id}
            task={task}
            selected={selectedTasks.includes(task.id)}
            onClick={() => toggleTask(task.id)}
          />
        ))}

        {filteredTasks.length === 0 && (
          <p className="text-muted-foreground">No tasks found.</p>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-border flex justify-between">
        <button
          onClick={() => navigate("/trigger-page")}
          className="px-6 py-3 font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          Previous Step
        </button>

        <button
          disabled={selectedTasks.length === 0}
          onClick={() => navigate("/after-analysis")}
          className={`px-8 py-3 rounded-lg font-medium ${
            selectedTasks.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}