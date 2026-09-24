import React, { useState, useRef, useEffect } from 'react';
import type { Circuit, SimulationResult, SimulationConfig, GateType } from '../../types/quantum';
import { tutorApi, type TutorActionType } from '../../services/tutorApi';
import { TutorContext } from './TutorContext';
import { TutorSuggestions } from './TutorSuggestions';
import { TutorMessage, type ChatMessage } from './TutorMessage';
import { 
  GraduationCap, 
  Send, 
  RotateCcw, 
  Loader2, 
  X, 
  Sparkles,
  Bot
} from 'lucide-react';

interface FloatingTutorDrawerProps {
  circuit: Circuit;
  simulationResult: SimulationResult | null;
  config?: SimulationConfig;
  activeGate?: GateType | null;
  onNavigate?: (tab: 'dashboard' | 'learn' | 'lab' | 'challenges' | 'progress', targetModuleId?: string) => void;
}

export const FloatingTutorDrawer: React.FC<FloatingTutorDrawerProps> = ({
  circuit,
  simulationResult,
  config,
  activeGate,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewContextTip, setHasNewContextTip] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-init',
      sender: 'tutor',
      text: "Hello! I'm your Quantum AI Tutor, synchronized with your live lab workspace. Tap any action above to explain your active circuit, analyze the selected gate, interpret simulation results, diagnose circuit mistakes, generate multi-framework code, or receive lesson recommendations.",
      timestamp: 'Ready',
      category: 'general',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // When simulation completes or circuit changes, trigger indicator
  useEffect(() => {
    if (simulationResult) {
      setHasNewContextTip(true);
    }
  }, [simulationResult, circuit]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleRunAction = async (actionType: TutorActionType, customQuery?: string) => {
    let queryText = customQuery;
    if (!queryText) {
      switch (actionType) {
        case 'explain_circuit':
          queryText = 'Explain this circuit';
          break;
        case 'explain_gate':
          queryText = activeGate ? `Explain the ${activeGate} gate in this circuit` : 'Explain the selected gate';
          break;
        case 'explain_result':
          queryText = 'Explain the simulation results';
          break;
        case 'find_mistakes':
          queryText = 'Find possible mistakes in this circuit';
          break;
        case 'generate_code':
          queryText = 'Generate Qiskit/PennyLane/Cirq code';
          break;
        case 'recommend_lesson':
          queryText = 'Recommend the next lesson for my circuit';
          break;
        case 'optimize_circuit':
          queryText = 'How can I optimize this circuit?';
          break;
        case 'give_hint':
          queryText = 'Give me a hint';
          break;
        default:
          queryText = 'Explain this circuit';
      }
    }

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
        codeSnippet: response.codeSnippet,
        recommendation: response.recommendation,
        category: response.category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, tutorMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `tutor-err-${Date.now()}`,
        sender: 'tutor',
        text: 'An error occurred while analyzing the circuit state. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'diagnostic',
      };
      setMessages((prev) => [...prev, errorMsg]);
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
        text: 'Conversation reset. Connected to your live circuit workspace. Select an action above or type any quantum question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'general',
      },
    ]);
  };

  return (
    <>
      {/* Floating Bottom-Right Assistant Trigger Button */}
      <aside aria-label="Quantum Tutor Assistant" className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setHasNewContextTip(false);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl border border-slate-700/80 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
          </div>

          <div className="text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight">Quantum Tutor</span>
              <Sparkles className="w-3 h-3 text-indigo-300" />
            </div>
            <p className="text-[10px] text-slate-400 leading-none">Context AI Assistant</p>
          </div>

          {hasNewContextTip && (
            <span className="absolute -top-1.5 -left-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-bold text-slate-950 items-center justify-center">
                !
              </span>
            </span>
          )}
        </button>
      </aside>

      {/* Backdrop for Slide-Over Drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 transition-opacity duration-300 animate-in fade-in"
        />
      )}

      {/* Right-Side Animated Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Quantum Tutor Drawer"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Quantum Tutor</h2>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Circuit Context
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Real-time quantum circuit & simulation assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearConversation}
              title="Reset conversation"
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Close Tutor (Esc)"
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Live Circuit Context Bar */}
        <TutorContext
          circuit={circuit}
          config={config}
          activeGate={activeGate}
        />

        {/* 6 Core Contextual Action Buttons */}
        <div className="px-3 py-2 border-b border-slate-100 bg-white">
          <TutorSuggestions
            onSelectAction={(act) => handleRunAction(act)}
            isLoading={isThinking}
            hasResults={Boolean(simulationResult)}
            activeGate={activeGate}
          />
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/40">
          {messages.map((msg) => (
            <TutorMessage 
              key={msg.id} 
              message={msg} 
              onNavigateToModule={(modId) => {
                setIsOpen(false);
                onNavigate?.('learn', modId);
              }}
            />
          ))}

          {isThinking && (
            <div className="flex items-start animate-in fade-in duration-200">
              <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs flex items-center gap-2.5 shadow-2xs">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin flex-shrink-0" />
                <span className="text-[11px] font-mono text-slate-600">
                  Analyzing circuit state vector & quantum operators...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleCustomSubmit}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask anything about your circuit, gates, or results..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isThinking}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </>
  );
};
