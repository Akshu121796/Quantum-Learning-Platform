import type { Circuit, SimulationConfig, SimulationResult, StateVectorElement, QuantumBackend } from '../types/quantum';
import { CHALLENGES } from '../data/mockData';

interface Complex {
  r: number;
  i: number;
}

const cAdd = (a: Complex, b: Complex): Complex => ({ r: a.r + b.r, i: a.i + b.i });
const cMul = (a: Complex, b: Complex): Complex => ({
  r: a.r * b.r - a.i * b.i,
  i: a.r * b.i + a.i * b.r,
});
const cMagSq = (a: Complex): number => a.r * a.r + a.i * a.i;

function calculateCircuitStateVector(circuit: Circuit): { stateVector: Complex[]; numQubits: number } {
  const numQubits = Math.max(1, Math.min(circuit.numQubits, 4));
  const dim = 1 << numQubits;
  let state: Complex[] = Array.from({ length: dim }, (_, idx) => (idx === 0 ? { r: 1, i: 0 } : { r: 0, i: 0 }));

  const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);
  const SQRT1_2 = 1 / Math.SQRT2;

  for (const gate of sortedGates) {
    const nextState: Complex[] = Array.from({ length: dim }, () => ({ r: 0, i: 0 }));

    if (gate.type === 'H') {
      const q = gate.qubit;
      for (let i = 0; i < dim; i++) {
        const bit = (i >> (numQubits - 1 - q)) & 1;
        const paired = i ^ (1 << (numQubits - 1 - q));
        if (bit === 0) {
          nextState[i] = cAdd(nextState[i], cMul(state[i], { r: SQRT1_2, i: 0 }));
          nextState[paired] = cAdd(nextState[paired], cMul(state[i], { r: SQRT1_2, i: 0 }));
        } else {
          nextState[paired] = cAdd(nextState[paired], cMul(state[i], { r: SQRT1_2, i: 0 }));
          nextState[i] = cAdd(nextState[i], cMul(state[i], { r: -SQRT1_2, i: 0 }));
        }
      }
      state = nextState;
    } else if (gate.type === 'X') {
      const q = gate.qubit;
      for (let i = 0; i < dim; i++) {
        const targetIdx = i ^ (1 << (numQubits - 1 - q));
        nextState[targetIdx] = state[i];
      }
      state = nextState;
    } else if (gate.type === 'Y') {
      const q = gate.qubit;
      for (let i = 0; i < dim; i++) {
        const bit = (i >> (numQubits - 1 - q)) & 1;
        const targetIdx = i ^ (1 << (numQubits - 1 - q));
        if (bit === 0) {
          nextState[targetIdx] = cMul(state[i], { r: 0, i: 1 });
        } else {
          nextState[targetIdx] = cMul(state[i], { r: 0, i: -1 });
        }
      }
      state = nextState;
    } else if (gate.type === 'Z') {
      const q = gate.qubit;
      for (let i = 0; i < dim; i++) {
        const bit = (i >> (numQubits - 1 - q)) & 1;
        if (bit === 1) {
          nextState[i] = cMul(state[i], { r: -1, i: 0 });
        } else {
          nextState[i] = state[i];
        }
      }
      state = nextState;
    } else if (gate.type === 'S') {
      const q = gate.qubit;
      for (let i = 0; i < dim; i++) {
        const bit = (i >> (numQubits - 1 - q)) & 1;
        if (bit === 1) {
          nextState[i] = cMul(state[i], { r: 0, i: 1 });
        } else {
          nextState[i] = state[i];
        }
      }
      state = nextState;
    } else if (gate.type === 'T') {
      const q = gate.qubit;
      const phaseT: Complex = { r: Math.cos(Math.PI / 4), i: Math.sin(Math.PI / 4) };
      for (let i = 0; i < dim; i++) {
        const bit = (i >> (numQubits - 1 - q)) & 1;
        if (bit === 1) {
          nextState[i] = cMul(state[i], phaseT);
        } else {
          nextState[i] = state[i];
        }
      }
      state = nextState;
    } else if (gate.type === 'CX' && gate.targetQubit !== undefined) {
      const ctrl = gate.qubit;
      const trgt = gate.targetQubit;
      for (let i = 0; i < dim; i++) {
        const ctrlBit = (i >> (numQubits - 1 - ctrl)) & 1;
        if (ctrlBit === 1) {
          const targetIdx = i ^ (1 << (numQubits - 1 - trgt));
          nextState[targetIdx] = state[i];
        } else {
          nextState[i] = state[i];
        }
      }
      state = nextState;
    } else if (gate.type === 'SWAP' && gate.targetQubit !== undefined) {
      const q1 = gate.qubit;
      const q2 = gate.targetQubit;
      for (let i = 0; i < dim; i++) {
        const b1 = (i >> (numQubits - 1 - q1)) & 1;
        const b2 = (i >> (numQubits - 1 - q2)) & 1;
        if (b1 !== b2) {
          const swapped = i ^ (1 << (numQubits - 1 - q1)) ^ (1 << (numQubits - 1 - q2));
          nextState[swapped] = state[i];
        } else {
          nextState[i] = state[i];
        }
      }
      state = nextState;
    } else {
      for (let i = 0; i < dim; i++) {
        nextState[i] = state[i];
      }
      state = nextState;
    }
  }

  return { stateVector: state, numQubits };
}

const BACKEND_MAP: Record<QuantumBackend, string> = {
  'Qiskit Aer': 'qiskit_aer',
  'PennyLane': 'pennylane',
  'Cirq': 'cirq',
};

interface BackendSimulationResponse {
  backend: string;
  shots: number;
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  execution_time_ms: number;
}

export const quantumApi = {
  async simulateCircuit(circuit: Circuit, config: SimulationConfig): Promise<SimulationResult> {
    const apiBaseUrl = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://127.0.0.1:8000';
    
    const backendKey = BACKEND_MAP[config.backend] || 'qiskit_aer';
    const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);

    const formattedGates = sortedGates.map((gate) => {
      if (gate.type === 'CX' || gate.type === 'SWAP') {
        const target = gate.targetQubit !== undefined 
          ? gate.targetQubit 
          : (gate.qubit + 1 < circuit.numQubits ? gate.qubit + 1 : 0);
        return {
          type: gate.type,
          targets: [gate.qubit, target],
        };
      }
      return {
        type: gate.type,
        targets: [gate.qubit],
      };
    });

    const payload = {
      backend: backendKey,
      qubits: circuit.numQubits,
      shots: config.shots || 1000,
      gates: formattedGates,
    };

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}/api/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (networkErr: unknown) {
      throw new Error(
        `Failed to connect to backend at ${apiBaseUrl}. Ensure the FastAPI server is running.`
      );
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const errorDetail = errorJson.detail || `Backend responded with status ${response.status}`;
      throw new Error(typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail));
    }

    const data: BackendSimulationResponse = await response.json();

    const { stateVector } = calculateCircuitStateVector(circuit);
    const dim = stateVector.length;
    const rawProbs = stateVector.map((c) => Math.max(0, cMagSq(c)));
    const sumProbs = rawProbs.reduce((acc, p) => acc + p, 0) || 1;
    const normalizedProbs = rawProbs.map((p) => p / sumProbs);

    const stateVectorElements: StateVectorElement[] = [];
    for (let i = 0; i < dim; i++) {
      const binary = i.toString(2).padStart(circuit.numQubits, '0');
      const c = stateVector[i];
      const prob = Number(normalizedProbs[i].toFixed(4));
      if (prob > 0.0001 || dim <= 4) {
        let ampStr = '';
        if (Math.abs(c.i) < 0.0001) {
          ampStr = c.r.toFixed(3);
        } else if (Math.abs(c.r) < 0.0001) {
          ampStr = `${c.i.toFixed(3)}i`;
        } else {
          ampStr = `${c.r.toFixed(3)} ${c.i > 0 ? '+' : '-'} ${Math.abs(c.i).toFixed(3)}i`;
        }
        const phaseAngle = (Math.atan2(c.i, c.r) * (180 / Math.PI)).toFixed(1);
        stateVectorElements.push({
          binary,
          amplitude: ampStr,
          phase: `${phaseAngle}°`,
          probability: prob,
        });
      }
    }

    const circuitDepth = circuit.gates.length > 0 ? Math.max(...circuit.gates.map((g) => g.step)) + 1 : 0;

    return {
      probabilities: data.probabilities,
      counts: data.counts,
      stateVector: stateVectorElements,
      executionTimeMs: data.execution_time_ms,
      backend: config.backend,
      shots: data.shots,
      timestamp: new Date().toISOString(),
      circuitDepth,
      qubitCount: circuit.numQubits,
    };
  },

  generateQiskitCode(circuit: Circuit): string {
    const lines: string[] = [];
    lines.push('from qiskit import QuantumCircuit, Aer, execute');
    lines.push('');
    lines.push(`qc = QuantumCircuit(${circuit.numQubits}, ${circuit.numQubits})`);
    lines.push('');

    const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);

    if (sortedGates.length === 0) {
      lines.push('qc.h(0)');
      lines.push('qc.measure_all()');
    } else {
      for (const gate of sortedGates) {
        switch (gate.type) {
          case 'H':
            lines.push(`qc.h(${gate.qubit})`);
            break;
          case 'X':
            lines.push(`qc.x(${gate.qubit})`);
            break;
          case 'Y':
            lines.push(`qc.y(${gate.qubit})`);
            break;
          case 'Z':
            lines.push(`qc.z(${gate.qubit})`);
            break;
          case 'S':
            lines.push(`qc.s(${gate.qubit})`);
            break;
          case 'T':
            lines.push(`qc.t(${gate.qubit})`);
            break;
          case 'CX':
            if (gate.targetQubit !== undefined) {
              lines.push(`qc.cx(${gate.qubit}, ${gate.targetQubit})`);
            }
            break;
          case 'SWAP':
            if (gate.targetQubit !== undefined) {
              lines.push(`qc.swap(${gate.qubit}, ${gate.targetQubit})`);
            }
            break;
          case 'M':
            lines.push(`qc.measure(${gate.qubit}, ${gate.qubit})`);
            break;
        }
      }
    }

    const hasMeasurements = sortedGates.some((g) => g.type === 'M');
    if (!hasMeasurements && sortedGates.length > 0) {
      lines.push('');
      lines.push('qc.measure_all()');
    }

    lines.push('');
    lines.push('backend = Aer.get_backend("qasm_simulator")');
    lines.push('job = execute(qc, backend, shots=1000)');
    lines.push('result = job.result()');
    lines.push('counts = result.get_counts(qc)');
    lines.push('print("Measurement counts:", counts)');

    return lines.join('\n');
  },

  generatePennyLaneCode(circuit: Circuit): string {
    const lines: string[] = [];
    lines.push('import pennylane as qml');
    lines.push('');
    lines.push(`dev = qml.device("default.qubit", wires=${circuit.numQubits}, shots=1000)`);
    lines.push('');
    lines.push('@qml.qnode(dev)');
    lines.push('def circuit():');

    const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);
    if (sortedGates.length === 0) {
      lines.push('    qml.Hadamard(wires=0)');
      lines.push('    return qml.probs(wires=range(1))');
    } else {
      for (const gate of sortedGates) {
        if (gate.type === 'H') lines.push(`    qml.Hadamard(wires=${gate.qubit})`);
        else if (gate.type === 'X') lines.push(`    qml.PauliX(wires=${gate.qubit})`);
        else if (gate.type === 'Y') lines.push(`    qml.PauliY(wires=${gate.qubit})`);
        else if (gate.type === 'Z') lines.push(`    qml.PauliZ(wires=${gate.qubit})`);
        else if (gate.type === 'S') lines.push(`    qml.S(wires=${gate.qubit})`);
        else if (gate.type === 'T') lines.push(`    qml.T(wires=${gate.qubit})`);
        else if (gate.type === 'CX' && gate.targetQubit !== undefined) {
          lines.push(`    qml.CNOT(wires=[${gate.qubit}, ${gate.targetQubit}])`);
        } else if (gate.type === 'SWAP' && gate.targetQubit !== undefined) {
          lines.push(`    qml.SWAP(wires=[${gate.qubit}, ${gate.targetQubit}])`);
        }
      }
      lines.push(`    return qml.probs(wires=range(${circuit.numQubits}))`);
    }

    lines.push('');
    lines.push('print("Probabilities:", circuit())');
    return lines.join('\n');
  },

  generateCirqCode(circuit: Circuit): string {
    const lines: string[] = [];
    lines.push('import cirq');
    lines.push('');
    lines.push(`qubits = cirq.LineQubit.range(${circuit.numQubits})`);
    lines.push('circuit = cirq.Circuit(');

    const sortedGates = [...circuit.gates].sort((a, b) => a.step - b.step);
    for (const gate of sortedGates) {
      if (gate.type === 'H') lines.push(`    cirq.H(qubits[${gate.qubit}]),`);
      else if (gate.type === 'X') lines.push(`    cirq.X(qubits[${gate.qubit}]),`);
      else if (gate.type === 'Y') lines.push(`    cirq.Y(qubits[${gate.qubit}]),`);
      else if (gate.type === 'Z') lines.push(`    cirq.Z(qubits[${gate.qubit}]),`);
      else if (gate.type === 'S') lines.push(`    cirq.S(qubits[${gate.qubit}]),`);
      else if (gate.type === 'T') lines.push(`    cirq.T(qubits[${gate.qubit}]),`);
      else if (gate.type === 'CX' && gate.targetQubit !== undefined) {
        lines.push(`    cirq.CNOT(qubits[${gate.qubit}], qubits[${gate.targetQubit}]),`);
      } else if (gate.type === 'SWAP' && gate.targetQubit !== undefined) {
        lines.push(`    cirq.SWAP(qubits[${gate.qubit}], qubits[${gate.targetQubit}]),`);
      } else if (gate.type === 'M') {
        lines.push(`    cirq.measure(qubits[${gate.qubit}], key='m${gate.qubit}'),`);
      }
    }
    lines.push(')');
    lines.push('');

    const hasCirqMeasurements = sortedGates.some((g) => g.type === 'M');
    if (!hasCirqMeasurements) {
      lines.push('circuit.append(cirq.measure(*qubits, key="result"))');
      lines.push('');
    }

    lines.push('simulator = cirq.Simulator()');
    lines.push('results = simulator.run(circuit, repetitions=1000)');
    lines.push('print("Circuit:")');
    lines.push('print(circuit)');
    lines.push('print("Simulation results:", results)');
    return lines.join('\n');
  },

  async verifyChallenge(challengeId: string, circuit: Circuit): Promise<{ passed: boolean; message: string; score: number }> {
    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) {
      return { passed: false, message: 'Challenge not found', score: 0 };
    }

    const { stateVector, numQubits } = calculateCircuitStateVector(circuit);
    const rawProbs = stateVector.map((c) => cMagSq(c));
    const sumProbs = rawProbs.reduce((a, b) => a + b, 0) || 1;
    const empiricalProbs: Record<string, number> = {};

    for (let i = 0; i < stateVector.length; i++) {
      const bin = i.toString(2).padStart(numQubits, '0');
      empiricalProbs[bin] = rawProbs[i] / sumProbs;
    }

    let allMatch = true;
    for (const [targetState, targetProb] of Object.entries(challenge.targetProbabilities)) {
      const actualProb = empiricalProbs[targetState] || 0;
      if (Math.abs(actualProb - targetProb) > challenge.tolerance) {
        allMatch = false;
        break;
      }
    }

    for (const [state, actualProb] of Object.entries(empiricalProbs)) {
      if (!challenge.targetProbabilities[state] && actualProb > challenge.tolerance) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      return {
        passed: true,
        message: `Success! Target probability distribution achieved. ${challenge.explanation}`,
        score: challenge.points,
      };
    } else {
      return {
        passed: false,
        message: `Target state not yet reached. Check the objective and try using the hint.`,
        score: 0,
      };
    }
  },
};
