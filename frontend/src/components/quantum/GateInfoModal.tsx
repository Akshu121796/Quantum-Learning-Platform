import React from 'react';
import type { GateType } from '../../types/quantum';
import { X, Sparkles, BookOpen, Lightbulb, Binary } from 'lucide-react';

interface GateExplainerData {
  name: string;
  symbol: string;
  category: string;
  whatItDoes: string;
  whyItIsUsed: string;
  tinyExample: string;
  matrixLatex: string;
}

export const GATE_EXPLANATIONS: Record<GateType, GateExplainerData> = {
  H: {
    name: 'Hadamard Gate',
    symbol: 'H',
    category: 'Single-Qubit Superposition',
    whatItDoes: 'Puts a definitive qubit state into an equal quantum superposition of |0⟩ and |1⟩ with equal 50% measurement probabilities.',
    whyItIsUsed: 'The foundational starting gate for almost all quantum algorithms (QFT, Grover, Shor) to explore computational paths simultaneously.',
    tinyExample: 'H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩   •   H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩',
    matrixLatex: '1/√2 [[1, 1], [1, -1]]',
  },
  X: {
    name: 'Pauli-X Gate (NOT)',
    symbol: 'X',
    category: 'Single-Qubit Bit-Flip',
    whatItDoes: 'Acts as the quantum NOT gate. Performs a 180° rotation around the X-axis of the Bloch sphere, flipping |0⟩ to |1⟩ and |1⟩ to |0⟩.',
    whyItIsUsed: 'Used to initialize qubits into state |1⟩, invert logical states, and implement conditional bit-flip controls.',
    tinyExample: 'X|0⟩ = |1⟩   •   X|1⟩ = |0⟩',
    matrixLatex: '[[0, 1], [1, 0]]',
  },
  Y: {
    name: 'Pauli-Y Gate',
    symbol: 'Y',
    category: 'Single-Qubit Bit & Phase Flip',
    whatItDoes: 'Flips both the computational bit and introduces an imaginary complex relative phase (±i).',
    whyItIsUsed: 'Essential for general 3D rotations on the Bloch sphere, error correction syndromes, and quantum simulation Hamiltonians.',
    tinyExample: 'Y|0⟩ = i|1⟩   •   Y|1⟩ = -i|0⟩',
    matrixLatex: '[[0, -i], [i, 0]]',
  },
  Z: {
    name: 'Pauli-Z Gate (Phase Flip)',
    symbol: 'Z',
    category: 'Single-Qubit Phase',
    whatItDoes: 'Leaves the ground state |0⟩ unchanged while multiplying the excited state |1⟩ amplitude by -1 (a 180° phase flip).',
    whyItIsUsed: 'Powers quantum interference and phase kickback in algorithms like Grover search and Deutsch-Jozsa.',
    tinyExample: 'Z|0⟩ = |0⟩   •   Z|1⟩ = -|1⟩   •   Z|+⟩ = |-⟩',
    matrixLatex: '[[1, 0], [0, -1]]',
  },
  S: {
    name: 'Phase Gate (S / √Z)',
    symbol: 'S',
    category: 'Single-Qubit Phase (90°)',
    whatItDoes: 'Applies a 90° (π/2 radians) phase rotation to state |1⟩ around the Z-axis (S² = Z).',
    whyItIsUsed: 'Core member of the Clifford group, fundamental to Quantum Fourier Transforms and fault-tolerant synthesis.',
    tinyExample: 'S|0⟩ = |0⟩   •   S|1⟩ = i|1⟩',
    matrixLatex: '[[1, 0], [0, i]]',
  },
  T: {
    name: 'T-Gate (π/8 / ∜Z)',
    symbol: 'T',
    category: 'Single-Qubit Non-Clifford Phase',
    whatItDoes: 'Applies a precise 45° (π/4 radians) phase rotation to state |1⟩ around the Z-axis (T⁴ = Z).',
    whyItIsUsed: 'The "magic gate" providing universality: combining H, S, CX, and T enables execution of ANY quantum algorithm.',
    tinyExample: 'T|0⟩ = |0⟩   •   T|1⟩ = e^(iπ/4)|1⟩',
    matrixLatex: '[[1, 0], [0, e^(iπ/4)]]',
  },
  CX: {
    name: 'Controlled-NOT (CNOT)',
    symbol: 'CX',
    category: 'Multi-Qubit Entanglement',
    whatItDoes: 'Checks the control qubit: if control is in |1⟩, it flips the target qubit; otherwise, the target qubit is untouched.',
    whyItIsUsed: 'The primary two-qubit entangling operation. Forms Bell states, GHZ states, and quantum teleportation circuits.',
    tinyExample: 'CX|00⟩ = |00⟩   •   CX|10⟩ = |11⟩   •   CX(|+⟩|0⟩) = (|00⟩+|11⟩)/√2',
    matrixLatex: '[[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]',
  },
  SWAP: {
    name: 'SWAP Gate',
    symbol: 'SWAP',
    category: 'Multi-Qubit Permutation',
    whatItDoes: 'Exchanges the complete quantum states of two separate qubits (|ψ⟩|ϕ⟩ → |ϕ⟩|ψ⟩).',
    whyItIsUsed: 'Crucial for routing quantum information across physical quantum processors with limited qubit connectivity.',
    tinyExample: 'SWAP|01⟩ = |10⟩   •   SWAP|10⟩ = |01⟩',
    matrixLatex: '[[1,0,0,0], [0,0,1,0], [0,1,0,0], [0,0,0,1]]',
  },
  M: {
    name: 'Measurement',
    symbol: 'M',
    category: 'Quantum State Collapse',
    whatItDoes: 'Forces the quantum superposition to collapse into a definitive classical bit (0 or 1) with probability P = |amplitude|².',
    whyItIsUsed: 'Extracts the final computational answer from the quantum processor into classical memory.',
    tinyExample: 'Measuring (|0⟩+|1⟩)/√2 yields "0" (50%) or "1" (50%) and collapses the state.',
    matrixLatex: 'P(0) = |⟨0|ψ⟩|²,  P(1) = |⟨1|ψ⟩|²',
  },
};

interface GateInfoModalProps {
  gateType: GateType | null;
  onClose: () => void;
  onSelectAndClose?: (gate: GateType) => void;
}

export const GateInfoModal: React.FC<GateInfoModalProps> = ({
  gateType,
  onClose,
  onSelectAndClose,
}) => {
  if (!gateType) return null;

  const info = GATE_EXPLANATIONS[gateType] || {
    name: `${gateType} Gate`,
    symbol: gateType,
    category: 'Quantum Operation',
    whatItDoes: 'Applies a unitary transformation to the quantum state.',
    whyItIsUsed: 'Standard quantum computational operation.',
    tinyExample: `${gateType}|0⟩`,
    matrixLatex: 'Unitary matrix',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
              {info.symbol}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{info.name}</h3>
              <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
                {info.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs text-slate-700">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-600" />
              <span>What it does</span>
            </div>
            <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-100">
              {info.whatItDoes}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Why it is used</span>
            </div>
            <p className="text-slate-600 leading-relaxed bg-amber-50/50 p-2.5 rounded-md border border-amber-100/60">
              {info.whyItIsUsed}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <Binary className="w-3.5 h-3.5 text-slate-600" />
              <span>Tiny Example</span>
            </div>
            <div className="p-2 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-md overflow-x-auto">
              {info.tinyExample}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-500" />
              <span>Matrix Transformation</span>
            </div>
            <div className="p-2 bg-slate-100 text-slate-800 font-mono text-[10px] rounded-md border border-slate-200 overflow-x-auto">
              {info.matrixLatex}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          {onSelectAndClose && (
            <button
              type="button"
              onClick={() => {
                onSelectAndClose(gateType);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer shadow-xs"
            >
              Select {info.symbol} Gate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
