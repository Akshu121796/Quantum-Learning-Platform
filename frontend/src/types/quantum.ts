export type GateType = 'H' | 'X' | 'Y' | 'Z' | 'CX' | 'S' | 'T' | 'SWAP' | 'M';

export interface GateDefinition {
  type: GateType;
  name: string;
  symbol: string;
  description: string;
  matrixLatex?: string;
  isMultiQubit?: boolean;
  category: 'single' | 'multi' | 'measurement' | 'phase';
}

export interface CircuitGate {
  id: string;
  type: GateType;
  qubit: number;        // Primary wire index (0, 1, 2, ...)
  targetQubit?: number; // For CX or SWAP (control is qubit, target is targetQubit)
  step: number;         // Time slice index (0, 1, 2, 3...)
}

export interface Circuit {
  id: string;
  name: string;
  description?: string;
  numQubits: number;
  steps: number;
  gates: CircuitGate[];
}

export type QuantumBackend = 'Qiskit Aer' | 'PennyLane' | 'Cirq';

export interface SimulationConfig {
  backend: QuantumBackend;
  shots: number;
  noiseModel?: boolean;
  seed?: number;
}

export interface StateVectorElement {
  binary: string;
  amplitude: string;
  phase: string;
  probability: number;
}

export interface SimulationResult {
  probabilities: Record<string, number>; // e.g. {"00": 0.50, "11": 0.50}
  counts: Record<string, number>;        // e.g. {"00": 500, "11": 500}
  stateVector: StateVectorElement[];
  executionTimeMs: number;
  backend: QuantumBackend;
  shots: number;
  timestamp: string;
  circuitDepth: number;
  qubitCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VisualStep {
  label: string;
  value: string;
  badge?: string;
  detail?: string;
}

export interface LessonModule {
  id: string;
  number: string;
  title: string;
  shortDescription: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number; // 0 to 100
  estimatedMinutes: number;
  summary: string;
  keyConcepts: string[];
  latexSnippet?: string;
  interactivePreset?: Circuit;
  quiz: QuizQuestion[];
  completed?: boolean;
  visualExplanation?: {
    title: string;
    description: string;
    steps: VisualStep[];
    note?: string;
  };
}

export interface Challenge {
  id: string;
  number: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  objective: string;
  instructions: string[];
  hint: string;
  initialCircuit: Circuit;
  targetProbabilities: Record<string, number>;
  tolerance: number; // e.g. 0.05
  explanation: string;
  points: number;
  solved?: boolean;
}

export interface RecentActivity {
  id: string;
  type: 'lesson' | 'simulation' | 'challenge';
  title: string;
  timestamp: string;
  status: 'completed' | 'success' | 'attempted';
  detail: string;
}

export interface UserProgress {
  overallProgress: number; // percentage
  modulesCompleted: number;
  totalModules: number;
  challengesSolved: number;
  totalChallenges: number;
  simulationRuns: number;
  averageScore: number;
  streakDays: number;
  topicProgress: {
    topic: string;
    percentage: number;
    color?: string;
  }[];
  recentActivity: RecentActivity[];
  recommendedNextStep: {
    title: string;
    type: 'lesson' | 'challenge' | 'lab';
    description: string;
    targetId?: string;
  };
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  contextAction?: 'explain_circuit' | 'explain_result' | 'find_error' | 'give_hint';
}
