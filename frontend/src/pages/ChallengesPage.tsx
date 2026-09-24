import React, { useState } from 'react';
import type { Challenge, Circuit, GateType } from '../types/quantum';
import { CHALLENGES } from '../data/mockData';
import { quantumApi } from '../services/quantumApi';
import { QuantumCanvas } from '../components/lab/QuantumCanvas';
import { GatePalette } from '../components/lab/GatePalette';
import { 
  Trophy, 
  Target, 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw
} from 'lucide-react';

interface ChallengesPageProps {
  onChallengeSolved?: (challenge: Challenge, points: number) => void;
}

export const ChallengesPage: React.FC<ChallengesPageProps> = ({
  onChallengeSolved,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>(CHALLENGES);
  const [activeChallengeId, setActiveChallengeId] = useState<string>(CHALLENGES[0].id);
  const [selectedGate, setSelectedGate] = useState<GateType | null>('H');
  const [activeCircuit, setActiveCircuit] = useState<Circuit>(CHALLENGES[0].initialCircuit);
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState<{
    passed?: boolean;
    message?: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const activeChallenge = challenges.find((c) => c.id === activeChallengeId) || challenges[0];

  const handleSelectChallenge = (c: Challenge) => {
    setActiveChallengeId(c.id);
    setActiveCircuit(c.initialCircuit);
    setFeedback(null);
    setShowHint(false);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setFeedback(null);

    try {
      const result = await quantumApi.verifyChallenge(activeChallenge.id, activeCircuit);
      setFeedback({
        passed: result.passed,
        message: result.message,
      });

      if (result.passed) {
        setChallenges((prev) =>
          prev.map((c) => (c.id === activeChallenge.id ? { ...c, solved: true } : c))
        );
        if (onChallengeSolved) {
          onChallengeSolved(activeChallenge, result.score);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetCircuit = () => {
    setActiveCircuit(activeChallenge.initialCircuit);
    setFeedback(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>PRACTICE ARENA / QUANTUM CHALLENGES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 m-0">
            Interactive Quantum Challenges
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Test your intuition by constructing circuits that satisfy target state distributions and unitary constraints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-2">
            <span>Solved:</span>
            <span className="font-bold text-slate-900">
              {challenges.filter((c) => c.solved).length} / {challenges.length}
            </span>
          </div>
        </div>
      </div>

      {/* Challenge Cards Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {challenges.map((c) => {
          const isCurrent = c.id === activeChallenge.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectChallenge(c)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isCurrent
                  ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  Challenge {c.number}
                </span>
                {c.solved ? (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Solved
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    +{c.points} XP
                  </span>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{c.objective}</p>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Challenge Briefing (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-semibold text-slate-600">
                Challenge #{activeChallenge.number}
              </span>
              <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                +{activeChallenge.points} XP
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{activeChallenge.title}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{activeChallenge.category}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-1">
                <Target className="w-3.5 h-3.5 text-slate-700" />
                <span>Objective:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeChallenge.objective}
              </p>
            </div>

            {/* Target Probability Table */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                Target Probability Distribution
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.entries(activeChallenge.targetProbabilities).map(([st, prob]) => (
                  <div key={st} className="p-2 rounded bg-slate-100 border border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">|{st}⟩</span>
                    <span className="text-slate-600">{(prob * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions list */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                Guidelines
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {activeChallenge.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hint toggler */}
            <div className="pt-2 border-t border-slate-100">
              {showHint ? (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1 font-semibold">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                    <span>Hint</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{activeChallenge.hint}</p>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Need a hint?</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Challenge Circuit Canvas + Gate Palette + Evaluation (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <GatePalette
                selectedGate={selectedGate}
                onSelectGate={setSelectedGate}
                onQuickAdd={(gate) => {
                  setActiveCircuit({
                    ...activeCircuit,
                    gates: [
                      ...activeCircuit.gates,
                      {
                        id: `chal-gate-${Date.now()}`,
                        type: gate,
                        qubit: 0,
                        step: activeCircuit.gates.length,
                      },
                    ],
                  });
                }}
              />
            </div>
            <div className="md:col-span-2">
              <QuantumCanvas
                circuit={activeCircuit}
                selectedGate={selectedGate}
                onUpdateCircuit={setActiveCircuit}
                onLoadPreset={() => {}}
              />
            </div>
          </div>

          {/* Submission and Feedback Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCircuit}
                className="px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Circuit</span>
              </button>
            </div>

            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Statevector...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit & Verify Circuit</span>
                </>
              )}
            </button>
          </div>

          {/* Result / Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 flex items-start gap-3 ${
                feedback.passed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {feedback.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {feedback.passed ? 'Challenge Passed!' : 'Distribution Mismatch'}
                </p>
                <p>{feedback.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
