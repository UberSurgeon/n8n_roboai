// src/pages/Trigger_Page.tsx
import React, { useState } from "react";
import { Mail, FileText, Upload, Clock, ArrowLeft, Webhook, Calendar, Zap, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../context/WizardContext";

interface Trigger {
  id: string;
  icon: typeof Mail;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const triggers: Trigger[] = [
  { id: "gmail", icon: Mail, title: "Gmail", description: "Runs when a new email arrives in your Gmail inbox" },
  { id: "outlook-email", icon: Mail, title: "Outlook Email", description: "Runs when a new email arrives in your Outlook inbox" },
  { id: "moodle-assignment", icon: FileText, title: "Moodle – Assignment Submitted", description: "Runs when a student submits an assignment in Moodle" },
  { id: "manual-upload", icon: Upload, title: "Manual File Upload", description: "Runs when you upload a document" },
  { id: "scheduled-run", icon: Clock, title: "Scheduled Run", description: "Runs automatically at a chosen time (daily, weekly, or monthly)" },
  { id: "teams-message", icon: Zap, title: "Teams Message", description: "Runs when a message is posted in a Teams channel", comingSoon: true },
  { id: "calendar-event", icon: Calendar, title: "Calendar Event", description: "Runs when a calendar event is created or updated", comingSoon: true },
  { id: "custom-trigger", icon: Webhook, title: "Custom Trigger", description: "Connect your own system or service to trigger this agent", comingSoon: true },
];

function TriggerOption({ trigger, selected, onClick }: { trigger: Trigger; selected: boolean; onClick: () => void }) {
  const Icon = trigger.icon;
  return (
    <button
      onClick={onClick}
      disabled={trigger.comingSoon}
      className={`w-full p-6 rounded-lg border transition-all text-left ${
        trigger.comingSoon
          ? "border-border bg-muted/30 cursor-not-allowed opacity-60"
          : selected
          ? "border-blue-600 bg-blue-50 shadow-sm"
          : "border-border bg-card hover:border-blue-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selected ? "bg-blue-100" : "bg-muted"}`}>
          <Icon className={`w-6 h-6 ${selected ? "text-blue-600" : "text-foreground"}`} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-medium">{trigger.title}</h3>
            {trigger.comingSoon && <span className="px-2 py-0.5 text-xs bg-muted rounded">Coming Soon</span>}
          </div>
          <p className="text-sm text-muted-foreground">{trigger.description}</p>
        </div>
      </div>
    </button>
  );
}

export default function TriggerPage() {
  const navigate = useNavigate();
  const { selectedTrigger, setTrigger } = useWizard();
  const [search, setSearch] = useState("");

  const filteredTriggers = triggers.filter((trigger) =>
    trigger.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>

          <span className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
            Step 1 of 4
          </span>

          <h1 className="text-3xl font-semibold text-foreground mb-2">How should the agent start?</h1>
          <p className="text-muted-foreground">Choose what will trigger your AI agent to run.</p>
        </div>
      </div>

      {/* Search */}
      <div className="sticky top-0 z-10 bg-blue-500/90 backdrop-blur border-b border-blue-700">
        <div className="max-w-4xl mx-auto px-6 py-4 relative">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="text"
            placeholder="Search triggers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* Trigger list */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {filteredTriggers.map((trigger) => (
          <TriggerOption
            key={trigger.id}
            trigger={trigger}
            selected={selectedTrigger === trigger.id}
            onClick={() => !trigger.comingSoon && setTrigger(trigger.id)}
          />
        ))}

        {filteredTriggers.length === 0 && <p className="text-muted-foreground">No triggers found.</p>}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-border flex justify-end">
        <button
          disabled={!selectedTrigger}
          onClick={() => navigate("/agent-action")}
          className={`px-8 py-3 rounded-lg font-medium ${
            selectedTrigger ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}