import React, { useState } from "react";
import { ArrowLeft, Search, Check } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface Action {
  id: string;
  title: string;
  description: string;
}

const actions: Action[] = [
  {
    id: "summarize",
    title: "Summarize Document",
    description: "Generate a concise summary of the document"
  },
  {
    id: "reply-email",
    title: "Reply to Student",
    description: "Draft a helpful response email"
  },
  {
    id: "check-language",
    title: "Check Language",
    description: "Fix grammar, spelling, and tone"
  },
  {
    id: "check-references",
    title: "Check References",
    description: "Validate citations and references"
  }
];

export default function AgentAction() {
  const navigate = useNavigate();
  const location = useLocation();

  const trigger = location.state?.trigger; // 👈 from previous step

  const [search, setSearch] = useState("");
  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAction = (id: string) => {
    setSelectedActions(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <span className="inline-block mb-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
            Step 2 of 4
          </span>

          <h1 className="text-3xl font-semibold mb-2">
            What should the agent do?
          </h1>

          <p className="text-muted-foreground">
            Trigger: <strong>{trigger}</strong>
          </p>
        </div>
      </div>

    {/* Sticky search */}
    <div className="sticky top-0 z-10 bg-blue-500/90 backdrop-blur border-b border-blue-700">
      <div className="max-w-4xl mx-auto px-6 py-4 relative">
        {/* Search icon */}
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />

        {/* Input */}
        <input
        type="text"
        placeholder="Search actions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-blue-500 bg-white px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>
    </div>

      {/* Action list */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {filteredActions.map(action => {
          const selected = selectedActions.includes(action.id);

          return (
            <button
              key={action.id}
              onClick={() => toggleAction(action.id)}
              className={`w-full text-left p-5 rounded-lg border transition-all ${
                selected
                  ? "border-blue-600 bg-blue-50"
                  : "border-border bg-card hover:border-blue-300"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </div>
                {selected && (
                  <Check className="w-5 h-5 text-blue-600 mt-1" />
                )}
              </div>
            </button>
          );
        })}

        {filteredActions.length === 0 && (
          <p className="text-muted-foreground">No actions found.</p>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-t border-border flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-lg border border-border hover:bg-muted"
        >
          Previous
        </button>

        <button
          disabled={selectedActions.length === 0}
          onClick={() =>
            navigate("/next-step", {
              state: {
                trigger,
                actions: selectedActions
              }
            })
          }
          className={`px-8 py-3 rounded-lg font-medium ${
            selectedActions.length
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
