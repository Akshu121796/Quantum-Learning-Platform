import React from 'react';
import type { StateVectorElement } from '../../types/quantum';
import { Compass } from 'lucide-react';

interface StateVisualizationProps {
  stateVector: StateVectorElement[];
  numQubits: number;
}

export const StateVisualization: React.FC<StateVisualizationProps> = ({
  stateVector,
  numQubits,
}) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-slate-700" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Quantum State Vector & Phase
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Hilbert Space Dim: 2^{numQubits} = {1 << numQubits}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {stateVector.map((elem) => {
          const isHighProb = elem.probability > 0.05;
          const phaseDeg = parseFloat(elem.phase) || 0;

          return (
            <div
              key={elem.binary}
              className={`p-2.5 rounded-md border text-left transition-all ${
                isHighProb
                  ? 'border-slate-300 bg-slate-50 shadow-xs'
                  : 'border-slate-100 bg-white opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-xs text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  |{elem.binary}⟩
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-700">
                  {(elem.probability * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <div
                  className="w-7 h-7 rounded-full border border-slate-300 bg-white relative flex items-center justify-center flex-shrink-0"
                  title={`Phase angle: ${elem.phase}`}
                >
                  <div
                    style={{
                      transform: `rotate(${phaseDeg}deg)`,
                    }}
                    className="w-full h-[1.5px] bg-slate-800 absolute origin-center"
                  />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 z-10" />
                </div>

                <div className="text-[10px] font-mono leading-tight truncate">
                  <div className="text-slate-500">amp: {elem.amplitude}</div>
                  <div className="text-slate-400">φ: {elem.phase}</div>
                </div>
              </div>

              <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-slate-800 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, elem.probability * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
