import React from 'react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  latexNotation?: string;
  timestamp: string;
  category?: 'explanation' | 'diagnostic' | 'optimization' | 'hint' | 'general';
}

interface TutorMessageProps {
  message: ChatMessage;
}

export const TutorMessage: React.FC<TutorMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

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
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed ${
          isUser
            ? 'bg-slate-900 text-white shadow-2xs'
            : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1.5 border-b border-slate-100">
            <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
              Quantum Tutor
            </span>
            {message.category && (
              <span
                className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border font-semibold ${getCategoryBadge(
                  message.category
                )}`}
              >
                {message.category}
              </span>
            )}
          </div>
        )}

        <p className="whitespace-pre-line text-xs">{message.text}</p>

        {message.latexNotation && (
          <div className="mt-2 p-2 bg-slate-900 text-cyan-300 font-mono text-[11px] rounded border border-slate-800 overflow-x-auto shadow-inner">
            {message.latexNotation}
          </div>
        )}
      </div>

      <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
        {message.timestamp}
      </span>
    </div>
  );
};
