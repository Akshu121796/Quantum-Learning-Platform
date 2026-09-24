import React, { useState } from 'react';
import type { Circuit } from '../../types/quantum';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Zap, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export interface CircuitIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'invalid_target' | 'cancelling_gates' | 'missing_measurement' | 'post_measurement' | 'collision' | 'redundant';
  problem: string;
  reason: string;
  suggestedFix: string;
  isOptimizable: boolean;
  affectedGateIds?: string[];
}

export interface CircuitAnalysisPanelProps {
  circuit: Circuit;
  onUpdateCircuit: (circuit: Circuit) => void;
}

/**
 * Analyzes the active circuit for structural, quantum logic, and efficiency issues.
 */
export function analyzeCircuit(circuit: Circuit): CircuitIssue[] {
  const issues: CircuitIssue[] = [];
  const gates = circuit.gates;
  const numQubits = circuit.numQubits;

  if (gates.length === 0) {
    return issues;
  }

  // 1. Invalid CX / SWAP targets (self-targeting or out of bounds)
  gates.forEach((g) => {
    if (g.type === 'CX' || g.type === 'SWAP') {
      if (g.targetQubit === undefined || g.targetQubit === g.qubit) {
        issues.push({
          id: `invalid-target-${g.id}`,
          severity: 'error',
          category: 'invalid_target',
          problem: `Invalid ${g.type} Target on Wire q${g.qubit} (step t${g.step})`,
          reason: `Control and target qubits must be on distinct wires. Currently both are set to q${g.qubit}.`,
          suggestedFix: `Change target wire index to a different qubit or click 'Apply Optimization' to auto-remove.`,
          isOptimizable: true,
          affectedGateIds: [g.id],
        });
      } else if (g.targetQubit >= numQubits) {
        issues.push({
          id: `out-of-bounds-${g.id}`,
          severity: 'error',
          category: 'invalid_target',
          problem: `Target Qubit Out of Range (q${g.targetQubit} at step t${g.step})`,
          reason: `Circuit register has only ${numQubits} qubit(s) (indices q0 to q${numQubits - 1}), so wire q${g.targetQubit} does not exist.`,
          suggestedFix: `Adjust target wire index to be within range 0..${numQubits - 1} or click 'Apply Optimization' to auto-remove.`,
          isOptimizable: true,
          affectedGateIds: [g.id],
        });
      }
    }
  });

  // 2. Time-Slice Wire Collisions (two gates on same qubit wire & same step)
  for (let i = 0; i < gates.length - 1; i++) {
    for (let j = i + 1; j < gates.length; j++) {
      const g1 = gates[i];
      const g2 = gates[j];
      if (g1.step === g2.step) {
        const wires1 = [g1.qubit, ...(g1.targetQubit !== undefined ? [g1.targetQubit] : [])];
        const wires2 = [g2.qubit, ...(g2.targetQubit !== undefined ? [g2.targetQubit] : [])];
        const overlappingWire = wires1.find((w) => wires2.includes(w));

        if (overlappingWire !== undefined) {
          issues.push({
            id: `collision-${g1.id}-${g2.id}`,
            severity: 'error',
            category: 'collision',
            problem: `Time-Slice Wire Collision on Wire q${overlappingWire} (step t${g1.step})`,
            reason: `Multiple operations (${g1.type} and ${g2.type}) are scheduled in the same column on wire q${overlappingWire}.`,
            suggestedFix: `Shift one of the gates to the next step column.`,
            isOptimizable: true,
            affectedGateIds: [g1.id, g2.id],
          });
        }
      }
    }
  }

  // 3. Post-Measurement Operations
  const measurementGates = gates.filter((g) => g.type === 'M');
  measurementGates.forEach((mGate) => {
    const postGates = gates.filter(
      (g) => (g.qubit === mGate.qubit || g.targetQubit === mGate.qubit) && g.step > mGate.step && g.type !== 'M'
    );

    postGates.forEach((postGate) => {
      issues.push({
        id: `post-measure-${postGate.id}`,
        severity: 'error',
        category: 'post_measurement',
        problem: `Operation After Measurement on Wire q${mGate.qubit} (step t${postGate.step})`,
        reason: `Gate ${postGate.type} at step t${postGate.step} follows Measurement (M) at step t${mGate.step}. Projective measurement collapses the quantum state vector, making subsequent coherent unitary operations ineffective.`,
        suggestedFix: `Remove gate ${postGate.type} or click 'Apply Optimization' to auto-remove post-measurement operations.`,
        isOptimizable: true,
        affectedGateIds: [postGate.id],
      });
    });
  });

  // 4. Duplicate / Cancelling Gates (H -> H, X -> X, Y -> Y, Z -> Z, SWAP -> SWAP)
  // Group single-qubit gates by wire and sort by step
  for (let q = 0; q < numQubits; q++) {
    const wireGates = gates
      .filter((g) => g.qubit === q && !['CX', 'SWAP', 'M'].includes(g.type))
      .sort((a, b) => a.step - b.step);

    for (let i = 0; i < wireGates.length - 1; i++) {
      const g1 = wireGates[i];
      const g2 = wireGates[i + 1];

      // Check if they are adjacent with no intervening multi-qubit gate on this wire
      if (g1.type === g2.type && ['H', 'X', 'Y', 'Z'].includes(g1.type)) {
        const hasIntervening = gates.some(
          (g) =>
            (g.qubit === q || g.targetQubit === q) &&
            g.step > g1.step &&
            g.step < g2.step
        );

        if (!hasIntervening) {
          issues.push({
            id: `cancelling-${g1.id}-${g2.id}`,
            severity: 'warning',
            category: 'cancelling_gates',
            problem: `Cancelling Gate Pair: ${g1.type} → ${g2.type} on Wire q${q} (steps t${g1.step}, t${g2.step})`,
            reason: `Applying two consecutive ${g1.type} gates on the same wire rotates the state vector by 360°, returning it to the original state (${g1.type}² = I).`,
            suggestedFix: `Remove both ${g1.type} gates or click 'Apply Optimization' to auto-clean.`,
            isOptimizable: true,
            affectedGateIds: [g1.id, g2.id],
          });
        }
      }
    }
  }

  // 5. Duplicate / Cancelling SWAP pairs
  const swapGates = gates.filter((g) => g.type === 'SWAP' && g.targetQubit !== undefined).sort((a, b) => a.step - b.step);
  for (let i = 0; i < swapGates.length - 1; i++) {
    const s1 = swapGates[i];
    const s2 = swapGates[i + 1];
    const samePair =
      (s1.qubit === s2.qubit && s1.targetQubit === s2.targetQubit) ||
      (s1.qubit === s2.targetQubit && s1.targetQubit === s2.qubit);

    if (samePair) {
      const hasIntervening = gates.some(
        (g) =>
          (g.qubit === s1.qubit || g.qubit === s1.targetQubit || g.targetQubit === s1.qubit || g.targetQubit === s1.targetQubit) &&
          g.step > s1.step &&
          g.step < s2.step
      );

      if (!hasIntervening) {
        issues.push({
          id: `cancelling-swap-${s1.id}-${s2.id}`,
          severity: 'warning',
          category: 'cancelling_gates',
          problem: `Cancelling SWAP Pair on Wires q${s1.qubit} & q${s1.targetQubit} (steps t${s1.step}, t${s2.step})`,
          reason: `Swapping quantum states twice between the same two wires returns them to their original configuration (SWAP² = I).`,
          suggestedFix: `Remove both SWAP gates or click 'Apply Optimization' to auto-clean.`,
          isOptimizable: true,
          affectedGateIds: [s1.id, s2.id],
        });
      }
    }
  }

  // 6. Missing Measurement
  const hasAnyGates = gates.length > 0;
  const hasAnyMeasurement = measurementGates.length > 0;

  if (hasAnyGates && !hasAnyMeasurement) {
    issues.push({
      id: 'missing-measurement-all',
      severity: 'warning',
      category: 'missing_measurement',
      problem: `Missing Measurement (M) Gates Across Circuit`,
      reason: `Without Measurement (M) gates, the quantum state vector cannot be sampled into computational basis probability counts.`,
      suggestedFix: `Add Measurement (M) gates to active wires or click 'Apply Optimization' to auto-append.`,
      isOptimizable: true,
    });
  } else if (hasAnyMeasurement) {
    // Check for partial unmeasured active wires
    const activeUnmeasuredWires: number[] = [];
    for (let q = 0; q < numQubits; q++) {
      const hasGatesOnWire = gates.some((g) => g.qubit === q || g.targetQubit === q);
      const hasMeasurementOnWire = measurementGates.some((g) => g.qubit === q);
      if (hasGatesOnWire && !hasMeasurementOnWire) {
        activeUnmeasuredWires.push(q);
      }
    }

    if (activeUnmeasuredWires.length > 0) {
      issues.push({
        id: 'missing-measurement-partial',
        severity: 'info',
        category: 'missing_measurement',
        problem: `Partial Measurement: Unmeasured Wire(s) ${activeUnmeasuredWires.map((w) => `q${w}`).join(', ')}`,
        reason: `Wire(s) ${activeUnmeasuredWires.map((w) => `q${w}`).join(', ')} contain operations but lack Measurement gates. During execution, their states will be traced out.`,
        suggestedFix: `Add Measurement (M) gates to wire(s) ${activeUnmeasuredWires.map((w) => `q${w}`).join(', ')} or click 'Apply Optimization'.`,
        isOptimizable: true,
      });
    }
  }

  return issues;
}

/**
 * Optimizes the active circuit by automatically removing safe redundant/cancelling gates,
 * fixing invalid targets, removing post-measurement operations, and compacting step depth.
 */
export function optimizeCircuit(circuit: Circuit): {
  optimizedCircuit: Circuit;
  summary: string;
  removedCount: number;
} {
  let gates = [...circuit.gates];
  const initialGateCount = gates.length;

  // 1. Remove invalid CX / SWAP gates (self-targeting or out of range)
  gates = gates.filter((g) => {
    if (g.type === 'CX' || g.type === 'SWAP') {
      if (g.targetQubit === undefined || g.targetQubit === g.qubit || g.targetQubit >= circuit.numQubits) {
        return false;
      }
    }
    return true;
  });

  // 2. Remove post-measurement gates on wires
  const measurementGates = gates.filter((g) => g.type === 'M');
  gates = gates.filter((g) => {
    if (g.type === 'M') return true;
    const mOnWire = measurementGates.find((m) => m.qubit === g.qubit || m.targetQubit === g.qubit);
    if (mOnWire && g.step > mOnWire.step) {
      return false;
    }
    return true;
  });

  // 3. Iteratively remove adjacent self-cancelling single-qubit gates (H->H, X->X, Y->Y, Z->Z)
  let changed = true;
  while (changed) {
    changed = false;
    for (let q = 0; q < circuit.numQubits; q++) {
      const wireGates = gates
        .filter((g) => g.qubit === q && ['H', 'X', 'Y', 'Z'].includes(g.type))
        .sort((a, b) => a.step - b.step);

      for (let i = 0; i < wireGates.length - 1; i++) {
        const g1 = wireGates[i];
        const g2 = wireGates[i + 1];

        if (g1.type === g2.type) {
          const hasIntervening = gates.some(
            (g) =>
              (g.qubit === q || g.targetQubit === q) &&
              g.step > g1.step &&
              g.step < g2.step
          );

          if (!hasIntervening) {
            gates = gates.filter((g) => g.id !== g1.id && g.id !== g2.id);
            changed = true;
            break;
          }
        }
      }
      if (changed) break;
    }
  }

  // 4. Iteratively remove adjacent cancelling SWAP pairs
  changed = true;
  while (changed) {
    changed = false;
    const swapGates = gates.filter((g) => g.type === 'SWAP' && g.targetQubit !== undefined).sort((a, b) => a.step - b.step);

    for (let i = 0; i < swapGates.length - 1; i++) {
      const s1 = swapGates[i];
      const s2 = swapGates[i + 1];
      const samePair =
        (s1.qubit === s2.qubit && s1.targetQubit === s2.targetQubit) ||
        (s1.qubit === s2.targetQubit && s1.targetQubit === s2.qubit);

      if (samePair) {
        const hasIntervening = gates.some(
          (g) =>
            (g.qubit === s1.qubit || g.qubit === s1.targetQubit || g.targetQubit === s1.qubit || g.targetQubit === s1.targetQubit) &&
            g.step > s1.step &&
            g.step < s2.step
        );

        if (!hasIntervening) {
          gates = gates.filter((g) => g.id !== s1.id && g.id !== s2.id);
          changed = true;
          break;
        }
      }
    }
  }

  // 5. Append Measurement (M) gates to active unmeasured wires if measurement is missing
  if (gates.length > 0) {
    const existingM = gates.filter((g) => g.type === 'M');
    for (let q = 0; q < circuit.numQubits; q++) {
      const hasGates = gates.some((g) => g.qubit === q || g.targetQubit === q);
      const hasM = existingM.some((g) => g.qubit === q);
      if (hasGates && !hasM) {
        const maxStepOnWire = Math.max(...gates.filter((g) => g.qubit === q || g.targetQubit === q).map((g) => g.step));
        gates.push({
          id: `opt-m-${q}-${Date.now()}`,
          type: 'M',
          qubit: q,
          step: maxStepOnWire + 1,
        });
      }
    }
  }

  // 6. Compact step indices so circuit depth is minimized
  const usedSteps = Array.from(new Set(gates.map((g) => g.step))).sort((a, b) => a - b);
  const stepMap = new Map<number, number>();
  usedSteps.forEach((oldStep, newStep) => {
    stepMap.set(oldStep, newStep);
  });

  const compactGates = gates.map((g) => ({
    ...g,
    step: stepMap.get(g.step) ?? g.step,
  }));

  const removedCount = Math.max(0, initialGateCount - compactGates.length);
  const newStepsCount = compactGates.length > 0 ? Math.max(...compactGates.map((g) => g.step)) + 1 : circuit.steps;

  const summary = removedCount > 0
    ? `Successfully removed ${removedCount} redundant/cancelling gate(s) and reduced depth to ${newStepsCount} step(s).`
    : `Compacted circuit schedule and appended missing measurement gates. Total depth: ${newStepsCount} step(s).`;

  return {
    optimizedCircuit: {
      ...circuit,
      steps: Math.max(6, newStepsCount),
      gates: compactGates,
    },
    summary,
    removedCount,
  };
}

export const CircuitAnalysisPanel: React.FC<CircuitAnalysisPanelProps> = ({
  circuit,
  onUpdateCircuit,
}) => {
  const issues = analyzeCircuit(circuit);
  const [optToast, setOptToast] = useState<string | null>(null);

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');
  const hasOptimizable = issues.some((i) => i.isOptimizable);

  const handleApplyOptimization = () => {
    const { optimizedCircuit, summary } = optimizeCircuit(circuit);
    onUpdateCircuit(optimizedCircuit);
    setOptToast(summary);
    setTimeout(() => setOptToast(null), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            errors.length > 0
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : warnings.length > 0
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            {errors.length > 0 ? (
              <AlertOctagon className="w-4 h-4" />
            ) : warnings.length > 0 ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Circuit Analysis & Optimization
              </h3>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                {errors.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded font-semibold">
                    {errors.length} Error{errors.length > 1 ? 's' : ''}
                  </span>
                )}
                {warnings.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded font-semibold">
                    {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
                  </span>
                )}
                {errors.length === 0 && warnings.length === 0 && (
                  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-semibold">
                    Optimal
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Real-time gate verification, target validation, and depth optimization
            </p>
          </div>
        </div>

        {/* Action Button: Apply Optimization */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyOptimization}
            disabled={circuit.gates.length === 0}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              hasOptimizable || circuit.gates.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 active:scale-95'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
            }`}
            title="Automatically remove cancelling gates, post-measurement operations, and optimize depth"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Apply Optimization</span>
          </button>
        </div>
      </div>

      {/* Optimization Notification Toast */}
      {optToast && (
        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{optToast}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700">Circuit Updated</span>
        </div>
      )}

      {/* Content Area */}
      <div className="mt-3 space-y-2">
        {circuit.gates.length === 0 ? (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>
              Your circuit is currently empty. Place gates on the canvas to run real-time error detection and depth optimization analysis.
            </span>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-lg flex items-start gap-3 text-xs text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900">Circuit Topology Clean & Optimal</p>
              <p className="text-[11px] text-emerald-800/90 mt-0.5">
                No cancelling gate pairs ($H \to H$, $X \to X$), invalid $CX/SWAP$ targets, post-measurement operations, or time-slice wire collisions detected across your {circuit.gates.length} gate(s).
              </p>
            </div>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded-lg border text-xs transition-all ${
                issue.severity === 'error'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : issue.severity === 'warning'
                  ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                  : 'bg-blue-50/50 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 font-bold">
                  {issue.severity === 'error' ? (
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  ) : issue.severity === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  )}
                  <span className="text-slate-900 font-semibold">{issue.problem}</span>
                </div>

                {issue.isOptimizable && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex-shrink-0">
                    Auto-Fixable
                  </span>
                )}
              </div>

              <div className="space-y-1 pl-5 text-[11px] text-slate-700">
                <p>
                  <strong className="text-slate-800 font-medium">Reason:</strong> {issue.reason}
                </p>
                <p className="text-indigo-900 font-medium flex items-center gap-1 pt-0.5">
                  <ArrowRight className="w-3 h-3 text-indigo-600 flex-shrink-0" />
                  <span>
                    <strong className="text-indigo-950 font-bold">Suggested Fix:</strong> {issue.suggestedFix}
                  </span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
