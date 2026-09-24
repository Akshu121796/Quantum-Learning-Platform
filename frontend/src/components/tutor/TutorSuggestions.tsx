import React from 'react';
import type { TutorActionType, GateType } from '../../services/tutorApi';
import { 
  Sparkles, 
  HelpCircle, 
  MessageSquareQuote, 
  AlertCircle, 
  Code2, 
  GraduationCap
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold px-0.5">
        <span>Context Actions</span>
        <span className="text-[9px] text-slate-400 font-normal">Active Circuit Intelligence</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        {/* 1. Explain Circuit */}
        <button
          type="button"
          onClick={() => onSelectAction('explain_circuit')}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1.5 transition-all hover:border-slate-300 disabled:opacity-50 cursor-pointer shadow-2xs"
          title="Step-by-step walkthrough of the active circuit wires and quantum state"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
          <span className="truncate">Explain Circuit</span>
        </button>

        {/* 2. Explain Selected Gate */}
        <button
          type="button"
          onClick={() => onSelectAction('explain_gate')}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1.5 transition-all hover:border-slate-300 disabled:opacity-50 cursor-pointer shadow-2xs"
          title={`Explain what the ${activeGate || 'selected'} gate does in the context of this circuit`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
          <span className="truncate">Explain {activeGate ? `${activeGate} Gate` : 'Selected Gate'}</span>
        </button>

        {/* 3. Explain Results */}
        <button
          type="button"
          onClick={() => onSelectAction('explain_result')}
          disabled={isLoading}
          className={`px-2.5 py-1.5 rounded-lg border font-medium text-[11px] flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-2xs ${
            hasResults
              ? 'bg-blue-50/80 hover:bg-blue-100/80 border-blue-300 text-blue-900 font-semibold'
              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title="Analyze measured probability distributions, shot counts, and Poisson noise"
        >
          <MessageSquareQuote className={`w-3.5 h-3.5 flex-shrink-0 ${hasResults ? 'text-blue-700' : 'text-slate-500'}`} />
          <span className="truncate">
            Explain Results
            {hasResults && <span className="ml-1 text-[9px] text-blue-600 font-bold">• Ready</span>}
          </span>
        </button>

        {/* 4. Find Possible Mistakes */}
        <button
          type="button"
          onClick={() => onSelectAction('find_mistakes')}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1.5 transition-all hover:border-slate-300 disabled:opacity-50 cursor-pointer shadow-2xs"
          title="Diagnose wire collisions, self-canceling gates, and post-measurement operations"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="truncate">Find Possible Mistakes</span>
        </button>

        {/* 5. Generate Qiskit / PennyLane / Cirq Code */}
        <button
          type="button"
          onClick={() => onSelectAction('generate_code')}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1.5 transition-all hover:border-slate-300 disabled:opacity-50 cursor-pointer shadow-2xs"
          title="Generate executable Qiskit, PennyLane, and Cirq scripts for this circuit"
        >
          <Code2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="truncate">Generate Code</span>
        </button>

        {/* 6. Recommend Next Lesson */}
        <button
          type="button"
          onClick={() => onSelectAction('recommend_lesson')}
          disabled={isLoading}
          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] flex items-center gap-1.5 transition-all hover:border-slate-300 disabled:opacity-50 cursor-pointer shadow-2xs"
          title="Recommend the best next curriculum module based on circuit complexity"
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
          <span className="truncate">Recommend Next Lesson</span>
        </button>
      </div>
    </div>
  );
};
