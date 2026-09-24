import React from 'react';
import type { TutorActionType, GateType } from '../../services/tutorApi';
import { 
  Sparkles, 
  HelpCircle, 
  Lightbulb, 
  AlertCircle, 
  Zap, 
  MessageSquareQuote 
} from 'lucide-react';

interface TutorSuggestionsProps {
  onSelectAction: (action: TutorActionType) => void;
  isLoading: boolean;
  hasResults: boolean;
  activeGate?: GateType | null;
}

export const TutorSuggestions: React.FC<TutorSuggestionsProps> = ({
  onSelectAction,
  isLoading,
  hasResults,
  activeGate,
}) => {
  return (
    <div className="p-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs">
      <button
        type="button"
        onClick={() => onSelectAction('explain_circuit')}
        disabled={isLoading}
        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
      >
        <Sparkles className="w-3 h-3 text-slate-600" />
        <span>Analyze Circuit</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectAction('explain_gate')}
        disabled={isLoading}
        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
      >
        <HelpCircle className="w-3 h-3 text-slate-600" />
        <span>Explain {activeGate ? `${activeGate} Gate` : 'Gate'}</span>
      </button>

      {hasResults && (
        <button
          type="button"
          onClick={() => onSelectAction('explain_result')}
          disabled={isLoading}
          className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-medium text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          <MessageSquareQuote className="w-3 h-3 text-blue-700" />
          <span>Explain Results</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => onSelectAction('find_mistakes')}
        disabled={isLoading}
        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
      >
        <AlertCircle className="w-3 h-3 text-slate-600" />
        <span>Diagnose</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectAction('optimize_circuit')}
        disabled={isLoading}
        className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
      >
        <Zap className="w-3 h-3 text-slate-600" />
        <span>Optimize</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectAction('give_hint')}
        disabled={isLoading}
        className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-medium text-[10px] flex items-center gap-1 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
      >
        <Lightbulb className="w-3 h-3 text-amber-600" />
        <span>Hint</span>
      </button>
    </div>
  );
};
