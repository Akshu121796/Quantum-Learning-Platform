import React, { useState, useMemo } from 'react';
import type { User } from '../types/auth';
import { 
  MOCK_STUDENTS, 
  MOCK_MODULE_STATS, 
  MOCK_CHALLENGE_STATS, 
  MOCK_CLASS_OVERVIEW,
} from '../data/instructorMockData';
import type { StudentProgressItem } from '../data/instructorMockData';
import { 
  Atom, 
  UserCheck, 
  LogOut, 
  Users, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  LayoutDashboard,
  Search, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  Filter,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export type InstructorTabType = 'dashboard' | 'students' | 'modules' | 'challenges';

interface InstructorPageProps {
  user: User;
  onLogout: () => void;
}

export const InstructorPage: React.FC<InstructorPageProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<InstructorTabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'idle'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgressItem | null>(null);

  // Filter students based on search and status filter
  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter((student) => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const navItems = [
    { id: 'dashboard' as InstructorTabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students' as InstructorTabType, label: 'Students', icon: Users },
    { id: 'modules' as InstructorTabType, label: 'Modules', icon: BookOpen },
    { id: 'challenges' as InstructorTabType, label: 'Challenges', icon: Trophy },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd] text-slate-800 antialiased selection:bg-slate-200">
      {/* Instructor Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand + Nav */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                  <Atom className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tracking-tight text-slate-900 text-base">QuantumLearn</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-purple-700" />
                      INSTRUCTOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Tabs */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`instructor-nav-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
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

            {/* Right Side: Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
                <span>Cohort Quantum-2026 Online</span>
              </div>

              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-xs font-bold text-purple-800">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'I'}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-slate-900 leading-tight">{user.name || 'Faculty Instructor'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                id="instructor-logout-btn"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium shadow-xs transition-colors cursor-pointer"
                title="Sign out of instructor portal"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Logout</span>
              </button>
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
                  onClick={() => setActiveTab(item.id)}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Header Banner */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5 text-slate-500 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    COHORT OVERVIEW
                  </span>
                  <span>•</span>
                  <span>PHYSICS & COMPUTER SCIENCE DEPT</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 m-0">
                  Instructor Control Dashboard
                </h1>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Real-time analytics for Quantum Computing track: track student progress, module completion velocity, and challenge performance.
                </p>
              </div>

              <div className="flex items-center gap-3 bg-purple-50/80 p-3.5 rounded-lg border border-purple-200">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-purple-900 block">Class Average Score</span>
                  <span className="text-purple-700 font-mono font-medium">91.4% Assessment Average</span>
                </div>
              </div>
            </div>

            {/* Overview KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Students */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    Total Students
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold font-mono text-slate-900">
                    {MOCK_CLASS_OVERVIEW.totalStudents}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Enrolled in Quantum Track</p>
                </div>
              </div>

              {/* Card 2: Active Learners */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    Active Learners
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold font-mono text-slate-900">
                    {MOCK_CLASS_OVERVIEW.activeLearners}
                  </span>
                  <p className="text-xs text-emerald-600 font-medium mt-1">● 78% active this week</p>
                </div>
              </div>

              {/* Card 3: Average Progress */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    Average Progress
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold font-mono text-slate-900">
                    {MOCK_CLASS_OVERVIEW.averageProgress}%
                  </span>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${MOCK_CLASS_OVERVIEW.averageProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Challenges Completed */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
                    Challenges Solved
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold font-mono text-slate-900">
                    {MOCK_CLASS_OVERVIEW.challengesCompleted}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Verified circuit solutions</p>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Module Completion Rates */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Learning Module Completion Rate</h3>
                    <p className="text-xs text-slate-500">Percentage of class completing each module</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Modules 01 - 07
                  </span>
                </div>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_MODULE_STATS} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="number" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                        formatter={(value: any) => [`${value}% Completion`, 'Class Completion']}
                        labelFormatter={(label: any) => `Module ${label}`}
                      />
                      <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                        {MOCK_MODULE_STATS.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.completionRate > 75 ? '#0f172a' : entry.completionRate > 40 ? '#475569' : '#94a3b8'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Challenge Success & Attempts */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Challenge Performance & Success Rate</h3>
                    <p className="text-xs text-slate-500">Solved counts vs verification attempts</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Challenges 01 - 04
                  </span>
                </div>

                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHALLENGE_STATS} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="number" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="solvedCount" name="Solved" fill="#0f172a" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalAttempts" name="Total Attempts" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Roster Overview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Student Progress Highlights</h3>
                  <p className="text-xs text-slate-500">Top active learners and completion status</p>
                </div>
                <button
                  onClick={() => setActiveTab('students')}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-900 hover:text-slate-700 cursor-pointer"
                >
                  <span>View Full Roster</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-50/50">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Modules Completed</th>
                      <th className="py-3 px-4">XP Points</th>
                      <th className="py-3 px-4">Challenge Progress</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {MOCK_STUDENTS.slice(0, 5).map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                              {student.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800">{student.modulesCompleted} / {student.totalModules}</span>
                            <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-slate-900 h-full rounded-full"
                                style={{ width: `${(student.modulesCompleted / student.totalModules) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {student.xp} XP
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {student.challengesSolved} / {student.totalChallenges} Solved
                        </td>
                        <td className="py-3.5 px-4">
                          {student.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Active
                            </span>
                          )}
                          {student.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Completed
                            </span>
                          )}
                          {student.status === 'idle' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                              Idle
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: STUDENTS PROGRESS TABLE */}
        {/* ========================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>STUDENT ROSTER / CLASS MASTERY</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">
                  Student Progress Roster
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Individual student track performance, completed modules, total XP, and challenge attempts.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span>Showing {filteredStudents.length} of {MOCK_STUDENTS.length} Students</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-mono">Filter Status:</span>
                <div className="flex items-center gap-1">
                  {(['all', 'active', 'completed', 'idle'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded text-xs font-medium capitalize cursor-pointer transition-colors ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-50/70">
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Modules Completed</th>
                      <th className="py-3.5 px-4">XP Points</th>
                      <th className="py-3.5 px-4">Challenge Progress</th>
                      <th className="py-3.5 px-4">Avg Score</th>
                      <th className="py-3.5 px-4">Last Active</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredStudents.map((student) => (
                      <tr 
                        key={student.id} 
                        onClick={() => setSelectedStudent(student)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700">
                              {student.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{student.modulesCompleted} / {student.totalModules}</span>
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-slate-900 h-full rounded-full"
                                style={{ width: `${(student.modulesCompleted / student.totalModules) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {student.xp} XP
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {student.challengesSolved} of {student.totalChallenges} solved
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                          {student.avgScore}%
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {student.lastActive}
                        </td>
                        <td className="py-3.5 px-4">
                          {student.status === 'active' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Active
                            </span>
                          )}
                          {student.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Completed
                            </span>
                          )}
                          {student.status === 'idle' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                              Idle
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected Student Detail Drawer Modal */}
            {selectedStudent && (
              <div className="bg-white rounded-xl border border-slate-900/20 p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      {selectedStudent.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{selectedStudent.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs text-slate-500 hover:text-slate-900 font-mono px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Close Detail
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase">Modules Progress</span>
                    <span className="text-lg font-bold text-slate-900">{selectedStudent.modulesCompleted} / {selectedStudent.totalModules}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase">Earned XP</span>
                    <span className="text-lg font-bold text-slate-900">{selectedStudent.xp} XP</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase">Challenges Solved</span>
                    <span className="text-lg font-bold text-slate-900">{selectedStudent.challengesSolved} / {selectedStudent.totalChallenges}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase">Assessment Average</span>
                    <span className="text-lg font-bold text-slate-900">{selectedStudent.avgScore}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: LEARNING MODULE OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>CURRICULUM MASTERY / MODULE STATS</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">
                  Learning Module Overview
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Track completion rates across Fundamentals, Qubits, Superposition, Gates, Entanglement, Circuits, and Algorithms.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_MODULE_STATS.map((mod) => (
                <div key={mod.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        MODULE {mod.number}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        mod.difficulty === 'Beginner'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : mod.difficulty === 'Intermediate'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {mod.difficulty}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {mod.completedCount} of {mod.enrolled} students completed
                    </p>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-600">Completion Rate</span>
                        <span className="font-bold text-slate-900">{mod.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-900 h-full rounded-full"
                          style={{ width: `${mod.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>Average Quiz Score:</span>
                    <span className="font-bold text-slate-900">{mod.avgQuizScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CHALLENGE PERFORMANCE OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>CIRCUIT BENCHMARKS / CHALLENGE EVALUATIONS</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 m-0">
                  Challenge Performance Overview
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Execution and verification analytics for all quantum circuit challenges.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_CHALLENGE_STATS.map((chal) => (
                <div key={chal.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {chal.number}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{chal.title}</h3>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      +{chal.points} XP
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Solved</span>
                      <span className="text-base font-bold text-slate-900">{chal.solvedCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Total Attempts</span>
                      <span className="text-base font-bold text-slate-900">{chal.totalAttempts}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Success Rate</span>
                      <span className="text-base font-bold text-emerald-700">{chal.successRate}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Cohort Success Rate</span>
                      <span className="font-bold text-slate-900">{chal.successRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${chal.successRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Atom className="w-4 h-4 text-slate-900" />
              <span>QuantumLearn</span>
            </div>
            <span>—</span>
            <span>Instructor Portal v1.2</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            Faculty Role: <span className="text-slate-700 font-medium">{user.role}</span> ({user.email})
          </div>
        </div>
      </footer>
    </div>
  );
};
