import React, { useState } from 'react';
import type { LessonModule } from '../types/quantum';
import { LessonModal } from '../components/learn/LessonModal';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Play, 
  Layers
} from 'lucide-react';

interface LearnPageProps {
  modules: LessonModule[];
  onTryInLab: (module: LessonModule) => void;
  selectedModuleId?: string | null;
  onCompleteModule?: (moduleId: string, score: number) => void;
}

export const LearnPage: React.FC<LearnPageProps> = ({
  modules,
  onTryInLab,
  selectedModuleId,
  onCompleteModule,
}) => {
  const [activeModule, setActiveModule] = useState<LessonModule | null>(
    selectedModuleId ? modules.find((m) => m.id === selectedModuleId) || null : null
  );

  const completedCount = modules.filter((m) => m.completed || m.progress === 100).length;
  const overallPercentage = Math.round((completedCount / (modules.length || 1)) * 100);

  const getDifficultyBadge = (difficulty: LessonModule['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Intermediate':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Advanced':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CURRICULUM / {modules.length} STRUCTURED MODULES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 m-0">
            Quantum Computing Curriculum
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            A progressive, hands-on learning roadmap from quantum statevectors to multi-qubit interference algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-slate-700">
          <span>Overall Curriculum Completion:</span>
          <span className="font-bold text-slate-900">{overallPercentage}%</span>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const isDone = mod.progress === 100;
          return (
            <div
              key={mod.id}
              className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between p-5 shadow-xs hover:border-slate-400 group ${
                isDone ? 'border-slate-200/90' : 'border-slate-200'
              }`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    MODULE {mod.number}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${getDifficultyBadge(
                        mod.difficulty
                      )}`}
                    >
                      {mod.difficulty}
                    </span>
                    {isDone && (
                      <span title="Completed" className="text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                  {mod.shortDescription}
                </p>

                {/* Progress bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold text-slate-800">{mod.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-900 h-full rounded-full transition-all duration-300"
                      style={{ width: `${mod.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Bottom / Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {mod.estimatedMinutes} min
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveModule(mod)}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Theory</span>
                  </button>

                  <button
                    onClick={() => onTryInLab(mod)}
                    title="Open preset in Quantum Lab"
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Curriculum Footnote */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Interactive Hardware Transpilation
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              All concepts learned in these modules can be directly verified in the Quantum Lab simulator and exported to Qiskit, PennyLane, or Cirq scripts.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const firstIncomplete = modules.find((m) => m.progress < 100) || modules[0];
            setActiveModule(firstIncomplete);
          }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
        >
          Continue Active Module
        </button>
      </div>

      {/* Detailed Lesson Modal with Quiz */}
      {activeModule && (
        <LessonModal
          module={activeModule}
          onClose={() => setActiveModule(null)}
          onTryInLab={onTryInLab}
          onCompleteModule={(moduleId, score) => {
            onCompleteModule?.(moduleId, score);
            setActiveModule((prev) => (prev && prev.id === moduleId ? { ...prev, completed: true, progress: 100 } : prev));
          }}
        />
      )}
    </div>
  );
};
