import type { Circuit, SimulationResult, GateType, SimulationConfig } from '../types/quantum';
import { quantumApi } from './quantumApi';
import { LESSON_MODULES } from '../data/mockData';

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
  | 'generate_code'
  | 'recommend_lesson'
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
  codeSnippet?: {
    qiskit: string;
    pennylane: string;
    cirq: string;
  };
  recommendation?: {
    moduleId: string;
    moduleNumber: string;
    title: string;
    difficulty: string;
    description: string;
  };
  category: 'explanation' | 'diagnostic' | 'optimization' | 'hint' | 'code' | 'recommendation' | 'general';
}

export const tutorApi = {
  async askTutor(request: TutorQueryRequest): Promise<TutorQueryResponse> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const { actionType, prompt = '', context } = request;
    const circuit = context.circuit;
    const result = context.simulationResult;
    const activeGate = context.activeGate || 'H';
    const config = context.config || { backend: 'Qiskit Aer', shots: 1000, noiseModel: false };
    const gates = circuit.gates;
    const sortedGates = [...gates].sort((a, b) => a.step - b.step || a.qubit - b.qubit);

    const hasH = gates.some((g) => g.type === 'H');
    const hasCX = gates.some((g) => g.type === 'CX');
    const hasX = gates.some((g) => g.type === 'X');
    const hasY = gates.some((g) => g.type === 'Y');
    const hasZ = gates.some((g) => g.type === 'Z');
    const hasS = gates.some((g) => g.type === 'S');
    const hasT = gates.some((g) => g.type === 'T');
    const hasSWAP = gates.some((g) => g.type === 'SWAP');
    const hasMeasure = gates.some((g) => g.type === 'M');

    // Determine effective actionType based on prompt if not explicitly given
    let effectiveAction: TutorActionType = actionType || 'explain_circuit';
    const p = prompt.toLowerCase();
    if (p.includes('code') || p.includes('qiskit') || p.includes('pennylane') || p.includes('cirq') || p.includes('python')) {
      effectiveAction = 'generate_code';
    } else if (p.includes('lesson') || p.includes('next') || p.includes('learn') || p.includes('module') || p.includes('recommend')) {
      effectiveAction = 'recommend_lesson';
    } else if (p.includes('mistake') || p.includes('error') || p.includes('wrong') || p.includes('bug') || p.includes('diagnos') || p.includes('conflict')) {
      effectiveAction = 'find_mistakes';
    } else if (p.includes('result') || p.includes('simulation') || p.includes('measurement') || p.includes('shot') || p.includes('count') || p.includes('probabilit')) {
      effectiveAction = 'explain_result';
    } else if (p.includes('gate') && (p.includes('selected') || p.includes('what is') || p.includes('explain'))) {
      effectiveAction = 'explain_gate';
    } else if (p.includes('optimize') || p.includes('depth')) {
      effectiveAction = 'optimize_circuit';
    }

    // =========================================================================
    // 1. EXPLAIN CIRCUIT (Context-Aware to Active Circuit)
    // =========================================================================
    if (effectiveAction === 'explain_circuit') {
      const maxStep = gates.length > 0 ? Math.max(...gates.map((g) => g.step)) + 1 : 0;

      if (gates.length === 0) {
        return {
          text: `Your circuit currently has ${circuit.numQubits} qubit wire${circuit.numQubits > 1 ? 's' : ''} initialized to computational ground state |0⟩ with no gates placed. In this configuration:\n\n• Initial multi-qubit state: |0⟩^{\\otimes ${circuit.numQubits}} = |${'0'.repeat(circuit.numQubits)}⟩\n• Theoretical measurement: 100% deterministic probability for |${'0'.repeat(circuit.numQubits)}⟩\n• Circuit depth: 0 time steps\n\nTo transform the state vector, drag gates from the palette (e.g., H for superposition or X for bit-flip) onto the wires.`,
          latexNotation: `|\\psi\\rangle = |${'0'.repeat(circuit.numQubits)}\\rangle`,
          category: 'explanation',
          suggestedNextActions: ['Explain Selected Gate', 'Find Possible Mistakes', 'Recommend Next Lesson'],
        };
      }

      // Check for Bell State: 2 qubits, H on q0, CX control q0 target q1
      const isBellState =
        circuit.numQubits >= 2 &&
        gates.some((g) => g.type === 'H' && g.qubit === 0 && g.step === 0) &&
        gates.some((g) => g.type === 'CX' && g.qubit === 0 && g.targetQubit === 1);

      if (isBellState && gates.length <= 4) {
        return {
          text: `This active circuit constructs the canonical maximally entangled Bell state (|Φ⁺⟩):\n\n1. Step t0: Hadamard (H) on wire q0 places q0 into equal superposition (|0⟩ + |1⟩)/√2 while wire q1 remains |0⟩. State: (|00⟩ + |10⟩)/√2.\n2. Step t1: Controlled-NOT (CX) with control q0 and target q1 flips wire q1 if and only if wire q0 is |1⟩. State evolves to: (|00⟩ + |11⟩)/√2.\n\nQuantum Characteristics:\n• Non-local entanglement: Measuring wire q0 instantaneously determines the value of wire q1 with 100% correlation.\n• Measurement outcomes: |00⟩ and |11⟩ each with 50% probability; |01⟩ and |10⟩ have zero amplitude due to quantum interference.`,
          latexNotation: '|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}',
          category: 'explanation',
          suggestedNextActions: ['Explain Results', 'Find Possible Mistakes', 'Generate Qiskit/PennyLane/Cirq Code', 'Recommend Next Lesson'],
        };
      }

      // Check for GHZ State: 3+ qubits, H on q0, CX cascading
      const isGHZ =
        circuit.numQubits >= 3 &&
        gates.some((g) => g.type === 'H' && g.qubit === 0) &&
        gates.some((g) => g.type === 'CX' && g.qubit === 0 && g.targetQubit === 1) &&
        gates.some((g) => g.type === 'CX' && (g.qubit === 1 || g.qubit === 0) && g.targetQubit === 2);

      if (isGHZ) {
        return {
          text: `This circuit synthesizes a tripartite Greenberger-Horne-Zeilinger (GHZ) state across wires q0, q1, and q2:\n\n1. H on wire q0 creates initial superposition.\n2. CX(q0 → q1) entangles the first pair.\n3. CX entangling q2 extends the superposition to all 3 qubits, creating a macroscopic quantum superposition.\n\nSimultaneous measurement collapses the entire 3-qubit register into either |000⟩ (50%) or |111⟩ (50%).`,
          latexNotation: '|\\text{GHZ}\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}',
          category: 'explanation',
          suggestedNextActions: ['Explain Results', 'Generate Qiskit/PennyLane/Cirq Code', 'Recommend Next Lesson'],
        };
      }

      // Check for Single Qubit Superposition
      if (circuit.numQubits === 1 && hasH && gates.length <= 2) {
        return {
          text: `This single-qubit circuit creates the symmetric superposition state |+⟩:\n\n• Step t0: Hadamard (H) rotates the state vector by 180° around the (X+Z)/√2 axis on the Bloch sphere.\n• Amplitudes: α = 1/√2 for |0⟩, β = 1/√2 for |1⟩.\n• Relative phase: Δφ = 0 radians.\n• Measurement: Yields basis states 0 and 1 with equal 50% probability.`,
          latexNotation: 'H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}} = |+\\rangle',
          category: 'explanation',
          suggestedNextActions: ['Explain Results', 'Find Possible Mistakes', 'Recommend Next Lesson'],
        };
      }

      // General Chronological Gate Walkthrough
      const stepBreakdown = sortedGates.map((g) => {
        if (g.type === 'CX') {
          return `• Step t${g.step}: CX gate with control wire q${g.qubit} and target wire q${g.targetQubit ?? (g.qubit + 1)}`;
        }
        if (g.type === 'SWAP') {
          return `• Step t${g.step}: SWAP gate exchanging wire q${g.qubit} and wire q${g.targetQubit ?? (g.qubit + 1)}`;
        }
        if (g.type === 'M') {
          return `• Step t${g.step}: Projective Measurement (M) on wire q${g.qubit}`;
        }
        return `• Step t${g.step}: ${g.type} gate applied to wire q${g.qubit}`;
      }).join('\n');

      // Wire activity
      const wireGateCounts = Array.from({ length: circuit.numQubits }, (_, qIdx) => {
        const count = gates.filter((g) => g.qubit === qIdx || g.targetQubit === qIdx).length;
        return `q${qIdx} (${count} ops)`;
      }).join(', ');

      return {
        text: `Analysis of your active ${circuit.numQubits}-qubit circuit (${gates.length} gates across ${maxStep} time steps):\n\nChronological Gate Sequence:\n${stepBreakdown}\n\nWire Activity:\n${wireGateCounts}\n\nState Evolution:\nUnitary operators evolve the initial state |${'0'.repeat(circuit.numQubits)}⟩ via tensor product transformations. ${hasCX ? 'Multi-qubit entangling gates are active, correlating wire amplitudes.' : 'Operations are currently local single-qubit rotations.'}`,
        latexNotation: `U_{\\text{circuit}} = \\prod_{t=${maxStep - 1}}^{0} U_t`,
        category: 'explanation',
        suggestedNextActions: ['Explain Selected Gate', 'Explain Results', 'Find Possible Mistakes', 'Generate Qiskit/PennyLane/Cirq Code'],
      };
    }

    // =========================================================================
    // 2. EXPLAIN SELECTED GATE (Context-Aware to Active Circuit)
    // =========================================================================
    if (effectiveAction === 'explain_gate') {
      const gateCountInCircuit = gates.filter((g) => g.type === activeGate).length;
      const wirePlacements = gates
        .filter((g) => g.type === activeGate)
        .map((g) => `wire q${g.qubit} at step t${g.step}`)
        .join(', ');

      const contextNote = gateCountInCircuit > 0
        ? `You currently have ${gateCountInCircuit} instance${gateCountInCircuit > 1 ? 's' : ''} of ${activeGate} in your active circuit (${wirePlacements}).`
        : `Your circuit currently has zero ${activeGate} gates placed.`;

      switch (activeGate) {
        case 'H':
          return {
            text: `Hadamard (H) Gate — Superposition Generator\n\n${contextNote}\n\nOperation:\n• Rotates state by 180° around (X+Z)/√2 axis on the Bloch sphere.\n• Maps computational basis states to orthogonal superposition bases:\n  - H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩\n  - H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩\n\nCircuit Context:\nApplying H to wire q0 in your ${circuit.numQubits}-qubit register converts basis state |0⟩ into equal amplitude distribution with 50% measurement probability each. Combined with CX, it enables quantum entanglement.`,
            latexNotation: 'H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes', 'Recommend Next Lesson'],
          };

        case 'CX':
          return {
            text: `Controlled-NOT (CX / CNOT) Gate — Entangling Operator\n\n${contextNote}\n\nOperation:\n• Multi-qubit two-wire gate operating on control qubit q_c and target qubit q_t.\n• Conditional unitary rule: |c⟩|t⟩ → |c⟩|t ⊕ c⟩.\n  - If control is |0⟩, target remains unchanged.\n  - If control is |1⟩, target undergoes Pauli-X bit flip.\n\nCircuit Context:\nIn your ${circuit.numQubits}-qubit layout, placing CX after a superposition gate on the control wire generates maximally entangled Bell pairs. Ensure control and target wires are distinct.`,
            latexNotation: 'CX = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\\\ 0 & 0 & 1 & 0 \\end{pmatrix}',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes', 'Generate Qiskit/PennyLane/Cirq Code'],
          };

        case 'X':
          return {
            text: `Pauli-X Gate — Quantum NOT / Bit-Flip\n\n${contextNote}\n\nOperation:\n• Performs a π (180°) rotation around the X-axis on the Bloch sphere.\n• Swaps probability amplitudes: X|0⟩ = |1⟩, X|1⟩ = |0⟩.\n\nCircuit Context:\nIn your circuit, an X gate unconditionally excites a ground state qubit |0⟩ to state |1⟩, providing 100% deterministic probability upon measurement. Two consecutive X gates cancel out (X² = I).`,
            latexNotation: 'X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad X(\\alpha|0\\rangle + \\beta|1\\rangle) = \\beta|0\\rangle + \\alpha|1\\rangle',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes'],
          };

        case 'Y':
          return {
            text: `Pauli-Y Gate — Bit-and-Phase Flip\n\n${contextNote}\n\nOperation:\n• Performs a π rotation around the Y-axis on the Bloch sphere.\n• Combines bit-flip and complex phase shift: Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩.\n\nCircuit Context:\nIntroduces an imaginary unit i into the state amplitude, moving the state vector along the equator of the Bloch sphere.`,
            latexNotation: 'Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes'],
          };

        case 'Z':
          return {
            text: `Pauli-Z Gate — Phase-Flip Operator\n\n${contextNote}\n\nOperation:\n• Leaves state |0⟩ unaltered while flipping the sign of state |1⟩: Z|0⟩ = |0⟩, Z|1⟩ = -|1⟩.\n• Imparts a relative phase shift of π radians (180°) without modifying measurement probabilities in the computational basis.\n\nCircuit Context:\nWhen applied to wire in superposition |+⟩ = (|0⟩+|1⟩)/√2, Z transforms it to |-⟩ = (|0⟩-|1⟩)/√2. Measured probabilities remain 50/50, but interference patterns with subsequent H gates flip completely.`,
            latexNotation: 'Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad Z|+\\rangle = |-\\rangle',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes'],
          };

        case 'S':
          return {
            text: `Phase (S) Gate — Quarter-Turn Z Rotation (π/2)\n\n${contextNote}\n\nOperation:\n• Square root of the Pauli-Z gate: S² = Z.\n• Rotates state by 90° (π/2) around the Z-axis of the Bloch sphere: S|0⟩ = |0⟩, S|1⟩ = i|1⟩.\n\nCircuit Context:\nEssential for Quantum Fourier Transform (QFT) and phase estimation circuits. In your circuit, S converts |+⟩ into |+i⟩ = (|0⟩ + i|1⟩)/√2 on the equatorial axis.`,
            latexNotation: 'S = \\begin{pmatrix} 1 & 0 \\\\ 0 & i \\end{pmatrix} = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/2} \\end{pmatrix}',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes'],
          };

        case 'T':
          return {
            text: `T Gate — π/8 Phase Rotation\n\n${contextNote}\n\nOperation:\n• Fourth root of Pauli-Z (T⁴ = Z, T² = S).\n• Imparts a π/4 (45°) phase rotation: T|0⟩ = |0⟩, T|1⟩ = e^(iπ/4)|1⟩.\n\nCircuit Context:\nNon-Clifford gate. In quantum complexity theory, the Clifford group {H, S, CX} augmented with the T gate achieves universal quantum computation (Solovay-Kitaev theorem).`,
            latexNotation: 'T = \\begin{pmatrix} 1 & 0 \\\\ 0 & e^{i\\pi/4} \\end{pmatrix}',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes'],
          };

        case 'SWAP':
          return {
            text: `SWAP Gate — Quantum Register State Exchange\n\n${contextNote}\n\nOperation:\n• Exchanging two-qubit composite states: SWAP|ab⟩ = |ba⟩.\n• Symmetric matrix decomposable into three alternating CNOT gates:\n  SWAP = CX(a, b) · CX(b, a) · CX(a, b).\n\nCircuit Context:\nIn your ${circuit.numQubits}-qubit layout, SWAP allows routing quantum information between disconnected physical qubit wires.`,
            latexNotation: 'SWAP = \\begin{pmatrix} 1 & 0 & 0 & 0 \\\\ 0 & 0 & 1 & 0 \\\\ 0 & 1 & 0 & 0 \\\\ 0 & 0 & 0 & 1 \\end{pmatrix}',
            category: 'explanation',
            suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes'],
          };

        case 'M':
          return {
            text: `Measurement (M) Gate — Projective Computational Basis Collapse\n\n${contextNote}\n\nOperation:\n• Irreversible projection into classical computational eigenstates {0, 1}.\n• Born probability rule: P(k) = |⟨k|ψ⟩|².\n• Erases quantum superposition and destroys quantum phase coherence.\n\nCircuit Context:\nEnsure M is placed at the final steps of your circuit wires. Operations placed after measurement on the same wire cannot execute coherent unitary transformations.`,
            latexNotation: 'P(x) = |\\langle x | \\psi \\rangle|^2, \\quad \\sum_x P(x) = 1',
            category: 'explanation',
            suggestedNextActions: ['Explain Results', 'Find Possible Mistakes'],
          };

        default:
          return {
            text: `Selected Gate: ${activeGate}\n\n${contextNote}\nUnitary quantum gate operating on the state vector in complex Hilbert space. Select any gate from the palette or canvas to inspect its exact algebraic and circuit role.`,
            category: 'explanation',
          };
      }
    }

    // =========================================================================
    // 3. EXPLAIN RESULTS (Context-Aware to Simulation Results & Backend)
    // =========================================================================
    if (effectiveAction === 'explain_result') {
      if (!result) {
        return {
          text: `No simulation results are available yet for this circuit.\n\nCurrent Configuration:\n• Backend: ${config.backend}\n• Requested Shots: ${config.shots.toLocaleString()}\n• Noise Model: ${config.noiseModel ? 'Active' : 'Disabled'}\n\nClick the "Simulate" button in the Simulation Panel (or "Run Code" in the Code tab) to execute your ${circuit.gates.length} gates and generate empirical measurement statistics.`,
          category: 'diagnostic',
          suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes'],
        };
      }

      const probs = result.probabilities;
      const sortedStates = Object.entries(probs)
        .sort(([, a], [, b]) => b - a)
        .filter(([, p]) => p > 0.005);

      const stateBreakdown = sortedStates
        .map(([state, prob]) => {
          const estimatedCounts = Math.round(prob * result.shots);
          return `• |${state}⟩: ${(prob * 100).toFixed(1)}% (~${estimatedCounts} counts)`;
        })
        .join('\n');

      // Theoretical comparison
      let theoreticalNote = '';
      if (sortedStates.length === 2 && probs['00'] > 0.4 && probs['11'] > 0.4) {
        theoreticalNote = `\n\nWhy |00⟩ and |11⟩?\nYour circuit prepared an entangled Bell pair (|Φ⁺⟩). Measurement on wire q0 collapses wire q1 into the identical state. Because probability amplitudes for |01⟩ and |10⟩ interfere destructively to exactly 0, only correlated outcomes (|00⟩ and |11⟩) are physically possible.`;
      } else if (sortedStates.length === 2 && probs['0'] > 0.4 && probs['1'] > 0.4) {
        theoreticalNote = `\n\nWhy equal 50% split across |0⟩ and |1⟩?\nThe Hadamard gate divided the state amplitude equally: α = 1/√2, β = 1/√2. By the Born rule, P(0) = |α|² = 0.50 and P(1) = |β|² = 0.50.`;
      } else if (sortedStates.length === 1 && sortedStates[0][1] > 0.98) {
        theoreticalNote = `\n\nWhy deterministic state |${sortedStates[0][0]}⟩?\nThe circuit applies deterministic unitary transformations with zero unresolved superposition phases. The outcome is 100% reproducible.`;
      }

      const noiseNote = config.noiseModel
        ? `\n\nNoise Modeling:\nSimulation executed with realistic thermal relaxation and gate depolarizing noise. Minor non-zero background counts reflect hardware infidelity.`
        : `\n\nPoisson Shot Noise:\nDeviations from exact theoretical fractions are stochastic Poisson sampling noise across ${result.shots} discrete measurement shots (standard deviation σ ≈ √(N·p·(1-p))).`;

      return {
        text: `Simulation Results Analysis:\n\nBackend: ${result.backend} | Shots: ${result.shots.toLocaleString()} | Execution: ${result.executionTimeMs}ms | Circuit Depth: ${result.circuitDepth}\n\nMeasured Probability Distribution:\n${stateBreakdown}${theoreticalNote}${noiseNote}`,
        latexNotation: `P(x) = \\frac{\\text{Counts}(x)}{N_{\\text{shots}}}, \\quad N = ${result.shots}`,
        category: 'explanation',
        suggestedNextActions: ['Find Possible Mistakes', 'Generate Qiskit/PennyLane/Cirq Code', 'Recommend Next Lesson'],
      };
    }

    // =========================================================================
    // 4. FIND POSSIBLE MISTAKES (Comprehensive Circuit Diagnostics)
    // =========================================================================
    if (effectiveAction === 'find_mistakes') {
      const issues: string[] = [];
      const warnings: string[] = [];

      // 1. Check empty circuit
      if (gates.length === 0) {
        return {
          text: `Circuit Diagnostic Report:\n\n⚠️ Circuit is completely empty (0 gates placed across ${circuit.numQubits} wires).\n• All qubits remain in ground state |0⟩.\n• No quantum computation or state evolution will take place.\n\nRecommendation: Place a gate (e.g. H on q0, or X on q0) to start designing.`,
          category: 'diagnostic',
          suggestedNextActions: ['Explain Selected Gate', 'Recommend Next Lesson'],
        };
      }

      // 2. Wire collisions (same qubit and same step)
      for (let i = 0; i < sortedGates.length - 1; i++) {
        for (let j = i + 1; j < sortedGates.length; j++) {
          const g1 = sortedGates[i];
          const g2 = sortedGates[j];
          if (g1.step === g2.step) {
            const wiresG1 = [g1.qubit, ...(g1.targetQubit !== undefined ? [g1.targetQubit] : [])];
            const wiresG2 = [g2.qubit, ...(g2.targetQubit !== undefined ? [g2.targetQubit] : [])];
            const overlap = wiresG1.some((w) => wiresG2.includes(w));
            if (overlap) {
              issues.push(
                `Time-Slice Collision at step t${g1.step}: ${g1.type} gate and ${g2.type} gate overlap on the same qubit wire. Gates in the same column execute simultaneously and cannot share a wire.`
              );
            }
          }
        }
      }

      // 3. Multi-qubit control and target on the same qubit
      const selfTargetingGates = gates.filter(
        (g) => (g.type === 'CX' || g.type === 'SWAP') && g.targetQubit === g.qubit
      );
      if (selfTargetingGates.length > 0) {
        selfTargetingGates.forEach((g) => {
          issues.push(
            `Invalid Multi-Qubit Configuration: ${g.type} gate at step t${g.step} has control and target set to the same wire (q${g.qubit}). Multi-qubit gates require distinct control and target wires.`
          );
        });
      }

      // 4. Multi-qubit target out of bounds
      const outOfBoundsGates = gates.filter(
        (g) => (g.type === 'CX' || g.type === 'SWAP') && g.targetQubit !== undefined && g.targetQubit >= circuit.numQubits
      );
      if (outOfBoundsGates.length > 0) {
        outOfBoundsGates.forEach((g) => {
          issues.push(
            `Target Wire Out of Bounds: ${g.type} gate at step t${g.step} targets wire q${g.targetQubit}, but your circuit only has ${circuit.numQubits} qubits (indices q0 to q${circuit.numQubits - 1}).`
          );
        });
      }

      // 5. Consecutive self-canceling gates on the same wire
      for (let i = 0; i < sortedGates.length - 1; i++) {
        const g1 = sortedGates[i];
        const g2 = sortedGates[i + 1];
        if (g1.qubit === g2.qubit && g1.type === g2.type && ['H', 'X', 'Y', 'Z'].includes(g1.type)) {
          if (g2.step === g1.step + 1) {
            warnings.push(
              `Redundant Self-Canceling Pair: Consecutive ${g1.type} gates on wire q${g1.qubit} at steps t${g1.step} and t${g2.step}. Because ${g1.type}² = I (identity), these two gates neutralize each other and add unnecessary circuit depth.`
            );
          }
        }
      }

      // 6. SWAP self-canceling pair
      for (let i = 0; i < sortedGates.length - 1; i++) {
        const g1 = sortedGates[i];
        const g2 = sortedGates[i + 1];
        if (
          g1.type === 'SWAP' &&
          g2.type === 'SWAP' &&
          g1.qubit === g2.qubit &&
          g1.targetQubit === g2.targetQubit &&
          g2.step === g1.step + 1
        ) {
          warnings.push(
            `Redundant SWAP Pair: Consecutive SWAP gates between q${g1.qubit} and q${g1.targetQubit} at steps t${g1.step} and t${g2.step} cancel each other (SWAP² = I).`
          );
        }
      }

      // 7. Operations placed after Measurement on the same wire
      const measurementGates = gates.filter((g) => g.type === 'M');
      measurementGates.forEach((mGate) => {
        const gatesAfterM = gates.filter(
          (g) => (g.qubit === mGate.qubit || g.targetQubit === mGate.qubit) && g.step > mGate.step && g.type !== 'M'
        );
        gatesAfterM.forEach((postGate) => {
          issues.push(
            `Dead Operation After Measurement: ${postGate.type} gate at step t${postGate.step} follows Measurement (M) at step t${mGate.step} on wire q${mGate.qubit}. Once a qubit collapses into a classical eigenstate, coherent unitary transformations cannot be performed.`
          );
        });
      });

      // 8. Partial measurement notice
      if (hasMeasure && measurementGates.length < circuit.numQubits) {
        const unmeasuredActiveWires = Array.from({ length: circuit.numQubits }, (_, idx) => idx).filter((idx) => {
          const hasGate = gates.some((g) => g.qubit === idx || g.targetQubit === idx);
          const hasM = measurementGates.some((g) => g.qubit === idx);
          return hasGate && !hasM;
        });

        if (unmeasuredActiveWires.length > 0) {
          warnings.push(
            `Partial Measurement: Wire${unmeasuredActiveWires.length > 1 ? 's' : ''} ${unmeasuredActiveWires.map((w) => `q${w}`).join(', ')} contain quantum gates but lack Measurement (M) gates. In hardware transpilation, unmeasured wires are traced out.`
          );
        }
      }

      // 9. Unused idle wires
      const idleWires = Array.from({ length: circuit.numQubits }, (_, idx) => idx).filter(
        (idx) => !gates.some((g) => g.qubit === idx || g.targetQubit === idx)
      );
      if (idleWires.length > 0 && circuit.numQubits > 1) {
        warnings.push(
          `Idle Qubit Wire${idleWires.length > 1 ? 's' : ''}: ${idleWires.map((w) => `q${w}`).join(', ')} ha${idleWires.length > 1 ? 've' : 's'} zero operations placed. Consider reducing numQubits or utilizing these wires.`
        );
      }

      // Report generation
      if (issues.length > 0 || warnings.length > 0) {
        const issueBlock = issues.length > 0 ? `Critical Issues Found (${issues.length}):\n• ${issues.join('\n• ')}` : '';
        const warningBlock = warnings.length > 0 ? `Optimization Notices (${warnings.length}):\n• ${warnings.join('\n• ')}` : '';
        const fullReport = [issueBlock, warningBlock].filter(Boolean).join('\n\n');

        return {
          text: `Circuit Diagnostics Report:\n\n${fullReport}\n\nActionable Advice:\nResolve critical wire collisions and dead post-measurement operations to ensure error-free simulation and Qiskit/Cirq code execution.`,
          category: 'diagnostic',
          suggestedNextActions: ['Explain Circuit', 'Generate Qiskit/PennyLane/Cirq Code'],
        };
      }

      return {
        text: `Circuit Diagnostic Passed: No Mistakes Found!\n\nVerified Parameters for your ${circuit.numQubits}-qubit circuit:\n✓ Zero time-slice wire collisions across all ${gates.length} gates\n✓ Multi-qubit controls and targets are validly assigned\n✓ No redundant self-canceling pairs (e.g. H·H or X·X)\n✓ No dead operations scheduled after projective measurement\n✓ Valid unitary pipeline ready for simulation`,
        category: 'diagnostic',
        suggestedNextActions: ['Explain Circuit', 'Explain Results', 'Generate Qiskit/PennyLane/Cirq Code', 'Recommend Next Lesson'],
      };
    }

    // =========================================================================
    // 5. GENERATE QISKIT / PENNYLANE / CIRQ CODE
    // =========================================================================
    if (effectiveAction === 'generate_code') {
      const qiskitCode = quantumApi.generateQiskitCode(circuit);
      const pennylaneCode = quantumApi.generatePennyLaneCode(circuit);
      const cirqCode = quantumApi.generateCirqCode(circuit);

      // Syntax breakdown of circuit
      const gateMappings = sortedGates.map((g) => {
        if (g.type === 'CX') {
          return `• CX(q${g.qubit} → q${g.targetQubit}): Qiskit \`qc.cx(${g.qubit}, ${g.targetQubit})\` | PennyLane \`qml.CNOT(wires=[${g.qubit}, ${g.targetQubit}])\` | Cirq \`cirq.CNOT(qubits[${g.qubit}], qubits[${g.targetQubit}])\``;
        }
        if (g.type === 'SWAP') {
          return `• SWAP(q${g.qubit}, q${g.targetQubit}): Qiskit \`qc.swap(${g.qubit}, ${g.targetQubit})\` | PennyLane \`qml.SWAP(wires=[${g.qubit}, ${g.targetQubit}])\` | Cirq \`cirq.SWAP(qubits[${g.qubit}], qubits[${g.targetQubit}])\``;
        }
        if (g.type === 'M') {
          return `• M(q${g.qubit}): Qiskit \`qc.measure(${g.qubit}, ${g.qubit})\` | Cirq \`cirq.measure(qubits[${g.qubit}])\``;
        }
        return `• ${g.type}(q${g.qubit}): Qiskit \`qc.${g.type.toLowerCase()}(${g.qubit})\` | PennyLane \`qml.${g.type === 'H' ? 'Hadamard' : `Pauli${g.type}`}(wires=${g.qubit})\` | Cirq \`cirq.${g.type}(qubits[${g.qubit}])\``;
      }).join('\n');

      return {
        text: `Here is the synchronized Python code for your active ${circuit.numQubits}-qubit circuit across all 3 major frameworks:\n\nFramework Syntax Mappings for Your Circuit:\n${gateMappings || '• Empty circuit: initialized registers with zero gates.'}\n\nExecutable scripts are generated below with backend execution and measurement sampling:`,
        category: 'code',
        codeSnippet: {
          qiskit: qiskitCode,
          pennylane: pennylaneCode,
          cirq: cirqCode,
        },
        suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes', 'Recommend Next Lesson'],
      };
    }

    // =========================================================================
    // 6. RECOMMEND NEXT LESSON (Pedagogical Curriculum Recommendation)
    // =========================================================================
    if (effectiveAction === 'recommend_lesson') {
      let targetModuleId = 'mod-01';
      let rationale = '';

      if (gates.length === 0) {
        targetModuleId = 'mod-01';
        rationale = 'Since your circuit currently has 0 gates placed, starting with Module 01 will give you a solid foundation in the mathematical difference between classical binary bits and quantum Hilbert state spaces.';
      } else if (hasCX || (hasH && hasCX)) {
        targetModuleId = 'mod-05';
        rationale = 'Your active circuit uses multi-qubit entangling gates (CX) to synthesize correlated states. Module 05 explores Einstein-Podolsky-Rosen (EPR) pairs, Bell inequality violations, and quantum teleportation protocols.';
      } else if (hasSWAP || (gates.length >= 3 && circuit.numQubits >= 2)) {
        targetModuleId = 'mod-06';
        rationale = `Your circuit is expanding into a multi-qubit composite system (${circuit.numQubits} qubits, ${gates.length} gates${hasSWAP ? ' with state-exchanging SWAP gates' : ''}). Module 06 covers multi-qubit register manipulation, matrix tensor products (A ⊗ B), and reversible circuit synthesis.`;
      } else if (hasS || hasT || hasZ || hasY) {
        targetModuleId = 'mod-04';
        rationale = 'You are experimenting with relative phase gates (S, T, Z, or Y). Module 04 details the algebraic properties of Pauli operators, Hermitian matrices, and non-Clifford phase rotations on the Bloch sphere.';
      } else if (hasH) {
        targetModuleId = 'mod-03';
        rationale = 'Your circuit applies Hadamard (H) gates to create superposition. Module 03 examines the |+⟩ and |-⟩ basis states, quantum interference patterns, and projective Born measurements.';
      } else if (hasX) {
        targetModuleId = 'mod-02';
        rationale = 'Your circuit performs bit-flips via the Pauli-X gate. Module 02 explains state vectors, Dirac bra-ket notation, and geometric navigation on the surface of the Bloch sphere.';
      } else {
        targetModuleId = 'mod-07';
        rationale = 'You are developing complex circuits. Module 07 explores full quantum algorithms including the Deutsch-Jozsa algorithm and quantum phase estimation.';
      }

      const recommendedMod = LESSON_MODULES.find((m) => m.id === targetModuleId) || LESSON_MODULES[0];

      return {
        text: `Recommended Curriculum Module: Module ${recommendedMod.number} — ${recommendedMod.title}\n\nWhy this recommendation fits your active circuit:\n${rationale}\n\nKey Concepts in this Module:\n• ${recommendedMod.keyConcepts.join('\n• ')}\n\nEstimated completion time: ~${recommendedMod.estimatedMinutes} mins • Difficulty: ${recommendedMod.difficulty}`,
        latexNotation: recommendedMod.latexSnippet,
        category: 'recommendation',
        recommendation: {
          moduleId: recommendedMod.id,
          moduleNumber: recommendedMod.number,
          title: recommendedMod.title,
          difficulty: recommendedMod.difficulty,
          description: recommendedMod.shortDescription,
        },
        suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes', 'Generate Qiskit/PennyLane/Cirq Code'],
      };
    }

    // =========================================================================
    // 7. OPTIMIZE CIRCUIT
    // =========================================================================
    if (effectiveAction === 'optimize_circuit') {
      const recommendations: string[] = [];

      for (let i = 0; i < sortedGates.length - 1; i++) {
        const g1 = sortedGates[i];
        const g2 = sortedGates[i + 1];
        if (g1.qubit === g2.qubit && g1.type === g2.type && ['H', 'X', 'Z'].includes(g1.type) && g2.step === g1.step + 1) {
          recommendations.push(`Remove redundant self-inverse ${g1.type} gate pair on wire q${g1.qubit} at steps t${g1.step} and t${g2.step} to reduce depth by 2.`);
        }
      }

      if (gates.length > 2 && !hasMeasure) {
        recommendations.push(`Append Measurement (M) gates on final steps of active wires to ready circuit for physical QPU transpile.`);
      }

      if (recommendations.length > 0) {
        return {
          text: `Circuit Optimization Suggestions:\n\n• ${recommendations.join('\n• ')}`,
          category: 'optimization',
          suggestedNextActions: ['Find Possible Mistakes', 'Explain Circuit'],
        };
      }

      return {
        text: `Circuit is already optimally packed with minimal depth (${gates.length > 0 ? Math.max(...gates.map((g) => g.step)) + 1 : 0} time steps) and zero redundant self-inverse operators.`,
        category: 'optimization',
        suggestedNextActions: ['Explain Circuit', 'Generate Qiskit/PennyLane/Cirq Code'],
      };
    }

    // =========================================================================
    // 8. HINT
    // =========================================================================
    if (effectiveAction === 'give_hint') {
      if (!hasH) {
        return {
          text: `Hint: To explore quantum parallelism, apply a Hadamard (H) gate on wire q0 at step 0 to transform ground state |0⟩ into equal superposition (|0⟩+|1⟩)/√2.`,
          latexNotation: 'H|0\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}',
          category: 'hint',
        };
      }
      if (hasH && !hasCX && circuit.numQubits > 1) {
        return {
          text: `Hint: Wire q0 is in superposition. Drag a Controlled-NOT (CX) gate with control q0 and target q1 to generate quantum entanglement.`,
          category: 'hint',
        };
      }
      return {
        text: `Hint: Every quantum gate is represented by a unitary matrix (U†U = I), meaning all quantum operations are strictly reversible until measurement collapses the state.`,
        category: 'hint',
      };
    }

    // Fallback general context-aware response
    return {
      text: `Your ${circuit.numQubits}-qubit workspace has ${gates.length} gate(s) scheduled. Active backend: ${config.backend} (${config.shots} shots).\n\nUse the quick actions above to explain this circuit, inspect the selected gate, analyze simulation results, diagnose mistakes, generate multi-framework Python code, or receive lesson recommendations.`,
      category: 'general',
      suggestedNextActions: ['Explain Circuit', 'Find Possible Mistakes', 'Generate Qiskit/PennyLane/Cirq Code', 'Recommend Next Lesson'],
    };
  },
};
