import React from 'react';
import type { Circuit, GateType } from '../../types/quantum';
import { Lightbulb, Info, Atom, Link2, Waves, ArrowRightLeft } from 'lucide-react';

interface BeginnerExplainerBarProps {
  circuit: Circuit;
  selectedGate: GateType | null;
  onClose?: () => void;
}

export const BeginnerExplainerBar: React.FC<BeginnerExplainerBarProps> = ({
  circuit,
  selectedGate,
}) => {
  const gates = circuit.gates;
  const hasH = gates.some((g) => g.type === 'H');
  const hasCX = gates.some((g) => g.type === 'CX');
  const hasX = gates.some((g) => g.type === 'X');
  const hasZ = gates.some((g) => g.type === 'Z');
  const hasSWAP = gates.some((g) => g.type === 'SWAP');

  const getExplanation = () => {
    if (gates.length === 0) {
      return {
        icon: <Atom className="w-4 h-4 text-slate-600" />,
        title: 'Ground State |00...0⟩',
        tag: 'INITIAL STATE',
        description: `Your ${circuit.numQubits}-qubit register is in the ground state. If simulated now, measurement will yield all zeros with 100% certainty. Select a gate from the palette on the left (like Hadamard H) to begin creating quantum states.`,
      };
    }

    if (hasH && hasCX && circuit.numQubits >= 2) {
      return {
        icon: <Link2 className="w-4 h-4 text-indigo-600" />,
        title: 'Quantum Entanglement (Bell State |Φ⁺⟩)',
        tag: 'ENTANGLEMENT',
        description: 'Wire q0 is put into a 50/50 superposition by the H gate, and then linked to q1 via the CX gate. The qubits are now entangled: when you simulate, measurement will result in |00⟩ (~50%) or |11⟩ (~50%), and never |01⟩ or |10⟩.',
      };
    }

    if (hasH && !hasCX) {
      return {
        icon: <Waves className="w-4 h-4 text-cyan-600" />,
        title: 'Quantum Superposition',
        tag: 'SUPERPOSITION',
        description: 'You have placed a Hadamard (H) gate, putting qubit(s) into an equal superposition. Measurement will randomly collapse the state into 0 or 1 with equal 50% probability upon execution.',
      };
    }

    if (hasX && !hasH) {
      return {
        icon: <ArrowRightLeft className="w-4 h-4 text-amber-600" />,
        title: 'Bit-Flip Operation (NOT)',
        tag: 'DETERMINISTIC BIT-FLIP',
        description: 'You have applied a Pauli-X gate, which flips state |0⟩ to state |1⟩. Measurement will yield state |1⟩ with 100% deterministic fidelity.',
      };
    }

    if (hasSWAP) {
      return {
        icon: <ArrowRightLeft className="w-4 h-4 text-emerald-600" />,
        title: 'Qubit State Exchange (SWAP)',
        tag: 'SWAP',
        description: 'You are swapping the quantum wavefunctions between two qubit wires, routing quantum information without physical wire re-routing.',
      };
    }

    if (hasZ) {
      return {
        icon: <Waves className="w-4 h-4 text-purple-600" />,
        title: 'Quantum Phase Manipulation',
        tag: 'PHASE SHIFT',
        description: 'You have applied a Pauli-Z phase-flip gate. This changes the quantum wave sign of state |1⟩ to -|1⟩, enabling destructive and constructive quantum interference.',
      };
    }

    return {
      icon: <Info className="w-4 h-4 text-slate-600" />,
      title: `${circuit.name} (${gates.length} Gates)`,
      tag: 'MULTI-GATE PIPELINE',
      description: `This circuit executes ${gates.length} sequential quantum operations. Each gate performs a unitary rotation in Hilbert space, altering the measurement probability distribution.`,
    };
  };

  const exp = getExplanation();

  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 sm:p-3.5 text-xs text-slate-800 shadow-2xs mb-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-2.5">
        <div className="p-1.5 rounded-md bg-amber-100/80 text-amber-900 flex-shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              {exp.icon}
              {exp.title}
            </span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
              {exp.tag}
            </span>
            {selectedGate && (
              <span className="text-[10px] text-slate-500 font-mono">
                • Active gate: <strong className="text-slate-800">{selectedGate}</strong>
              </span>
            )}
          </div>
          <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
            {exp.description}
          </p>
        </div>
      </div>
    </div>
  );
};
