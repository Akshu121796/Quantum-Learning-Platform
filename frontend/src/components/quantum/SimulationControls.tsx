import React from 'react';
import type { QuantumBackend, SimulationConfig } from '../../types/quantum';
import { Play, Settings2, ShieldCheck, Loader2 } from 'lucide-react';

interface SimulationControlsProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  onSimulate: () => void;
  isSimulating: boolean;
  gateCount: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  config,
  onChangeConfig,
  onSimulate,
  isSimulating,
  gateCount,
}) => {
  const backends: { id: QuantumBackend; name: string; tag: string; desc: string }[] = [
    { id: 'Qiskit Aer', name: 'Qiskit Aer', tag: 'Statevector', desc: 'IBM Quantum QasmSimulator' },
    { id: 'PennyLane', name: 'PennyLane', tag: 'Differentiable', desc: 'Xanadu default.qubit plugin' },
    { id: 'Cirq', name: 'Cirq', tag: 'Density Matrix', desc: 'Google Quantum AI simulator' },
  ];

  const shotOptions = [100, 500, 1000, 2048, 4096];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex flex-col justify-between shadow-xs h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-slate-700" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Execution Config
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Ready
          </span>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
            Target Backend
          </label>
          <div className="space-y-1.5">
            {backends.map((b) => {
              const isSelected = config.backend === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  id={`backend-${b.id.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => onChangeConfig({ ...config, backend: b.id })}
                  className={`w-full text-left p-2 rounded-md border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">{b.name}</span>
                    <span
                      className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}
                    >
                      {b.desc}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      isSelected
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {b.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">
              Shots (Samples)
            </label>
            <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {config.shots.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1">
            {shotOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeConfig({ ...config, shots: s })}
                className={`py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                  config.shots === s
                    ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {s >= 1000 ? `${s / 1000}k` : s}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center justify-between text-xs cursor-pointer select-none">
            <span className="text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Ideal Simulator (Zero Noise)
            </span>
            <input
              type="checkbox"
              checked={!config.noiseModel}
              onChange={(e) => onChangeConfig({ ...config, noiseModel: !e.target.checked })}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          id="simulate-button"
          onClick={onSimulate}
          disabled={isSimulating}
          className="w-full py-2.5 px-4 rounded-md bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Simulate ({config.backend.split(' ')[0]})</span>
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-slate-400 mt-1.5">
          {gateCount} gates scheduled on {config.backend}
        </p>
      </div>
    </div>
  );
};
