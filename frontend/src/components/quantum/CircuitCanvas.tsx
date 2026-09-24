import React, { useState } from 'react';
import type { Circuit, CircuitGate, GateType } from '../../types/quantum';
import { Plus, Minus, RotateCcw, Sparkles, Trash2, Move } from 'lucide-react';

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedGate: GateType | null;
  onUpdateCircuit: (circuit: Circuit) => void;
  onLoadPreset: (presetKey: string) => void;
  highlightCell?: { qubit: number; step: number } | null;
  highlightQubits?: boolean;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuit,
  selectedGate,
  onUpdateCircuit,
  onLoadPreset,
  highlightCell,
  highlightQubits,
}) => {
  const stepsCount = Math.max(6, circuit.steps);
  const [dragOverCell, setDragOverCell] = useState<{ qubit: number; step: number } | null>(null);
  const [isDragOverTrash, setIsDragOverTrash] = useState(false);
  const [draggingGateId, setDraggingGateId] = useState<string | null>(null);

  const handlePlaceGate = (gateType: GateType, qubitIdx: number, stepIdx: number) => {
    let newGate: CircuitGate;

    if (gateType === 'CX' || gateType === 'SWAP') {
      const defaultTarget = qubitIdx + 1 < circuit.numQubits ? qubitIdx + 1 : Math.max(0, qubitIdx - 1);
      if (defaultTarget === qubitIdx) return;
      newGate = {
        id: `gate-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: gateType,
        qubit: qubitIdx,
        targetQubit: defaultTarget,
        step: stepIdx,
      };
    } else {
      newGate = {
        id: `gate-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: gateType,
        qubit: qubitIdx,
        step: stepIdx,
      };
    }

    // Clean existing gates that collide with this placement
    const cleanGates = circuit.gates.filter((g) => {
      const matchesControl = (g.qubit === qubitIdx || g.targetQubit === qubitIdx) && g.step === stepIdx;
      const matchesTarget =
        newGate.targetQubit !== undefined &&
        (g.qubit === newGate.targetQubit || g.targetQubit === newGate.targetQubit) &&
        g.step === stepIdx;
      return !matchesControl && !matchesTarget;
    });

    onUpdateCircuit({
      ...circuit,
      gates: [...cleanGates, newGate],
    });
  };

  const handleMoveGate = (
    gateId: string,
    targetQubit: number,
    targetStep: number,
    isTargetNode?: boolean
  ) => {
    const existing = circuit.gates.find((g) => g.id === gateId);
    if (!existing) return;

    if (isTargetNode && (existing.type === 'CX' || existing.type === 'SWAP')) {
      if (targetQubit === existing.qubit) return; // Cannot target own control qubit
      const updatedGates = circuit.gates
        .filter((g) => g.id === gateId || !(g.qubit === targetQubit && g.step === targetStep))
        .map((g) => {
          if (g.id === gateId) {
            return { ...g, targetQubit: targetQubit, step: targetStep };
          }
          return g;
        });
      onUpdateCircuit({ ...circuit, gates: updatedGates });
      return;
    }

    // Moving control / primary gate
    if (existing.type === 'CX' || existing.type === 'SWAP') {
      let targetQ = existing.targetQubit ?? (targetQubit + 1 < circuit.numQubits ? targetQubit + 1 : 0);
      if (targetQ === targetQubit) {
        targetQ = targetQubit + 1 < circuit.numQubits ? targetQubit + 1 : Math.max(0, targetQubit - 1);
      }
      const updatedGates = circuit.gates
        .filter(
          (g) =>
            g.id === gateId ||
            (!(g.qubit === targetQubit && g.step === targetStep) &&
              !(g.targetQubit === targetQubit && g.step === targetStep) &&
              !(g.qubit === targetQ && g.step === targetStep) &&
              !(g.targetQubit === targetQ && g.step === targetStep))
        )
        .map((g) => {
          if (g.id === gateId) {
            return { ...g, qubit: targetQubit, targetQubit: targetQ, step: targetStep };
          }
          return g;
        });
      onUpdateCircuit({ ...circuit, gates: updatedGates });
    } else {
      // Single qubit gate
      const updatedGates = circuit.gates
        .filter((g) => g.id === gateId || !(g.qubit === targetQubit && g.step === targetStep))
        .map((g) => {
          if (g.id === gateId) {
            return { ...g, qubit: targetQubit, step: targetStep };
          }
          return g;
        });
      onUpdateCircuit({ ...circuit, gates: updatedGates });
    }
  };

  const handleTargetCycle = (gate: CircuitGate) => {
    const available = Array.from({ length: circuit.numQubits }, (_, i) => i).filter(
      (q) => q !== gate.qubit
    );
    if (available.length <= 1) return;
    const currentTarget = gate.targetQubit ?? available[0];
    const curIdx = available.indexOf(currentTarget);
    const nextTarget = available[(curIdx + 1) % available.length];

    const updated = circuit.gates.map((g) => (g.id === gate.id ? { ...g, targetQubit: nextTarget } : g));
    onUpdateCircuit({ ...circuit, gates: updated });
  };

  const handleCellClick = (qubitIdx: number, stepIdx: number) => {
    const directGate = circuit.gates.find((g) => g.qubit === qubitIdx && g.step === stepIdx);
    const targetGate = circuit.gates.find((g) => g.targetQubit === qubitIdx && g.step === stepIdx);

    if (targetGate && !directGate) {
      handleTargetCycle(targetGate);
      return;
    }

    if (directGate) {
      const updatedGates = circuit.gates.filter((g) => g.id !== directGate.id);
      onUpdateCircuit({ ...circuit, gates: updatedGates });
      return;
    }

    if (!selectedGate) return;
    handlePlaceGate(selectedGate, qubitIdx, stepIdx);
  };

  const handleDropOnCell = (qubitIdx: number, stepIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCell(null);
    setDraggingGateId(null);
    const dataStr = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      if (data.type === 'NEW_GATE') {
        handlePlaceGate(data.gateType as GateType, qubitIdx, stepIdx);
      } else if (data.type === 'MOVE_GATE') {
        handleMoveGate(data.gateId, qubitIdx, stepIdx, data.isTargetNode);
      }
    } catch {
      if (['H', 'X', 'Y', 'Z', 'S', 'T', 'CX', 'SWAP', 'M'].includes(dataStr)) {
        handlePlaceGate(dataStr as GateType, qubitIdx, stepIdx);
      }
    }
  };

  const handleDropOnTrash = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(false);
    setDraggingGateId(null);
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    try {
      const data = JSON.parse(dataStr);
      if (data.type === 'MOVE_GATE' && data.gateId) {
        const remaining = circuit.gates.filter((g) => g.id !== data.gateId);
        onUpdateCircuit({ ...circuit, gates: remaining });
      }
    } catch {}
  };

  const handleAddQubit = () => {
    if (circuit.numQubits < 4) {
      onUpdateCircuit({
        ...circuit,
        numQubits: circuit.numQubits + 1,
      });
    }
  };

  const handleRemoveQubit = () => {
    if (circuit.numQubits > 1) {
      const newCount = circuit.numQubits - 1;
      const filteredGates = circuit.gates.filter(
        (g) => g.qubit < newCount && (g.targetQubit === undefined || g.targetQubit < newCount)
      );
      onUpdateCircuit({
        ...circuit,
        numQubits: newCount,
        gates: filteredGates,
      });
    }
  };

  const handleClearCircuit = () => {
    onUpdateCircuit({
      ...circuit,
      gates: [],
    });
  };

  const handleAddStep = () => {
    if (circuit.steps < 10) {
      onUpdateCircuit({
        ...circuit,
        steps: circuit.steps + 1,
      });
    }
  };

  const handleRemoveStep = () => {
    if (circuit.steps > 4) {
      const newSteps = circuit.steps - 1;
      const filtered = circuit.gates.filter((g) => g.step < newSteps);
      onUpdateCircuit({
        ...circuit,
        steps: newSteps,
        gates: filtered,
      });
    }
  };

  const renderGateIcon = (
    directGate: CircuitGate | undefined,
    targetGate: CircuitGate | undefined
  ) => {
    if (directGate) {
      if (directGate.type === 'CX') {
        return <span className="text-base leading-none">●</span>;
      }
      if (directGate.type === 'SWAP') {
        return <span className="text-sm font-bold leading-none text-cyan-200">✕</span>;
      }
      if (directGate.type === 'M') {
        return <span className="text-[10px] uppercase font-bold tracking-tight">M</span>;
      }
      return <span>{directGate.type}</span>;
    }
    if (targetGate) {
      if (targetGate.type === 'CX') {
        return <span className="text-base font-black leading-none text-cyan-300">⊕</span>;
      }
      if (targetGate.type === 'SWAP') {
        return <span className="text-sm font-bold leading-none text-cyan-200">✕</span>;
      }
      return <span>{targetGate.type}</span>;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
      {/* Circuit Header / Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-mono">
            Circuit Grid
          </span>
          <span className="text-slate-500 font-mono text-[11px]">
            [{circuit.numQubits}Q • {circuit.gates.length} Gates • Depth{' '}
            {circuit.gates.length > 0 ? Math.max(...circuit.gates.map((g) => g.step)) + 1 : 0}]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium px-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-slate-400" /> Presets:
            </span>
            <button
              onClick={() => onLoadPreset('bellState')}
              className="px-2 py-0.5 rounded text-[11px] bg-white hover:bg-slate-100 text-slate-700 font-medium shadow-2xs border border-slate-200 cursor-pointer"
            >
              Bell State
            </button>
            <button
              onClick={() => onLoadPreset('superposition')}
              className="px-2 py-0.5 rounded text-[11px] bg-white hover:bg-slate-100 text-slate-700 font-medium shadow-2xs border border-slate-200 cursor-pointer"
            >
              Hadamard
            </button>
            <button
              onClick={() => onLoadPreset('ghzState')}
              className="px-2 py-0.5 rounded text-[11px] bg-white hover:bg-slate-100 text-slate-700 font-medium shadow-2xs border border-slate-200 cursor-pointer"
            >
              GHZ
            </button>
            <button
              onClick={() => onLoadPreset('swapCircuit')}
              className="px-2 py-0.5 rounded text-[11px] bg-white hover:bg-slate-100 text-slate-700 font-medium shadow-2xs border border-slate-200 cursor-pointer"
            >
              SWAP
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleAddQubit}
              disabled={circuit.numQubits >= 4}
              title="Add Qubit Wire (Max 4)"
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRemoveQubit}
              disabled={circuit.numQubits <= 1}
              title="Remove Qubit Wire"
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClearCircuit}
              title="Clear all gates"
              className="p-1.5 rounded-md border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="overflow-x-auto py-3 px-1">
        <div className="min-w-[540px]">
          {/* Step header markers */}
          <div className="flex items-center mb-2 pl-14">
            {Array.from({ length: stepsCount }).map((_, stepIdx) => (
              <div
                key={`step-head-${stepIdx}`}
                className="w-14 text-center text-[10px] font-mono text-slate-400 font-semibold"
              >
                t{stepIdx}
              </div>
            ))}
          </div>

          {/* Qubit wires */}
          <div className="space-y-6 relative">
            {Array.from({ length: circuit.numQubits }).map((_, qIdx) => (
              <div key={`qubit-wire-${qIdx}`} className="flex items-center relative h-12">
                {/* Qubit label */}
                <div
                  className={`w-14 flex items-center justify-between pr-3 flex-shrink-0 font-mono text-xs text-slate-800 select-none transition-all ${
                    highlightQubits ? 'scale-105 bg-indigo-50/90 rounded-md py-1' : ''
                  }`}
                >
                  <span className="font-bold">q{qIdx}</span>
                  <span
                    className={`text-[11px] px-1 py-0.5 rounded border font-medium transition-all ${
                      highlightQubits
                        ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse'
                        : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}
                  >
                    |0⟩
                  </span>
                </div>

                {/* Wire line */}
                <div className="absolute left-14 right-2 top-1/2 h-[2px] bg-slate-300 z-0"></div>

                {/* Step grid cells */}
                <div className="flex items-center relative z-10">
                  {Array.from({ length: stepsCount }).map((_, stepIdx) => {
                    const directGate = circuit.gates.find(
                      (g) => g.qubit === qIdx && g.step === stepIdx
                    );
                    const targetGate = circuit.gates.find(
                      (g) => g.targetQubit === qIdx && g.step === stepIdx
                    );
                    const isTargetHighlighted =
                      highlightCell && highlightCell.qubit === qIdx && highlightCell.step === stepIdx;
                    const isDragOver =
                      dragOverCell?.qubit === qIdx && dragOverCell?.step === stepIdx;
                    const hasGate = Boolean(directGate || targetGate);
                    const activeGateId = directGate?.id || targetGate?.id;
                    const isDraggingThis = Boolean(activeGateId && activeGateId === draggingGateId);

                    let buttonClass =
                      'w-9 h-9 rounded flex items-center justify-center font-mono font-bold text-xs transition-all relative select-none ';

                    if (isDraggingThis) {
                      buttonClass += 'opacity-30 ring-2 ring-indigo-400 bg-slate-200 text-transparent ';
                    } else if (isDragOver) {
                      buttonClass +=
                        'bg-indigo-100 border-2 border-indigo-500 ring-2 ring-indigo-300 text-indigo-700 animate-pulse cursor-copy ';
                    } else if (directGate) {
                      if (directGate.type === 'CX') {
                        buttonClass +=
                          'bg-slate-900 text-white shadow-xs ring-2 ring-slate-800 hover:ring-rose-400 hover:bg-slate-800 cursor-grab active:cursor-grabbing ';
                      } else if (directGate.type === 'SWAP') {
                        buttonClass +=
                          'bg-slate-800 text-cyan-200 shadow-xs border border-slate-700 hover:ring-2 hover:ring-rose-400 cursor-grab active:cursor-grabbing ';
                      } else if (directGate.type === 'M') {
                        buttonClass +=
                          'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 hover:ring-2 hover:ring-rose-400 cursor-grab active:cursor-grabbing ';
                      } else if (['Z', 'S', 'T'].includes(directGate.type)) {
                        buttonClass +=
                          'bg-slate-800 text-cyan-200 shadow-xs border border-slate-700 hover:ring-2 hover:ring-rose-400 cursor-grab active:cursor-grabbing ';
                      } else {
                        buttonClass +=
                          'bg-slate-900 text-white shadow-xs hover:bg-slate-800 hover:ring-2 hover:ring-rose-400 cursor-grab active:cursor-grabbing ';
                      }
                    } else if (targetGate) {
                      if (targetGate.type === 'CX') {
                        buttonClass +=
                          'bg-slate-900 text-cyan-300 shadow-xs border border-cyan-400/50 ring-1 ring-cyan-500/30 hover:ring-2 hover:ring-indigo-400 cursor-grab active:cursor-grabbing ';
                      } else if (targetGate.type === 'SWAP') {
                        buttonClass +=
                          'bg-slate-800 text-cyan-200 shadow-xs border border-slate-700 hover:ring-2 hover:ring-indigo-400 cursor-grab active:cursor-grabbing ';
                      } else {
                        buttonClass +=
                          'bg-slate-800 text-cyan-200 shadow-xs border border-slate-700 cursor-grab active:cursor-grabbing ';
                      }
                    } else if (isTargetHighlighted) {
                      buttonClass +=
                        'bg-indigo-50 border-2 border-indigo-500 ring-2 ring-indigo-400/50 text-indigo-700 animate-pulse cursor-pointer ';
                    } else {
                      buttonClass +=
                        'bg-white/80 hover:bg-slate-100 border border-transparent hover:border-slate-300 text-slate-300 hover:text-slate-500 cursor-pointer ';
                    }

                    const tooltip = directGate
                      ? `${directGate.type} gate. Click to remove, drag to move slot/wire.`
                      : targetGate
                      ? `Target of ${targetGate.type} from q${targetGate.qubit}. Click to cycle target wire, drag to move.`
                      : selectedGate
                      ? `Place ${selectedGate} gate here (or drag from palette)`
                      : 'Drag gate from palette or select gate to place';

                    return (
                      <div
                        key={`cell-${qIdx}-${stepIdx}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'copy';
                        }}
                        onDragEnter={() => setDragOverCell({ qubit: qIdx, step: stepIdx })}
                        onDragLeave={() => {
                          setDragOverCell((prev) =>
                            prev?.qubit === qIdx && prev?.step === stepIdx ? null : prev
                          );
                        }}
                        onDrop={(e) => handleDropOnCell(qIdx, stepIdx, e)}
                        className="w-14 h-12 flex items-center justify-center flex-shrink-0"
                      >
                        <button
                          type="button"
                          draggable={hasGate}
                          onDragStart={(e) => {
                            if (!hasGate) return;
                            const isTarget = Boolean(targetGate && !directGate);
                            const gateObj = directGate || targetGate;
                            if (!gateObj) return;
                            setDraggingGateId(gateObj.id);
                            e.dataTransfer.setData(
                              'text/plain',
                              JSON.stringify({
                                type: 'MOVE_GATE',
                                gateId: gateObj.id,
                                sourceQubit: qIdx,
                                sourceStep: stepIdx,
                                isTargetNode: isTarget,
                              })
                            );
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragEnd={() => setDraggingGateId(null)}
                          onClick={() => handleCellClick(qIdx, stepIdx)}
                          title={tooltip}
                          className={buttonClass}
                        >
                          {hasGate ? (
                            renderGateIcon(directGate, targetGate)
                          ) : isTargetHighlighted ? (
                            <span className="text-xs font-bold text-indigo-600">Click</span>
                          ) : (
                            <span className="text-[10px] opacity-0 hover:opacity-100 font-normal">+</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Connecting lines for CX and SWAP multi-qubit gates */}
            {circuit.gates
              .filter(
                (g) =>
                  (g.type === 'CX' || g.type === 'SWAP') &&
                  g.targetQubit !== undefined &&
                  g.targetQubit !== g.qubit
              )
              .map((g) => {
                const minQ = Math.min(g.qubit, g.targetQubit!);
                const maxQ = Math.max(g.qubit, g.targetQubit!);
                const topOffset = minQ * 72 + 24;
                const height = (maxQ - minQ) * 72;
                const leftOffset = 56 + g.step * 56 + 27;

                return (
                  <div
                    key={`multi-connector-${g.id}`}
                    style={{
                      position: 'absolute',
                      top: `${topOffset}px`,
                      left: `${leftOffset}px`,
                      height: `${height}px`,
                      width: '2px',
                    }}
                    className="bg-slate-900 pointer-events-none z-5"
                  />
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer Tools: Drag-to-Remove Trash Drop Zone & Time Step Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
        {/* Trash / Drag to Remove Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setIsDragOverTrash(true);
          }}
          onDragLeave={() => setIsDragOverTrash(false)}
          onDrop={handleDropOnTrash}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            isDragOverTrash
              ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-300'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
          title="Drag any gate here to delete"
        >
          <Trash2 className={`w-3.5 h-3.5 ${isDragOverTrash ? 'text-rose-600' : 'text-slate-400'}`} />
          <span className="text-[10px]">
            {isDragOverTrash ? 'Release to Delete Gate' : 'Drag gate here or click to remove'}
          </span>
        </div>

        {/* Instructions & Step Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-slate-500">
            <span className="flex items-center gap-1">
              <Move className="w-3 h-3 text-slate-400" />
              <span>Drag to move</span>
            </span>
            <span>•</span>
            <span>Click ⊕/✕ to cycle target wire</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            <button
              onClick={handleAddStep}
              disabled={circuit.steps >= 10}
              className="hover:text-slate-900 px-1 disabled:opacity-30 cursor-pointer font-bold"
              title="Add time slice (Max 10)"
            >
              +Step
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={handleRemoveStep}
              disabled={circuit.steps <= 4}
              className="hover:text-slate-900 px-1 disabled:opacity-30 cursor-pointer font-bold"
              title="Remove time slice (Min 4)"
            >
              -Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
