import React, { useState } from 'react';
import type { SimulationResult, Circuit } from '../../types/quantum';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { 
  Clock, 
  Cpu, 
  CheckCircle2, 
  Hash, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  FlaskConical 
} from 'lucide-react';
import { StateVisualization } from './StateVisualization';

interface SimulationResultsProps {
  result: SimulationResult | null;
  isSimulating: boolean;
  circuit: Circuit;
  error?: string | null;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  result,
  isSimulating,
  circuit,
  error,
}) => {
  const [showWhyModal, setShowWhyModal] = useState(false);

  const getWhyExplanation = () => {
    const gates = circuit.gates;
    const hasH = gates.some((g) => g.type === 'H');
    const hasCX = gates.some((g) => g.type === 'CX');
    const hasX = gates.some((g) => g.type === 'X');
    const hasZ = gates.some((g) => g.type === 'Z');

    if (hasH && hasCX && circuit.numQubits >= 2) {
      return {
        title: 'Entangled Bell Pair Correlation (|Φ⁺⟩)',
        formula: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
        explanation: 'The Hadamard (H) gate puts qubit q0 into an equal superposition: (|0⟩ + |1⟩)/√2. The subsequent Controlled-NOT (CX) gate flips qubit q1 if and only if qubit q0 is in state |1⟩. This entangles the two qubits, meaning the system can only collapse into |00⟩ (~50%) or |11⟩ (~50%). States |01⟩ and |10⟩ have zero probability amplitude.',
      };
    }

    if (hasH && gates.length === 1) {
      return {
        title: 'Single-Qubit Symmetric Superposition (|+⟩)',
        formula: 'H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle',
        explanation: 'Applying the Hadamard gate to ground state |0⟩ rotates the Bloch vector into the X-basis equator. The resulting state carries equal probability amplitudes of 1/√2 for both |0⟩ and |1⟩. Under the Born rule (P = |α|²), measurement projects to 0 or 1 with exactly 50% theoretical probability each.',
      };
    }

    if (hasX && gates.length === 1) {
      return {
        title: 'Deterministic Bit-Flip (NOT)',
        formula: 'X|0\\rangle = |1\\rangle',
        explanation: 'The Pauli-X operator swaps computational basis amplitudes, completely inverting the input state from ground state |0⟩ to excited state |1⟩ with 100% deterministic probability.',
      };
    }

    if (hasZ) {
      return {
        title: 'Phase-Flip Transformation',
        formula: 'Z|1\\rangle = -|1\\rangle, \\quad Z|0\\rangle = |0\\rangle',
        explanation: 'The Pauli-Z gate applies a relative phase shift of π radians (multiplying the |1⟩ component by -1). In computational basis measurement, phase does not alter raw state probabilities (|−1|² = 1), but governs interference patterns in multi-gate sequences.',
      };
    }

    return {
      title: 'Unitary Statevector Evolution',
      formula: '|\\psi_{final}\\rangle = U_n \\dots U_1 |0\\dots0\\rangle',
      explanation: `The circuit applies a sequence of ${gates.length} discrete unitary matrix transformations to the ${circuit.numQubits}-qubit initial ground state |0...0⟩. Measurement in the computational basis collapses the quantum superposition to observable bitstrings according to their squared complex amplitudes.`,
    };
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-8 text-center text-rose-700 shadow-xs">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="text-sm font-semibold">Simulation Error</p>
        <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">{error}</p>
        <p className="text-[11px] text-slate-400 mt-3 font-mono">
          Ensure FastAPI backend is running on http://127.0.0.1:8000
        </p>
      </div>
    );
  }

  if (isSimulating) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-800">Simulating Circuit on Backend...</p>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Evaluating unitary operator product & sampling projective measurement registers
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <FlaskConical className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Ready for Simulation</p>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Configure backend and shots on the right panel, then click <strong className="text-slate-800 font-semibold">Simulate</strong> to run quantum execution on the real simulator.
        </p>
      </div>
    );
  }

  const chartData = Object.entries(result.probabilities).map(([state, prob]) => ({
    state: `|${state}⟩`,
    probability: Number((prob * 100).toFixed(2)),
    count: result.counts[state] || 0,
    rawProb: prob,
  }));

  const dominantStates = chartData.filter((d) => d.probability > 10);
  const whyInfo = getWhyExplanation();

  return (
    <div className="space-y-4">
      {/* Experiment Report Header & Why Tool */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Experiment Report
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Verified Run
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {result.backend} • {result.shots} shots • {result.executionTimeMs} ms
              </p>
            </div>
          </div>

          {/* Interactive "Why?" Button */}
          <button
            type="button"
            onClick={() => setShowWhyModal(!showWhyModal)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              showWhyModal
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Why did this occur?</span>
            {showWhyModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable "Why?" Diagnostic Explanation Drawer */}
        {showWhyModal && (
          <div className="mt-3 p-3.5 bg-slate-900 text-slate-200 rounded-lg border border-slate-800 animate-in fade-in duration-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-300 font-mono text-[11px]">
                {whyInfo.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Circuit Analysis</span>
            </div>
            {whyInfo.formula && (
              <div className="p-2 bg-slate-950 rounded text-cyan-200 font-mono text-[11px] border border-slate-800 shadow-inner">
                {whyInfo.formula}
              </div>
            )}
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {whyInfo.explanation}
            </p>
          </div>
        )}

        {/* Experiment Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block font-mono">Target Backend</span>
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
              <Cpu className="w-3.5 h-3.5 text-slate-600" />
              {result.backend}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block font-mono">Total Shots</span>
            <span className="text-xs font-mono font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
              <Hash className="w-3.5 h-3.5 text-slate-600" />
              {result.shots.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block font-mono">Execution Latency</span>
            <span className="text-xs font-mono font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              {result.executionTimeMs} ms
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase tracking-wide block font-mono">Circuit Depth</span>
            <span className="text-xs font-mono font-semibold text-emerald-800 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {result.circuitDepth} steps
            </span>
          </div>
        </div>
      </div>

      {/* Measurement Probability Histogram */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span>Measurement Distribution</span>
              <span className="text-[10px] text-slate-500 font-mono font-normal">(Born Rule)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Projective measurement outcome frequencies across {result.shots} repetitions
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
            <span>Σ P = 1.000</span>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="state"
                tick={{ fontSize: 12, fontFamily: 'IBM Plex Mono, monospace', fill: '#1e293b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                unit="%"
                domain={[0, 100]}
                tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2.5 rounded shadow-lg text-xs font-mono border border-slate-800">
                        <p className="font-bold text-cyan-300">Eigenstate: {d.state}</p>
                        <p className="mt-1 text-slate-100">Probability: {d.probability}%</p>
                        <p className="text-slate-400 text-[11px]">Counts: {d.count} / {result.shots}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.probability > 0.1 ? '#0f172a' : '#94a3b8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Observed Dominant Outcomes Breakdown */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-1 border-t border-slate-100 text-xs font-mono">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">Observed Counts:</span>
          {dominantStates.map((d) => (
            <div key={d.state} className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              <span className="font-bold text-slate-900">{d.state}:</span>
              <span className="text-slate-800 font-semibold">{d.probability}%</span>
              <span className="text-slate-500 text-[10px]">({d.count} shots)</span>
            </div>
          ))}
        </div>
      </div>

      {/* State Vector & Hilbert Space Visualizer */}
      <StateVisualization
        stateVector={result.stateVector}
        numQubits={result.qubitCount}
      />
    </div>
  );
};
