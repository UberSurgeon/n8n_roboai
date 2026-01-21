import React, { useState } from 'react';
import { Mail, FileText, Upload, Clock, ArrowLeft, Webhook, Calendar, Zap } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface WizardStep1Props {
  onBack: () => void;
  onNext: (trigger: string) => void;
  initialTrigger?: string | null;
}

interface Trigger {
  id: string;
  icon: typeof Mail;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const triggers: Trigger[] = [
  {
    id: 'outlook-email',
    icon: Mail,
    title: 'Outlook Email',
    description: 'Runs when a new email arrives in your inbox'
  },
  {
    id: 'moodle-assignment',
    icon: FileText,
    title: 'Moodle – Assignment Submitted',
    description: 'Runs when a student submits an assignment in Moodle'
  },
  {
    id: 'manual-upload',
    icon: Upload,
    title: 'Manual File Upload',
    description: 'Runs when you upload a document'
  },
  {
    id: 'scheduled-run',
    icon: Clock,
    title: 'Scheduled Run',
    description: 'Runs automatically at a chosen time (daily, weekly, or monthly)'
  },
  {
    id: 'teams-message',
    icon: Zap,
    title: 'Teams Message',
    description: 'Runs when a message is posted in a Teams channel',
    comingSoon: true
  },
  {
    id: 'calendar-event',
    icon: Calendar,
    title: 'Calendar Event',
    description: 'Runs when a calendar event is created or updated',
    comingSoon: true
  },
  {
    id: 'custom-trigger',
    icon: Webhook,
    title: 'Custom Trigger',
    description: 'Connect your own system or service to trigger this agent',
    comingSoon: true
  }
];

function TriggerOption({ 
  trigger, 
  selected, 
  onClick 
}: { 
  trigger: Trigger; 
  selected: boolean; 
  onClick: () => void;
}) {
  const Icon = trigger.icon;
  
  return (
    <button
      onClick={onClick}
      disabled={trigger.comingSoon}
      className={`w-full p-6 rounded-lg border transition-all text-left ${
        trigger.comingSoon
          ? 'border-border bg-muted/30 cursor-not-allowed opacity-60'
          : selected
          ? 'border-blue-600 bg-blue-50 shadow-sm'
          : 'border-border bg-card hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
          trigger.comingSoon
            ? 'bg-muted'
            : selected 
            ? 'bg-blue-100' 
            : 'bg-muted'
        }`}>
          <Icon className={`w-6 h-6 ${
            trigger.comingSoon
              ? 'text-muted-foreground'
              : selected 
              ? 'text-blue-600' 
              : 'text-foreground'
          }`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-lg font-medium ${
              trigger.comingSoon ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {trigger.title}
            </h3>
            {trigger.comingSoon && (
              <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
                Coming Soon
              </span>
            )}
          </div>
          <p className={`text-sm ${
            trigger.comingSoon ? 'text-muted-foreground' : 'text-muted-foreground'
          }`}>
            {trigger.description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function WizardStep1({ onBack, onNext, initialTrigger }: WizardStep1Props) {
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(initialTrigger || null);
  const [search, setSearch] = useState<string>(""); // <-- search state

  const handleTriggerClick = (triggerId: string, comingSoon?: boolean) => {
    if (!comingSoon) {
      setSelectedTrigger(triggerId);
    }
  };

  // Filter triggers based on search input
  const filteredTriggers = triggers.filter((trigger) =>
    trigger.title.toLowerCase().includes(search.toLowerCase())
  );

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
            Back to Dashboard
          </button>
          
          <div>
            <div className="mb-3">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
                Step 1 of 4
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-foreground mb-3">
              How should the agent start?
            </h1>
            <p className="text-muted-foreground">
              Choose what will trigger your AI agent to run. You can change this later.
            </p>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <input
          type="text"
          placeholder="Search triggers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4 mb-8">
        {filteredTriggers.map((trigger) => (
          <TriggerOption
            key={trigger.id}
            trigger={trigger}
            selected={selectedTrigger === trigger.id}
            onClick={() => handleTriggerClick(trigger.id, trigger.comingSoon)}
          />
        ))}

        {filteredTriggers.length === 0 && (
          <p className="text-muted-foreground">No triggers found.</p>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-8 flex justify-end border-t border-border">
        <button
          onClick={() => selectedTrigger && onNext(selectedTrigger)}
          disabled={!selectedTrigger}
          className={`px-8 py-3 font-medium rounded-lg transition-colors ${
            selectedTrigger
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
