import React, { useState, useRef, useEffect } from 'react';
import type { Circuit, SimulationResult, SimulationConfig, GateType } from '../../types/quantum';
import { tutorApi, type TutorActionType } from '../../services/tutorApi';
import { TutorContext } from './TutorContext';
import { TutorSuggestions } from './TutorSuggestions';
import { TutorMessage, type ChatMessage } from './TutorMessage';
import { GraduationCap, Send, RotateCcw, Loader2 } from 'lucide-react';

interface TutorPanelProps {
  circuit: Circuit;
  simulationResult: SimulationResult | null;
  config?: SimulationConfig;
  activeGate?: GateType | null;
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
  circuit,
  simulationResult,
  config,
  activeGate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      sender: 'tutor',
      text: "Welcome to Quantum Tutor. I'm connected directly to your active Quantum Lab circuit. Use the action prompts above to analyze statevectors, diagnose gate scheduling, or ask questions about quantum theory.",
      timestamp: 'Ready',
      category: 'general',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleRunAction = async (actionType: TutorActionType, customQuery?: string) => {
    const queryText = customQuery || (
      actionType === 'explain_circuit' ? 'Explain this circuit' :
      actionType === 'explain_gate' ? `Explain the ${activeGate || 'selected'} gate` :
      actionType === 'explain_result' ? 'Why do these measurement results occur?' :
      actionType === 'find_mistakes' ? 'Check for possible mistakes in this circuit' :
      actionType === 'optimize_circuit' ? 'How can I optimize this circuit?' :
      'Give me a hint'
    );

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await tutorApi.askTutor({
        prompt: customQuery,
        actionType,
        context: {
          circuit,
          simulationResult,
          activeGate,
          config,
        },
      });

      const tutorMsg: ChatMessage = {
        id: `tutor-${Date.now()}`,
        sender: 'tutor',
        text: response.text,
        latexNotation: response.latexNotation,
        category: response.category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isThinking) return;
    const q = inputPrompt.trim();
    setInputPrompt('');
    handleRunAction('explain_circuit', q);
  };

  const handleClearConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'tutor',
        text: 'Conversation reset. Ready for your next quantum query or circuit inspection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
      },
    ]);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Quantum Tutor
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready to help
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Context-aware circuit assistant</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClearConversation}
          title="Clear conversation"
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px]">Clear</span>
        </button>
      </div>

      {/* Embedded Context Bar */}
      <TutorContext
        circuit={circuit}
        config={config}
        activeGate={activeGate}
      />

      {/* Suggested Prompt Action Buttons */}
      <TutorSuggestions
        onSelectAction={(act) => handleRunAction(act)}
        isLoading={isThinking}
        hasResults={Boolean(simulationResult)}
        activeGate={activeGate}
      />

      {/* Chat Messages Feed */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/30">
        {messages.map((msg) => (
          <TutorMessage key={msg.id} message={msg} />
        ))}

        {isThinking && (
          <div className="flex items-start">
            <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex items-center gap-2 shadow-2xs">
              <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />
              <span className="text-[11px] font-mono text-slate-600">
                Evaluating quantum state & Hilbert space transformations...
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Ask Input Form */}
      <form
        onSubmit={handleCustomSubmit}
        className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask tutor (e.g. 'Why do only 00 and 11 appear?')..."
          className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isThinking}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
};
