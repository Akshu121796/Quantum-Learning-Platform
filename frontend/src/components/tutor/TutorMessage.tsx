import React, { useState } from 'react';
import { Copy, Check, Terminal, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  latexNotation?: string;
  codeSnippet?: {
    qiskit: string;
    pennylane: string;
    cirq: string;
  };
  recommendation?: {
    moduleId: string;
    moduleNumber: string;
    title: string;
    difficulty: string;
    description: string;
  };
  timestamp: string;
  category?: 'explanation' | 'diagnostic' | 'optimization' | 'hint' | 'code' | 'recommendation' | 'general';
}

interface TutorMessageProps {
  message: ChatMessage;
  onNavigateToModule?: (moduleId: string) => void;
}

export const TutorMessage: React.FC<TutorMessageProps> = ({ message, onNavigateToModule }) => {
  const isUser = message.sender === 'user';
  const [selectedFramework, setSelectedFramework] = useState<'qiskit' | 'pennylane' | 'cirq'>('qiskit');
  const [copied, setCopied] = useState(false);

  const getCategoryBadge = (category?: ChatMessage['category']) => {
    switch (category) {
      case 'explanation':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'diagnostic':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'optimization':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'hint':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'code':
        return 'bg-slate-900 text-cyan-300 border-slate-700';
      case 'recommendation':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleCopyCode = async (codeText: string) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = codeText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[95%] sm:max-w-[90%] rounded-xl p-3.5 text-xs leading-relaxed ${
          isUser
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Quantum Tutor
            </span>
            {message.category && (
              <span
                className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${getCategoryBadge(
                  message.category
                )}`}
              >
                {message.category}
              </span>
            )}
          </div>
        )}

        <p className="whitespace-pre-line text-xs text-slate-800">{message.text}</p>

        {/* Latex Display */}
        {message.latexNotation && (
          <div className="mt-2.5 p-2.5 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded-lg border border-slate-800 overflow-x-auto shadow-inner">
            <div className="text-[9px] uppercase tracking-widest text-slate-400 mb-1 font-sans">
              Mathematical Representation
            </div>
            <code>{message.latexNotation}</code>
          </div>
        )}

        {/* Multi-Framework Code Snippet Display */}
        {message.codeSnippet && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 overflow-hidden shadow-md">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px]">
              <div className="flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                <button
                  type="button"
                  onClick={() => setSelectedFramework('qiskit')}
                  className={`px-2 py-0.5 rounded font-mono transition-colors ${
                    selectedFramework === 'qiskit'
                      ? 'bg-slate-800 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Qiskit
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFramework('pennylane')}
                  className={`px-2 py-0.5 rounded font-mono transition-colors ${
                    selectedFramework === 'pennylane'
                      ? 'bg-slate-800 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  PennyLane
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFramework('cirq')}
                  className={`px-2 py-0.5 rounded font-mono transition-colors ${
                    selectedFramework === 'cirq'
                      ? 'bg-slate-800 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cirq
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(message.codeSnippet![selectedFramework])}
                className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 max-h-56 overflow-y-auto font-mono text-[11px] text-slate-200 leading-relaxed">
              <pre className="whitespace-pre overflow-x-auto">
                <code>{message.codeSnippet[selectedFramework]}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Recommended Lesson Card */}
        {message.recommendation && (
          <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50/80 to-blue-50/60 border border-indigo-200 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>
                  Module {message.recommendation.moduleNumber}: {message.recommendation.title}
                </span>
              </div>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
                {message.recommendation.difficulty}
              </span>
            </div>

            <p className="text-[11px] text-indigo-950/80 mb-2 leading-snug">
              {message.recommendation.description}
            </p>

            {onNavigateToModule && (
              <button
                type="button"
                onClick={() => onNavigateToModule(message.recommendation!.moduleId)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-medium shadow-2xs transition-colors cursor-pointer"
              >
                <span>Open Lesson in Learn</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
        {message.timestamp}
      </span>
    </div>
  );
};
