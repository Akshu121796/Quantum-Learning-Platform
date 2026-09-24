import React from 'react';
import type { UserProgress, LessonModule } from '../types/quantum';
import type { TabType } from '../components/layout/Navbar';
import { 
  Cpu, 
  Trophy, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface DashboardPageProps {
  progress: UserProgress;
  modules: LessonModule[];
  onNavigate: (tab: TabType, targetModuleId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  progress,
  modules,
  onNavigate,
}) => {
  const currentModule = modules.find((m) => !m.completed && m.progress < 100) || modules[0];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-mono">
            <span>SESSION ID: #QL-9842</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">● ACTIVE STUDY TRACK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 m-0">
            Welcome back, Alex.
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            You're currently exploring quantum superposition and multi-qubit entanglement. Ready to simulate your next circuit?
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Overall</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{progress.overallProgress}%</span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Streak</span>
            <span className="text-lg font-bold text-slate-900 font-mono flex items-center justify-center gap-0.5">
              <span>🔥</span>{progress.streakDays}d
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center px-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">XP Earned</span>
            <span className="text-lg font-bold text-slate-900 font-mono">1,420</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Continue Learning + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
                Continue Learning
              </span>
              <span className="text-xs font-mono text-slate-500">
                Module {currentModule.number} of {modules.length.toString().padStart(2, '0')}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {currentModule.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                    {currentModule.shortDescription}
                  </p>
                </div>
                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded border border-slate-200">
                  {currentModule.estimatedMinutes} min
                </span>
              </div>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-mono">
                  <span>Module Progress</span>
                  <span className="font-semibold text-slate-900">{currentModule.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-slate-900 h-full rounded-full transition-all duration-500"
                    style={{ width: `${currentModule.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Next: Hadamard transform and phase kickback
            </span>
            <button
              onClick={() => onNavigate('learn', currentModule.id)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Continue Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 font-mono">
              Quick Actions
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('lab')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Open Quantum Lab</span>
                    <span className="text-[11px] text-slate-500">Build & simulate custom circuits</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('challenges')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Practice Challenge</span>
                    <span className="text-[11px] text-slate-500">Solve interactive state puzzles</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('lab')}
                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Ask Quantum Tutor</span>
                    <span className="text-[11px] text-slate-500">Analyze errors & statevectors</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span>FastAPI backend link ready for deployment</span>
          </div>
        </div>
      </div>

      {/* Learning Progress Trackers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Progress Modules Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                Learning Progress
              </h3>
              <p className="text-xs text-slate-500">Mastery by quantum curriculum track</p>
            </div>
            <button
              onClick={() => onNavigate('learn')}
              className="text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All 6 Modules</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {progress.topicProgress.map((topic, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{topic.topic}</span>
                  <span className="font-mono text-slate-600 font-semibold">{topic.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topic.percentage}%`,
                      backgroundColor: topic.color || '#0f172a',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
              Recent Activity
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Last 7 days</span>
          </div>

          <div className="space-y-3.5">
            {progress.recentActivity.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mt-0.5 flex-shrink-0">
                  {act.type === 'simulation' ? (
                    <Activity className="w-3 h-3" />
                  ) : act.type === 'challenge' ? (
                    <Trophy className="w-3 h-3 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-slate-900 leading-tight">{act.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{act.detail}</p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
