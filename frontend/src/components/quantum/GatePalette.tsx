import React, { useState } from 'react';
import type { GateType, GateDefinition } from '../../types/quantum';
import { GATE_DEFINITIONS } from '../../data/mockData';
import { Info, Plus, HelpCircle } from 'lucide-react';
import { GateInfoModal } from './GateInfoModal';

interface GatePaletteProps {
  selectedGate: GateType | null;
  onSelectGate: (gate: GateType) => void;
  onQuickAdd: (gate: GateType) => void;
  highlightGate?: GateType | null;
}

export const GatePalette: React.FC<GatePaletteProps> = ({
  selectedGate,
  onSelectGate,
  onQuickAdd,
  highlightGate,
}) => {
  const [infoGateModal, setInfoGateModal] = useState<GateType | null>(null);

  const getGateBadgeColor = (category: GateDefinition['category']) => {
    switch (category) {
      case 'single':
        return 'bg-slate-900 text-white hover:bg-slate-800 border-slate-900';
      case 'multi':
        return 'bg-slate-800 text-cyan-200 hover:bg-slate-700 border-slate-700';
      case 'phase':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300';
      case 'measurement':
        return 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex flex-col h-full shadow-xs">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Gate Palette</h3>
          <p className="text-[11px] text-slate-500">Select & click wire slot, or click ⓘ for guide</p>
        </div>
        <div className="group relative">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
          <div className="hidden group-hover:block absolute right-0 top-5 w-48 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-50 leading-snug">
            Select a gate and click any slot in the canvas grid to place it. Click ⓘ on any gate to learn its function.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {GATE_DEFINITIONS.map((gate) => {
          const isSelected = selectedGate === gate.type;
          const isHighlighted = highlightGate === gate.type;

          return (
            <div
              key={gate.type}
              id={`gate-card-${gate.type}`}
              className={`relative rounded-md transition-all ${
                isHighlighted ? 'ring-2 ring-indigo-500 ring-offset-1 animate-pulse' : ''
              }`}
            >
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/json',
                    JSON.stringify({
                      type: 'NEW_GATE',
                      gateType: gate.type,
                    })
                  );
                  e.dataTransfer.setData('text/plain', gate.type);
                  e.dataTransfer.effectAllowed = 'copy';
                  onSelectGate(gate.type);
                }}
                onClick={() => onSelectGate(gate.type)}
                title="Drag onto circuit wire, or click to select"
                className={`w-full p-2 rounded-md border text-xs font-mono transition-all flex items-center justify-between cursor-grab active:cursor-grabbing select-none ${
                  isSelected
                    ? 'ring-2 ring-slate-900 border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-400 bg-white hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs border flex-shrink-0 ${getGateBadgeColor(
                      gate.category
                    )}`}
                  >
                    {gate.symbol}
                  </span>
                  <div className="min-w-0">
                    <span className="block font-sans font-medium text-slate-800 truncate">
                      {gate.name.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase truncate">
                      {gate.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                  {/* ⓘ Info Button */}
                  <button
                    type="button"
                    title={`Explain ${gate.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInfoGateModal(gate.type);
                    }}
                    className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                    aria-label={`Explain ${gate.name}`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Append Button */}
                  <button
                    type="button"
                    title="Quick append to next slot"
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(gate.type);
                    }}
                    className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedGate && (
        <div className="mt-auto p-2 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 mb-0.5">
              <Info className="w-3 h-3 text-slate-600" />
              <span>Active: {selectedGate} Gate</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Drag gate or click wire slot (t0-t9) to place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInfoGateModal(selectedGate)}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex-shrink-0 ml-2"
          >
            Learn Gate ⓘ
          </button>
        </div>
      )}

      {/* Gate Explainer Modal */}
      <GateInfoModal
        gateType={infoGateModal}
        onClose={() => setInfoGateModal(null)}
        onSelectAndClose={(gate) => onSelectGate(gate)}
      />
    </div>
  );
};
