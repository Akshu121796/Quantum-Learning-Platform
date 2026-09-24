import type { Circuit, SimulationResult, GateType, SimulationConfig } from '../types/quantum';

export type { GateType };

export interface TutorContextPayload {
  circuit: Circuit;
  simulationResult?: SimulationResult | null;
  activeGate?: GateType | null;
  config?: SimulationConfig;
}

export type TutorActionType = 
  | 'explain_circuit' 
  | 'explain_gate' 
  | 'explain_result' 
  | 'find_mistakes' 
  | 'optimize_circuit' 
  | 'give_hint';

export interface TutorQueryRequest {
  prompt?: string;
  actionType?: TutorActionType;
  context: TutorContextPayload;
}

export interface TutorQueryResponse {
  text: string;
  suggestedNextActions?: string[];
  latexNotation?: string;
  category: 'explanation' | 'diagnostic' | 'optimization' | 'hint' | 'general';
}

export const tutorApi = {
  async askTutor(request: TutorQueryRequest): Promise<TutorQueryResponse> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const { actionType, prompt = '', context } = request;
    const circuit = context.circuit;
    const result = context.simulationResult;
    const activeGate = context.activeGate || 'H';
    const gates = circuit.gates;
    const sortedGates = [...gates].sort((a, b) => a.step - b.step);

    const hasH = gates.some((g) => g.type === 'H');
    const hasCX = gates.some((g) => g.type === 'CX');
    const hasX = gates.some((g) => g.type === 'X');
    const hasMeasure = gates.some((g) => g.type === 'M');

    if (actionType === 'explain_circuit') {
      if (gates.length === 0) {
        return {
          text: `Your circuit currently has no gates placed across its ${circuit.numQubits} qubit wires. All qubits remain in the computational ground state |0...0⟩ with 100% deterministic probability. Select a gate from the palette (e.g., H or X) to begin state transformation.`,
          latexNotation: '|\\psi\\rangle = |0\\rangle^{\\otimes ' + circuit.numQubits + '}',
          category: 'explanation',
          suggestedNextActions: ['Explain H Gate', 'Give Hint'],
        };
      }

      if (hasH && hasCX && circuit.numQubits >= 2) {
        return {
          text: `This circuit constructs a maximally entangled two-qubit Bell state (|Φ⁺⟩). The Hadamard (H) gate puts wire q0 into an equal superposition of |0⟩ and |1⟩. Then, the CNOT (CX) gate flips target qubit q1 only when control qubit q0 is in state |1⟩, producing correlated pairs with equal 50% probabilities of |00⟩ and |11⟩.`,
          latexNotation: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
          category: 'explanation',
          suggestedNextActions: ['Why do these results occur?', 'Find possible mistakes'],
        };
      }

      if (hasH && gates.length === 1) {
        return {
          text: `A Hadamard (H) gate is applied to ground state |0⟩. This creates the canonical symmetric superposition state |+⟩, distributing amplitude equally between |0⟩ and |1⟩. Measurement in the computational basis collapses to 0 or 1 with 50% probability each.`,
          latexNotation: 'H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle',
          category: 'explanation',
          suggestedNextActions: ['Explain result', 'Optimize this circuit'],
        };
      }

      if (hasX && gates.length === 1) {
        return {
          text: `A Pauli-X gate acts as a quantum bit-flip (NOT operation). It transforms ground state |0⟩ into state |1⟩ with 100% deterministic fidelity.`,
          latexNotation: 'X|0\\rangle = |1\\rangle, \\quad X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
          category: 'explanation',
          suggestedNextActions: ['Explain Z Gate', 'Give Hint'],
        };
      }

      return {
        text: `This ${circuit.numQubits}-qubit circuit executes ${gates.length} sequential quantum operations. Gates are scheduled across ${Math.max(1, ...gates.map((g) => g.step + 1))} time-slices, transforming the multi-qubit statevector through successive unitary matrix multiplications.`,
        latexNotation: 'U_{total} = U_n \\cdot U_{n-1} \\cdots U_1',
        category: 'explanation',
        suggestedNextActions: ['Why do these results occur?', 'Find possible mistakes'],
      };
    }

    if (actionType === 'explain_gate') {
      switch (activeGate) {
        case 'H':
          return {
            text: `The Hadamard (H) gate is the cornerstone of quantum superposition. It rotates the state by 180° around the (X+Z)/√2 axis on the Bloch sphere, converting basis state |0⟩ into |+⟩ = (|0⟩ + |1⟩)/√2 and |1⟩ into |-⟩ = (|0⟩ - |1⟩)/√2.`,
            latexNotation: 'H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
            category: 'explanation',
          };
        case 'X':
          return {
            text: `The Pauli-X gate is the quantum NOT operator. It performs a π rotation around the X-axis of the Bloch sphere, swapping the amplitudes of |0⟩ and |1⟩.`,
            latexNotation: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}',
            category: 'explanation',
          };
        case 'Y':
          return {
            text: `The Pauli-Y gate performs a π rotation around the Y-axis of the Bloch sphere. It introduces both a bit-flip and a complex phase factor (±i).`,
            latexNotation: 'Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}',
            category: 'explanation',
          };
        case 'Z':
          return {
            text: `The Pauli-Z gate is a phase-flip operator. It leaves |0⟩ unchanged while multiplying the amplitude of |1⟩ by -1 (a relative phase shift of π radians).`,
            latexNotation: 'Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}',
            category: 'explanation',
          };
        case 'S':
          return {
            text: `The Phase (S) gate applies a π/2 (90°) rotation around the Z-axis. It is the square root of the Z gate (S² = Z), mapping |1⟩ to i|1⟩.`,
            latexNotation: 'S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix}',
            category: 'explanation',
          };
        case 'T':
          return {
            text: `The T gate applies a π/4 (45°) phase rotation around the Z-axis. It is the fourth root of the Z gate (T⁴ = Z), essential for universal fault-tolerant quantum computation.`,
            latexNotation: 'T = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\ end{pmatrix}',
            category: 'explanation',
          };
        case 'CX':
          return {
            text: `The Controlled-NOT (CX) gate is an entangling two-qubit operator. If the control qubit is in |1⟩, it applies a Pauli-X flip to the target qubit; if the control is in |0⟩, the target is unchanged.`,
            latexNotation: 'CX = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}',
            category: 'explanation',
          };
        case 'SWAP':
          return {
            text: `The SWAP gate exchanges the states of two qubits: |a⟩ ⊗ |b⟩ → |b⟩ ⊗ |a⟩. It can be decomposed into three alternating CNOT gates.`,
            latexNotation: 'SWAP|ab\\rangle = |ba\\rangle',
            category: 'explanation',
          };
        case 'M':
          return {
            text: `The Measurement (M) gate projects the quantum superposition onto one of the classical computational basis eigenstates ({0, 1}) according to the Born probability rule P(x) = |⟨x|ψ⟩|².`,
            latexNotation: 'P(x) = |\\langle x | \\psi \\rangle|^2',
            category: 'explanation',
          };
      }
    }

    if (actionType === 'explain_result') {
      if (!result) {
        return {
          text: `No simulation results are available yet. Click the "Simulate" button on the configuration panel to run the circuit on the active backend.`,
          category: 'diagnostic',
        };
      }

      const probs = result.probabilities;
      const nonZeroStates = Object.entries(probs).filter(([, p]) => p > 0.02);

      if (nonZeroStates.length === 2 && probs['00'] > 0.4 && probs['11'] > 0.4) {
        return {
          text: `The simulation yields peaks exclusively at |00⟩ (~50%) and |11⟩ (~50%) with 0% for |01⟩ and |10⟩. This confirms a maximally entangled Bell state: whenever wire q0 is measured as 0, wire q1 is guaranteed to be 0, showing perfect non-local correlation.`,
          latexNotation: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
          category: 'explanation',
        };
      }

      if (nonZeroStates.length === 2 && probs['0'] > 0.4 && probs['1'] > 0.4) {
        return {
          text: `The measurement histogram shows an even 50% / 50% split across |0⟩ and |1⟩. The slight numerical deviation between counts is natural stochastic Poisson sampling noise over ${result.shots} shots.`,
          latexNotation: 'P(0) = |\\alpha|^2 \\approx 0.50, \\quad P(1) = |\\beta|^2 \\approx 0.50',
          category: 'explanation',
        };
      }

      return {
        text: `The simulation executed ${result.shots} shots on ${result.backend} in ${result.executionTimeMs}ms. The output distribution shows non-zero measurement probabilities across states: ${nonZeroStates.map(([s, p]) => `|${s}⟩ (${(p * 100).toFixed(1)}%)`).join(', ')}.`,
        category: 'explanation',
      };
    }

    if (actionType === 'find_mistakes') {
      const issues: string[] = [];

      for (let i = 0; i < sortedGates.length - 1; i++) {
        const g1 = sortedGates[i];
        const g2 = sortedGates[i + 1];
        if (g1.qubit === g2.qubit && g1.step === g2.step) {
          issues.push(`Time-slice conflict: Two gates occupy wire q${g1.qubit} at step t${g1.step}. Shift one gate to the next column.`);
        }
      }

      for (let i = 0; i < sortedGates.length - 1; i++) {
        const g1 = sortedGates[i];
        const g2 = sortedGates[i + 1];
        if (g1.qubit === g2.qubit && g1.type === g2.type && (g1.type === 'H' || g1.type === 'X' || g1.type === 'Z')) {
          if (g2.step === g1.step + 1) {
            issues.push(`Redundant gate pair: Consecutive ${g1.type} gates on wire q${g1.qubit} cancel each other out (${g1.type}² = I).`);
          }
        }
      }

      const invalidCX = gates.find((g) => g.type === 'CX' && g.targetQubit === g.qubit);
      if (invalidCX) {
        issues.push(`Invalid CX configuration: Control and target are set to the same qubit wire (q${invalidCX.qubit}).`);
      }

      if (issues.length > 0) {
        return {
          text: `I identified the following potential circuit issues:\n\n• ${issues.join('\n• ')}`,
          category: 'diagnostic',
          suggestedNextActions: ['Optimize this circuit', 'Explain this circuit'],
        };
      }

      return {
        text: `Circuit topology is clean. All ${gates.length} gate operations are validly scheduled with no wire collisions, self-targeting multi-qubit gates, or invalid dependencies.`,
        category: 'diagnostic',
        suggestedNextActions: ['Optimize this circuit', 'Why do these results occur?'],
      };
    }

    if (actionType === 'optimize_circuit') {
      const recommendations: string[] = [];

      for (let i = 0; i < sortedGates.length - 1; i++) {
        const g1 = sortedGates[i];
        const g2 = sortedGates[i + 1];
        if (g1.qubit === g2.qubit && g1.type === g2.type && ['H', 'X', 'Z'].includes(g1.type)) {
          recommendations.push(`Remove adjacent redundant ${g1.type} gates on q${g1.qubit} to reduce circuit depth by 2.`);
        }
      }

      if (circuit.gates.length > 4 && !hasMeasure) {
        recommendations.push(`Append Measurement (M) gates on final steps for hardware transpile optimization.`);
      }

      if (recommendations.length > 0) {
        return {
          text: `Optimization Suggestions:\n\n• ${recommendations.join('\n• ')}`,
          category: 'optimization',
          suggestedNextActions: ['Find possible mistakes', 'Explain this circuit'],
        };
      }

      return {
        text: `The circuit is already optimized with minimal depth (${circuit.gates.length > 0 ? Math.max(...circuit.gates.map((g) => g.step)) + 1 : 0} steps) and zero redundant self-inverse operators.`,
        category: 'optimization',
        suggestedNextActions: ['Explain this circuit', 'Give me a hint'],
      };
    }

    if (actionType === 'give_hint') {
      if (!hasH) {
        return {
          text: `Hint: To explore quantum parallelism or create non-classical states, start by applying a Hadamard (H) gate on wire q0 to create an equal superposition.`,
          latexNotation: 'H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}',
          category: 'hint',
        };
      }

      if (hasH && !hasCX && circuit.numQubits > 1) {
        return {
          text: `Hint: You have a superposition on wire q0. Add a Controlled-NOT (CX) gate with q0 as control and q1 as target to generate quantum entanglement.`,
          category: 'hint',
        };
      }

      return {
        text: `Hint: Remember that quantum gates are unitary matrices (U†U = I). Every operation is reversible until a projective measurement collapses the statevector.`,
        category: 'hint',
      };
    }

    const p = prompt.toLowerCase();
    if (p.includes('00 and 11') || p.includes('why am i getting only 00 and 11')) {
      return {
        text: `This occurs because your circuit creates an entangled Bell pair (|Φ⁺⟩ = (|00⟩ + |11⟩)/√2). The Hadamard creates equal superposition on wire q0, and the CX correlates wire q1 with q0. Therefore, only states where both qubits match (|00⟩ and |11⟩) have non-zero probability amplitude.`,
        latexNotation: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
        category: 'explanation',
      };
    }

    if (p.includes('bloch') || p.includes('sphere')) {
      return {
        text: `The Bloch sphere is a geometric representation of pure single-qubit states as points on the unit sphere S². The north pole corresponds to |0⟩, the south pole to |1⟩, and the equator represents equal superpositions (|0⟩ + e^(iφ)|1⟩)/√2 with relative phase angle φ.`,
        latexNotation: '|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle',
        category: 'explanation',
      };
    }

    return {
      text: `In this ${circuit.numQubits}-qubit configuration, quantum operators evolve the state vector through unitary transformations in complex Hilbert space. Use the contextual prompt buttons above or ask specific questions about gates, phases, or entanglement.`,
      category: 'general',
      suggestedNextActions: ['Explain this circuit', 'Why do these results occur?', 'Find possible mistakes'],
    };
  },
};
