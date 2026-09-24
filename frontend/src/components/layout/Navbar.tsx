import React from 'react';
import { 
  Atom, 
  LayoutDashboard, 
  BookOpen, 
  Cpu, 
  Trophy, 
  BarChart3, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export type TabType = 'dashboard' | 'learn' | 'lab' | 'challenges' | 'progress';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  xpPoints?: number;
  streakDays?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  xpPoints = 1420,
  streakDays = 4,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'learn' as TabType, label: 'Learn', icon: BookOpen },
    { id: 'lab' as TabType, label: 'Quantum Lab', icon: Cpu },
    { id: 'challenges' as TabType, label: 'Challenges', icon: Trophy },
    { id: 'progress' as TabType, label: 'Progress', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition-colors">
                <Atom className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-tight text-slate-900 text-base">QuantumLearn</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">v1.2</span>
                </div>
                <p className="text-[11px] text-slate-500 tracking-normal hidden sm:block">Learn quantum by building it.</p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Status & Profile */}
          <div className="flex items-center gap-3">
            {/* Status pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Aer Simulator Online</span>
            </div>

            {/* Streak & XP */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <span>🔥</span>
                <span>{streakDays}d streak</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                <span>{xpPoints} XP</span>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                AV
              </div>
              <div className="hidden xl:block text-left text-xs">
                <p className="font-medium text-slate-800 leading-tight">Alex Vance</p>
                <p className="text-[10px] text-slate-500">Student Researcher</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded text-xs ${
                  isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
