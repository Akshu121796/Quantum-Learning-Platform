import React, { useState } from 'react';
import type { TabType } from './components/layout/Navbar';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { LearnPage } from './pages/LearnPage';
import { QuantumLabPage } from './pages/QuantumLabPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ProgressPage } from './pages/ProgressPage';
import { 
  LESSON_MODULES, 
  INITIAL_USER_PROGRESS, 
  PRESET_CIRCUITS 
} from './data/mockData';
import type { Circuit, LessonModule, SimulationResult, Challenge } from './types/quantum';
import { Atom, Shield } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [modules, setModules] = useState<LessonModule[]>(LESSON_MODULES);
  const [userProgress, setUserProgress] = useState(INITIAL_USER_PROGRESS);
  const [activeLabCircuit, setActiveLabCircuit] = useState<Circuit>(PRESET_CIRCUITS.bellState);
  const [selectedLearnModuleId, setSelectedLearnModuleId] = useState<string | null>(null);

  const handleNavigate = (tab: TabType, targetModuleId?: string) => {
    if (targetModuleId) {
      setSelectedLearnModuleId(targetModuleId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTryInLab = (module: LessonModule) => {
    if (module.interactivePreset) {
      setActiveLabCircuit(module.interactivePreset);
    }
    setActiveTab('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteModule = (moduleId: string, score: number) => {
    setModules((prev) =>
      prev.map((mod) => (mod.id === moduleId ? { ...mod, completed: true, progress: 100 } : mod))
    );
    setUserProgress((prev) => {
      const alreadyCompleted = modules.find((m) => m.id === moduleId)?.completed;
      const newCompletedCount = alreadyCompleted
        ? prev.modulesCompleted
        : Math.min(modules.length, prev.modulesCompleted + 1);
      const targetMod = modules.find((m) => m.id === moduleId);
      return {
        ...prev,
        modulesCompleted: newCompletedCount,
        overallProgress: Math.round(
          ((newCompletedCount + prev.challengesSolved) /
            (modules.length + prev.totalChallenges)) *
            100
        ),
        recentActivity: [
          {
            id: `act-mod-${Date.now()}`,
            type: 'lesson',
            title: `Completed Module ${targetMod?.number || ''}: ${targetMod?.title || ''}`,
            timestamp: 'Just now',
            status: 'completed',
            detail: `Assessment score: ${score}% • Module marked 100% complete`,
          },
          ...prev.recentActivity.slice(0, 4),
        ],
      };
    });
  };

  const handleSimulationComplete = (result: SimulationResult) => {
    setUserProgress((prev) => ({
      ...prev,
      simulationRuns: prev.simulationRuns + 1,
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          type: 'simulation',
          title: `Simulated circuit on ${result.backend}`,
          timestamp: 'Just now',
          status: 'success',
          detail: `${result.shots} shots • Execution time: ${result.executionTimeMs}ms • Depth ${result.circuitDepth}`,
        },
        ...prev.recentActivity.slice(0, 4),
      ],
    }));
  };

  const handleChallengeSolved = (challenge: Challenge, points: number) => {
    setUserProgress((prev) => ({
      ...prev,
      challengesSolved: Math.min(prev.totalChallenges, prev.challengesSolved + 1),
      recentActivity: [
        {
          id: `act-chal-${Date.now()}`,
          type: 'challenge',
          title: `Solved Challenge ${challenge.number}: ${challenge.title}`,
          timestamp: 'Just now',
          status: 'completed',
          detail: `+${points} XP awarded • Target distribution verified`,
        },
        ...prev.recentActivity.slice(0, 4),
      ],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd] text-slate-800 antialiased selection:bg-slate-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedLearnModuleId(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        xpPoints={1420 + (userProgress.challengesSolved - 2) * 100}
        streakDays={userProgress.streakDays}
      />

      {/* Main Page Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardPage
            progress={userProgress}
            modules={modules}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'learn' && (
          <LearnPage
            modules={modules}
            onTryInLab={handleTryInLab}
            selectedModuleId={selectedLearnModuleId}
            onCompleteModule={handleCompleteModule}
          />
        )}

        {activeTab === 'lab' && (
          <QuantumLabPage
            initialCircuit={activeLabCircuit}
            circuit={activeLabCircuit}
            onCircuitChange={setActiveLabCircuit}
            onSimulationComplete={handleSimulationComplete}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesPage
            onChallengeSolved={handleChallengeSolved}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressPage
            progress={userProgress}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Minimal Scientific Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Atom className="w-4 h-4 text-slate-900" />
              <span>QuantumLearn</span>
            </div>
            <span>—</span>
            <span>Learn quantum by building it.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              Decoupled Frontend Prototype
            </span>
            <span>•</span>
            <span>FastAPI Backend Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
