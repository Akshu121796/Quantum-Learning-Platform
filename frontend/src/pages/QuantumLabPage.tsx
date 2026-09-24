import React, { useState, useEffect } from 'react';
import type { 
  Circuit, 
  GateType, 
  SimulationConfig, 
  SimulationResult 
} from '../types/quantum';
import { PRESET_CIRCUITS } from '../data/mockData';
import { quantumApi } from '../services/quantumApi';
import { GatePalette } from '../components/quantum/GatePalette';
import { CircuitCanvas } from '../components/quantum/CircuitCanvas';
import { SimulationControls } from '../components/quantum/SimulationControls';
import { CodeEditorView } from '../components/quantum/CodeEditorView';
import { SimulationResults } from '../components/quantum/SimulationResults';
import { GuidedLabTutorial } from '../components/quantum/GuidedLabTutorial';
import { BeginnerExplainerBar } from '../components/quantum/BeginnerExplainerBar';
import { FloatingTutorDrawer } from '../components/tutor/FloatingTutorDrawer';
import { 
  Code2, 
  LayoutGrid, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Compass, 
  Lightbulb 
} from 'lucide-react';

interface QuantumLabPageProps {
  initialCircuit?: Circuit;
  circuit?: Circuit;
  onCircuitChange?: (circuit: Circuit) => void;
  onSimulationComplete?: (result: SimulationResult) => void;
}

export const QuantumLabPage: React.FC<QuantumLabPageProps> = ({
  initialCircuit,
  circuit: controlledCircuit,
  onCircuitChange,
  onSimulationComplete,
}) => {
  const [internalCircuit, setInternalCircuit] = useState<Circuit>(
    controlledCircuit || initialCircuit || PRESET_CIRCUITS.bellState
  );

  const circuit = controlledCircuit || internalCircuit;

  const handleUpdateCircuit = (updated: Circuit) => {
    setInternalCircuit(updated);
    onCircuitChange?.(updated);
  };

  useEffect(() => {
    if (initialCircuit) {
      setInternalCircuit(initialCircuit);
      onCircuitChange?.(initialCircuit);
      setSimulationResult(null); // Explicitly reset result; do NOT auto-simulate
      setSimError(null);
    }
  }, [initialCircuit]);

  const [selectedGate, setSelectedGate] = useState<GateType | null>('H');
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [config, setConfig] = useState<SimulationConfig>({
    backend: 'Qiskit Aer',
    shots: 1000,
    noiseModel: false,
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  // Beginner Guided Lab State
  const [isGuidedLabActive, setIsGuidedLabActive] = useState(false);
  const [guidedStep, setGuidedStep] = useState(1);

  // Beginner "What am I doing?" Explainer Toggle
  const [showBeginnerExplainer, setShowBeginnerExplainer] = useState(true);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimError(null);
    try {
      const result = await quantumApi.simulateCircuit(circuit, config);
      setSimulationResult(result);
      if (onSimulationComplete) {
        onSimulationComplete(result);
      }
    } catch (err: unknown) {
      setSimError(err instanceof Error ? err.message : 'Simulation failed unexpectedly');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleLoadPreset = (presetKey: string) => {
    const preset = PRESET_CIRCUITS[presetKey];
    if (preset) {
      handleUpdateCircuit(preset);
      setSimulationResult(null);
      setSimError(null);
    }
  };

  const handleStartGuidedLab = () => {
    setIsGuidedLabActive(true);
    setGuidedStep(1);
    setSelectedGate('H');
    // Initialize a clean 2-qubit circuit for the guided experience
    handleUpdateCircuit({
      id: 'guided-lab-circuit',
      name: 'Guided Lab: Bell State',
      numQubits: 2,
      steps: 6,
      gates: [],
    });
    setSimulationResult(null);
    setSimError(null);
  };

  const handleQuickAddGate = (gate: GateType) => {
    const maxStep = circuit.gates.length > 0 ? Math.max(...circuit.gates.map((g) => g.step)) + 1 : 0;
    const targetStep = Math.min(circuit.steps - 1, maxStep);

    let newGate;
    if (gate === 'CX' || gate === 'SWAP') {
      newGate = {
        id: `gate-qa-${Date.now()}`,
        type: gate,
        qubit: 0,
        targetQubit: 1 < circuit.numQubits ? 1 : 0,
        step: targetStep,
      };
    } else {
      newGate = {
        id: `gate-qa-${Date.now()}`,
        type: gate,
        qubit: 0,
        step: targetStep,
      };
    }

    handleUpdateCircuit({
      ...circuit,
      gates: [...circuit.gates, newGate],
    });
  };

  const circuitDepth = circuit.gates.length > 0 ? Math.max(...circuit.gates.map((g) => g.step)) + 1 : 0;

  // Compute guided highlight targets
  const highlightGate: GateType | null = isGuidedLabActive
    ? guidedStep === 2
      ? 'H'
      : guidedStep === 3
      ? 'CX'
      : null
    : null;

  const highlightCell = isGuidedLabActive
    ? guidedStep === 2
      ? { qubit: 0, step: 0 }
      : guidedStep === 3
      ? { qubit: 0, step: 1 }
      : null
    : null;

  const highlightQubits = isGuidedLabActive && guidedStep === 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Laboratory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-0.5">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              LAB WORKSPACE
            </span>
            <span>•</span>
            <span className="text-slate-800 font-semibold">{circuit.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 m-0">
            Quantum Lab
          </h1>
        </div>

        {/* Experiment status tags, Beginner Guided Buttons & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Start Guided Lab Button */}
          {!isGuidedLabActive ? (
            <button
              type="button"
              onClick={handleStartGuidedLab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Start Guided Lab</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsGuidedLabActive(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium text-xs shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Guided Lab Active (Step {guidedStep}/3)</span>
            </button>
          )}

          {/* "What am I doing?" Toggle Button */}
          <button
            type="button"
            onClick={() => setShowBeginnerExplainer(!showBeginnerExplainer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              showBeginnerExplainer
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title="Toggle live beginner explanation"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${showBeginnerExplainer ? 'text-amber-600 fill-amber-500/20' : 'text-slate-400'}`} />
            <span>What am I doing?</span>
          </button>

          <div className="hidden xl:flex items-center gap-2 font-mono text-xs">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Valid Topology
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              <Cpu className="w-3 h-3 text-slate-500" />
              {config.backend}
            </span>
            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Depth: {circuitDepth}
            </span>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'visual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Visual Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guided Lab 3-Step Tutorial Banner */}
      {isGuidedLabActive && (
        <GuidedLabTutorial
          circuit={circuit}
          onUpdateCircuit={handleUpdateCircuit}
          onSelectGate={(gate) => setSelectedGate(gate)}
          onClose={() => setIsGuidedLabActive(false)}
          currentStep={guidedStep}
          onChangeStep={setGuidedStep}
        />
      )}

      {/* "What am I doing?" Live Beginner Explainer Bar */}
      {showBeginnerExplainer && (
        <BeginnerExplainerBar
          circuit={circuit}
          selectedGate={selectedGate}
        />
      )}

      {/* Main Builder Grid */}
      {activeTab === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <GatePalette
              selectedGate={selectedGate}
              onSelectGate={(gate) => setSelectedGate(gate)}
              onQuickAdd={handleQuickAddGate}
              highlightGate={highlightGate}
            />
          </div>

          <div className="lg:col-span-6">
            <CircuitCanvas
              circuit={circuit}
              selectedGate={selectedGate}
              onUpdateCircuit={handleUpdateCircuit}
              onLoadPreset={handleLoadPreset}
              highlightCell={highlightCell}
              highlightQubits={highlightQubits}
            />
          </div>

          <div className="lg:col-span-3">
            <SimulationControls
              config={config}
              onChangeConfig={setConfig}
              onSimulate={handleRunSimulation}
              isSimulating={isSimulating}
              gateCount={circuit.gates.length}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <CodeEditorView
              circuit={circuit}
              backend={config.backend}
              onChangeBackend={(b) => setConfig((prev) => ({ ...prev, backend: b }))}
              onRunCircuit={handleRunSimulation}
              isSimulating={isSimulating}
            />
          </div>
          <div className="lg:col-span-4">
            <SimulationControls
              config={config}
              onChangeConfig={setConfig}
              onSimulate={handleRunSimulation}
              isSimulating={isSimulating}
              gateCount={circuit.gates.length}
            />
          </div>
        </div>
      )}

      {/* Results Section - Full Width Experiment Report */}
      <div className="pt-2">
        <SimulationResults
          result={simulationResult}
          isSimulating={isSimulating}
          circuit={circuit}
          error={simError}
        />
      </div>

      {/* Floating Quantum Tutor Assistant Drawer */}
      <FloatingTutorDrawer
        circuit={circuit}
        simulationResult={simulationResult}
        config={config}
        activeGate={selectedGate}
      />
    </div>
  );
};
