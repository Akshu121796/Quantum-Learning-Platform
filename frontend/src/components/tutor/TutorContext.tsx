import React from 'react';
import type { Circuit, SimulationConfig, GateType } from '../../types/quantum';
import { Cpu, Layers, Hash, Sparkles } from 'lucide-react';

interface TutorContextProps {
  circuit: Circuit;
  config?: SimulationConfig;
  activeGate?: GateType | null;
}

export const TutorContext: React.FC<TutorContextProps> = ({
  circuit,
  config,
  activeGate,
}) => {
  const gatesSummary = circuit.gates.length > 0 
    ? circuit.gates.map((g) => (g.type === 'CX' && g.targetQubit !== undefined ? `CX(q${g.qubit},q${g.targetQubit})` : `${g.type}(q${g.qubit})`)).join(' → ')
    : 'No gates placed';

  return (
    <div className="bg-slate-50 border-b border-slate-200 px-3.5 py-2.5 text-xs text-slate-600">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-400" />
          Active Circuit Context
        </span>
        {activeGate && (
          <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
            Selected Gate: <strong className="text-slate-900">{activeGate}</strong>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
          <Layers className="w-3 h-3 text-slate-500" />
          <span>{circuit.numQubits} Qubit{circuit.numQubits > 1 ? 's' : ''}</span>
        </div>

        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
          <Cpu className="w-3 h-3 text-slate-500" />
          <span>{config?.backend || 'Qiskit Aer'}</span>
        </div>

        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
          <Hash className="w-3 h-3 text-slate-500" />
          <span>{(config?.shots || 1000).toLocaleString()} shots</span>
        </div>

        <div className="w-full bg-white px-2 py-1 rounded border border-slate-200 text-[10px] text-slate-700 truncate">
          <span className="text-slate-400 mr-1">Gates:</span>
          <span className="font-semibold text-slate-800">{gatesSummary}</span>
        </div>
      </div>
    </div>
  );
};
