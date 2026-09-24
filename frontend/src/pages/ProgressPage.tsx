import React from 'react';
import type { UserProgress } from '../types/quantum';
import type { TabType } from '../components/layout/Navbar';
import { 
  BarChart3, 
  Trophy, 
  Flame, 
  ArrowRight, 
  CheckCircle2
} from 'lucide-react';

interface ProgressPageProps {
  progress: UserProgress;
  onNavigate: (tab: TabType, targetModuleId?: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  progress,
  onNavigate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>LEARNER ANALYTICS / COGNITIVE MASTERY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 m-0">
            Learning & Simulation Progress
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Track your quantum circuit design competencies, challenge resolutions, and simulator executions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
          <span>Current Streak:</span>
          <span className="font-bold text-slate-900">🔥 {progress.streakDays} Consecutive Days</span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Overall Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Overall Progress
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {progress.overallProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-slate-900 h-full rounded-full"
              style={{ width: `${progress.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Modules Completed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Modules Done
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {progress.modulesCompleted}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {progress.totalModules}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2">1 in progress</span>
        </div>

        {/* Challenges Solved */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Challenges Solved
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {progress.challengesSolved}
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {progress.totalChallenges}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono mt-2">50% solved</span>
        </div>

        {/* Simulation Runs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Simulations Run
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {progress.simulationRuns}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2">Across 3 backends</span>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Avg Quiz Score
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">
              {progress.averageScore}%
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono mt-2">High accuracy</span>
        </div>
      </div>

      {/* Recommended Next Step Callout */}
      <div className="bg-white rounded-xl border border-slate-900 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
              Recommended Next Step
            </span>
            <span className="text-xs text-slate-500">Automated Learning Path</span>
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {progress.recommendedNextStep.title}
          </h3>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            {progress.recommendedNextStep.description}
          </p>
        </div>

        <button
          onClick={() =>
            onNavigate('learn', progress.recommendedNextStep.targetId || 'mod-02')
          }
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shadow-xs"
        >
          <span>Continue Learning</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Topic Progress Breakdown + Competency Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Mastery Progress (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                Domain Competency Breakdown
              </h3>
              <p className="text-xs text-slate-500">Mastery measured by quizzes and circuit simulations</p>
            </div>
          </div>

          <div className="space-y-4">
            {progress.topicProgress.map((tp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{tp.topic}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-800">{tp.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${tp.percentage}%`,
                      backgroundColor: tp.color || '#0f172a',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Milestones (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 font-mono">
                Earned Credentials & Badges
              </h3>
              <span className="text-xs font-mono text-slate-400">3 of 8 unlocked</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Qubit Foundations</h4>
                  <p className="text-[11px] text-slate-500">Completed Module 01 quiz with 100% accuracy</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Bell Pair Architect</h4>
                  <p className="text-[11px] text-slate-500">Solved Challenge 02: Construct Bell State Φ⁺</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-800 flex items-center justify-center flex-shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Consistent Theorist</h4>
                  <p className="text-[11px] text-slate-500">Maintained a 4-day daily study streak</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            Next Milestone: Superposition Master (Module 02 Quiz)
          </div>
        </div>
      </div>
    </div>
  );
};
