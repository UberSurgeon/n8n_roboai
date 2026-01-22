// src/pages/Dashboard.tsx
import React from 'react';
import { Plus, Bot, FileText, Mail, Clock, Upload, Share2, Trash2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useWizard } from '../context/WizardContext';

const triggerIcons: Record<string, typeof Mail> = {
  'Outlook Email': Mail,
  'Moodle – Assignment Submitted': FileText,
  'Manual File Upload': Upload,
  'Scheduled Run': Clock
};

function AgentCard({ 
  agent, 
  onShare, 
  onDelete 
}: { 
  agent: any; 
  onShare: () => void; 
  onDelete: () => void;
}) {
  const TriggerIcon = triggerIcons[agent.trigger] || FileText;
  const taskText = agent.tasks.length > 2 
    ? `${agent.tasks.slice(0, 2).join(', ')}, +${agent.tasks.length - 2} more`
    : agent.tasks.join(', ');

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-foreground mb-2">{agent.name}</h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <TriggerIcon className="w-4 h-4 flex-shrink-0" />
              <span>{agent.trigger}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {taskText}
            </p>
            
            {agent.lastRun && (
              <p className="text-xs text-muted-foreground">
                Last run: {agent.lastRun}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              agent.status === 'Active'
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {agent.status}
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShare();
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              title="Share agent"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"
              title="Delete agent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { agents, deleteAgent, resetWizard } = useWizard();

  const handleShare = (agent: any) => { 
    alert(`Share ${agent.name}`); 
  };
  
  const handleDelete = (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      deleteAgent(agentId);
    }
  };

  const handleCreateNew = () => {
    resetWizard(); // Clear previous wizard selections
    navigate("/trigger-page");
  };
 
  const handleLogout = () => { 
    navigate("/login"); 
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">My AI Agents</h1>
            <p className="text-muted-foreground">Create and manage your automated teaching assistants</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create New Agent
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onShare={() => handleShare(agent)}
              onDelete={() => handleDelete(agent.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}