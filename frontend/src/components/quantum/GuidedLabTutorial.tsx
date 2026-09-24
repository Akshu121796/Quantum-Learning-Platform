import React from 'react';
import type { Circuit, GateType } from '../../types/quantum';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Play 
} from 'lucide-react';

export interface GuidedLabTutorialProps {
  circuit: Circuit;
  onUpdateCircuit: (circuit: Circuit) => void;
  onSelectGate: (gate: GateType) => void;
  onClose: () => void;
  currentStep: number;
  onChangeStep: (step: number) => void;
}

export const GuidedLabTutorial: React.FC<GuidedLabTutorialProps> = ({
  circuit,
  onUpdateCircuit,
  onSelectGate,
  onClose,
  currentStep,
  onChangeStep,
}) => {
  const hasHOnQ0 = circuit.gates.some((g) => g.type === 'H' && g.qubit === 0);
  const hasCX = circuit.gates.some((g) => g.type === 'CX' && g.qubit === 0 && g.targetQubit === 1);

  const handlePlaceH = () => {
    onSelectGate('H');
    const filtered = circuit.gates.filter((g) => !(g.qubit === 0 && g.step === 0));
    const newGate = {
      id: `gate-guided-h-${Date.now()}`,
      type: 'H' as GateType,
      qubit: 0,
      step: 0,
    };
    onUpdateCircuit({
      ...circuit,
      numQubits: Math.max(2, circuit.numQubits),
      gates: [...filtered, newGate],
    });
  };

  const handlePlaceCX = () => {
    onSelectGate('CX');
    const filtered = circuit.gates.filter((g) => !(g.step === 1));
    const newGate = {
      id: `gate-guided-cx-${Date.now()}`,
      type: 'CX' as GateType,
      qubit: 0,
      targetQubit: 1,
      step: 1,
    };
    onUpdateCircuit({
      ...circuit,
      numQubits: Math.max(2, circuit.numQubits),
      gates: [...filtered, newGate],
    });
  };

  const handleResetToGround = () => {
    onUpdateCircuit({
      ...circuit,
      numQubits: 2,
      gates: [],
    });
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-lg border border-indigo-500/30 mb-5 relative overflow-hidden">
      {/* Decorative subtle background elements */}
      <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/3 top-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-indigo-800/60 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-indigo-300">
                Guided Beginner Lab
              </span>
              <span className="bg-indigo-950/80 text-indigo-200 border border-indigo-700/50 text-[10px] font-mono px-2 py-0.5 rounded-full">
                Step {currentStep} of 3
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {currentStep === 1 && '1. Meet Quantum Bits (Qubits)'}
              {currentStep === 2 && '2. Create Superposition with the Hadamard (H) Gate'}
              {currentStep === 3 && '3. Entangle Qubits to Create a Bell State (CX Gate)'}
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          title="Exit Guided Lab"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Content */}
      <div className="space-y-3.5">
        {currentStep === 1 && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-3xl">
              In classical computing, bits are strictly <span className="font-mono font-bold text-cyan-300">0</span> or <span className="font-mono font-bold text-cyan-300">1</span>. 
              In quantum computing, our register starts with 2 qubits (<span className="font-mono text-indigo-200">q0, q1</span>) initialized in the ground state <span className="font-mono bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-700/60 text-cyan-300">|00⟩</span>. 
              Quantum gates allow us to manipulate their probabilities and quantum phases simultaneously.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetToGround}
                className="px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-mono text-indigo-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Initialize 2 Qubits in |00⟩</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeStep(2)}
                className="ml-auto px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Next: Add H Gate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-3xl">
              The <strong className="text-white">Hadamard (H) gate</strong> creates a quantum superposition. It transforms <span className="font-mono text-cyan-300">|0⟩</span> into <span className="font-mono text-cyan-300">|+⟩ = (|0⟩ + |1⟩)/√2</span>, giving an equal 50% probability of measuring 0 or 1.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handlePlaceH}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  hasHOnQ0
                    ? 'bg-emerald-600 text-white border border-emerald-500'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                }`}
              >
                {hasHOnQ0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>H Gate Placed on q0</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Place H Gate on q0 (Slot t0)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => onChangeStep(1)}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!hasHOnQ0) handlePlaceH();
                    onChangeStep(3);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Next: Add CX Gate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-3">
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed max-w-3xl">
              The <strong className="text-white">Controlled-NOT (CX) gate</strong> entangles wire <span className="font-mono text-cyan-300">q0</span> (control) with <span className="font-mono text-cyan-300">q1</span> (target). 
              Because q0 is in superposition, this creates the legendary <strong className="text-cyan-200">Bell State (|Φ⁺⟩ = (|00⟩ + |11⟩)/√2)</strong>. 
              The qubits are now entangled: measuring one instantly collapses the other!
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handlePlaceCX}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  hasCX
                    ? 'bg-emerald-600 text-white border border-emerald-500'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                }`}
              >
                {hasCX ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CX Entanglement Placed</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Place CX (q0 → q1)</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => onChangeStep(2)}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Ready! Click Simulate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-2 pt-3 mt-3 border-t border-indigo-800/40">
        {[1, 2, 3].map((stepNum) => (
          <button
            key={stepNum}
            onClick={() => onChangeStep(stepNum)}
            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
              currentStep === stepNum
                ? 'w-6 bg-cyan-400'
                : currentStep > stepNum
                ? 'bg-indigo-400'
                : 'bg-indigo-800'
            }`}
            aria-label={`Go to step ${stepNum}`}
          />
        ))}
      </div>
    </div>
  );
};
