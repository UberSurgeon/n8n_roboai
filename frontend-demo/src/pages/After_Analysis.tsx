import React, { useState } from 'react';
import { MessageCircle, FileOutput, Bell, Save, ArrowLeft, Database, Send, Sparkles, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WizardStep3Props {
  onNext: (actions: string[]) => void;
  initialActions?: string[];
}

interface Action {
  id: string;
  icon: typeof MessageCircle;
  title: string;
  description: string;
  comingSoon?: boolean;
}

const actions: Action[] = [
  { id: 'reply-student', icon: MessageCircle, title: 'Reply to Student', description: 'Send a short, polite message to the student if issues are found' },
  { id: 'generate-report', icon: FileOutput, title: 'Generate Report', description: 'Create a detailed report for you to review before taking action' },
  { id: 'notify-me', icon: Bell, title: 'Notify Me', description: 'Send you a notification when the analysis is complete' },
  { id: 'save-result', icon: Save, title: 'Save Result', description: 'Store the analysis result for later reference and review' },
  { id: 'post-to-teams', icon: Send, title: 'Post to Teams', description: 'Share results in a Microsoft Teams channel for your team', comingSoon: true },
  { id: 'update-database', icon: Database, title: 'Update Records', description: 'Automatically update student records or grade book entries', comingSoon: true },
  { id: 'custom-action', icon: Sparkles, title: 'Custom Action', description: 'Define your own action or connect to another service', comingSoon: true }
];

function ActionOption({ action, selected, onClick }: { action: Action; selected: boolean; onClick: () => void }) {
  const Icon = action.icon;
  return (
    <button
      onClick={onClick}
      disabled={action.comingSoon}
      className={`w-full p-6 rounded-lg border transition-all text-left ${
        action.comingSoon ? 'border-border bg-muted/30 cursor-not-allowed opacity-60' : selected ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-border bg-card hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
          action.comingSoon ? 'bg-muted' : selected ? 'bg-blue-100' : 'bg-muted'
        }`}>
          <Icon className={`w-6 h-6 ${action.comingSoon ? 'text-muted-foreground' : selected ? 'text-blue-600' : 'text-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-lg font-medium ${action.comingSoon ? 'text-muted-foreground' : 'text-foreground'}`}>
              {action.title}
            </h3>
            {action.comingSoon && <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">Coming Soon</span>}
          </div>
          <p className={`text-sm ${action.comingSoon ? 'text-muted-foreground' : 'text-muted-foreground'}`}>{action.description}</p>
        </div>
      </div>
    </button>
  );
}

export default function WizardStep3({ onNext, initialActions }: WizardStep3Props) {
  const navigate = useNavigate();
  const [selectedActions, setSelectedActions] = useState<string[]>(initialActions || []);
  const [search, setSearch] = useState('');

  const toggleAction = (actionId: string, comingSoon?: boolean) => {
    if (comingSoon) return;
    setSelectedActions(prev => (prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]));
  };

  const filteredActions = actions.filter(action => action.title.toLowerCase().includes(search.toLowerCase()));

  const goBack = () => {
    navigate('/agent-action'); // previous page
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button onClick={goBack} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <span className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">Step 3 of 4</span>
          <h1 className="text-3xl font-semibold text-foreground mb-3">What should happen after the analysis?</h1>
          <p className="text-muted-foreground mb-1">
            Choose how the agent should respond once it has completed its review. You can always adjust this later.
          </p>
          <p className="text-blue-600 font-medium mb-4">You can choose more than one action.</p>
        </div>
      </div>

      {/* Sticky search */}
      <div className="sticky top-0 z-10 bg-blue-500/90 backdrop-blur border-b border-blue-700">
        <div className="max-w-4xl mx-auto px-6 py-4 relative">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
          <input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {filteredActions.map(action => (
          <ActionOption key={action.id} action={action} selected={selectedActions.includes(action.id)} onClick={() => toggleAction(action.id, action.comingSoon)} />
        ))}
        {filteredActions.length === 0 && <p className="text-muted-foreground">No actions found.</p>}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-border flex justify-between items-center">
        <button
          onClick={goBack} // Previous step
          className="px-6 py-3 font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          Previous Step
        </button>
        <button
          onClick={() => onNext(selectedActions)}
          disabled={selectedActions.length === 0}
          className={`px-8 py-3 font-medium rounded-lg transition-colors ${
            selectedActions.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
