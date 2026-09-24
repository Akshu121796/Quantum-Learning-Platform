import React, { useState, useEffect, useMemo } from 'react';
import type { Circuit, QuantumBackend } from '../../types/quantum';
import { quantumApi } from '../../services/quantumApi';
import { Copy, Check, Play, Terminal, Download, Cpu, RefreshCw } from 'lucide-react';

interface CodeEditorViewProps {
  circuit: Circuit;
  backend: QuantumBackend;
  onChangeBackend?: (backend: QuantumBackend) => void;
  onRunCircuit: () => void;
  isSimulating: boolean;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  circuit,
  backend,
  onChangeBackend,
  onRunCircuit,
  isSimulating,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<'qiskit' | 'pennylane' | 'cirq'>('qiskit');

  // Synchronize framework selection with backend prop
  useEffect(() => {
    if (backend === 'Qiskit Aer') {
      setSelectedFramework('qiskit');
    } else if (backend === 'PennyLane') {
      setSelectedFramework('pennylane');
    } else if (backend === 'Cirq') {
      setSelectedFramework('cirq');
    }
  }, [backend]);

  const handleFrameworkSelect = (framework: 'qiskit' | 'pennylane' | 'cirq') => {
    setSelectedFramework(framework);
    if (onChangeBackend) {
      if (framework === 'qiskit') onChangeBackend('Qiskit Aer');
      else if (framework === 'pennylane') onChangeBackend('PennyLane');
      else if (framework === 'cirq') onChangeBackend('Cirq');
    }
  };

  // Generate code live from current circuit state
  const generatedCode = useMemo(() => {
    if (selectedFramework === 'qiskit') {
      return quantumApi.generateQiskitCode(circuit);
    } else if (selectedFramework === 'pennylane') {
      return quantumApi.generatePennyLaneCode(circuit);
    } else {
      return quantumApi.generateCirqCode(circuit);
    }
  }, [circuit, selectedFramework]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = generatedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit_${selectedFramework}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const codeLines = generatedCode.split('\n');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[460px]">
      {/* Editor Top Bar with Framework Tabs and Action Buttons */}
      <div className="bg-slate-900 text-slate-300 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white font-medium">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-300">Framework:</span>
          </div>

          {/* Framework Switcher (Qiskit, PennyLane, Cirq) */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => handleFrameworkSelect('qiskit')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-mono ${
                selectedFramework === 'qiskit'
                  ? 'bg-slate-700 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Qiskit
            </button>
            <button
              type="button"
              onClick={() => handleFrameworkSelect('pennylane')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-mono ${
                selectedFramework === 'pennylane'
                  ? 'bg-slate-700 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PennyLane
            </button>
            <button
              type="button"
              onClick={() => handleFrameworkSelect('cirq')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-mono ${
                selectedFramework === 'cirq'
                  ? 'bg-slate-700 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cirq
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-800">
            <Cpu className="w-3 h-3 text-slate-500" />
            <span>FastAPI: {backend}</span>
          </div>
        </div>

        {/* Action Buttons: Copy Code, Run Code, Download */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            title="Download Python source file (.py)"
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Copy Code Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-colors cursor-pointer"
            title="Copy Python script to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {/* Run Code Button (Uses FastAPI backend) */}
          <button
            type="button"
            onClick={onRunCircuit}
            disabled={isSimulating}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-900 font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            title={`Simulate circuit with ${backend} on FastAPI backend`}
          >
            <Play className={`w-3.5 h-3.5 fill-slate-900 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 bg-slate-950 p-4 font-mono text-xs overflow-auto leading-relaxed text-slate-200 selection:bg-slate-800">
        <pre className="m-0">
          <code>
            {codeLines.map((line, idx) => {
              const isComment = line.trim().startsWith('#');
              const isImport = line.startsWith('from') || line.startsWith('import');
              const isExecute =
                line.includes('execute') ||
                line.includes('simulator.run') ||
                line.includes('circuit()') ||
                line.includes('AerSimulator');

              return (
                <div key={idx} className="table-row">
                  <span className="table-cell select-none text-slate-600 text-right pr-4 text-[11px] w-7">
                    {idx + 1}
                  </span>
                  <span
                    className={`table-cell whitespace-pre ${
                      isComment
                        ? 'text-slate-500 italic'
                        : isImport
                        ? 'text-purple-300 font-semibold'
                        : isExecute
                        ? 'text-amber-300 font-medium'
                        : line.includes('def ') || line.includes('@')
                        ? 'text-cyan-300'
                        : 'text-slate-200'
                    }`}
                  >
                    {line}
                  </span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      {/* Editor Status Bar */}
      <div className="bg-slate-900 text-slate-400 px-4 py-2 text-[11px] font-mono flex items-center justify-between border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>FastAPI Simulation Backend Ready</span>
          <span className="text-slate-600">•</span>
          <span>Target: {selectedFramework.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-500">
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Live synced with circuit ({circuit.numQubits}Q, {circuit.gates.length} gates)</span>
          </span>
          <span className="text-slate-600">•</span>
          <span>{codeLines.length} lines</span>
        </div>
      </div>
    </div>
  );
};
