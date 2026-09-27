export interface StudentProgressItem {
  id: string;
  name: string;
  email: string;
  avatar: string;
  modulesCompleted: number;
  totalModules: number;
  xp: number;
  challengesSolved: number;
  totalChallenges: number;
  lastActive: string;
  status: 'active' | 'completed' | 'idle';
  avgScore: number;
}

export interface ModuleStat {
  id: string;
  number: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  enrolled: number;
  completedCount: number;
  completionRate: number; // percentage
  avgQuizScore: number;
}

export interface ChallengeStat {
  id: string;
  number: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
  solvedCount: number;
  totalAttempts: number;
  successRate: number; // percentage
}

export const MOCK_STUDENTS: StudentProgressItem[] = [
  {
    id: 'std-1',
    name: 'Alex Vance',
    email: 'alex.vance@quantumlearn.edu',
    avatar: 'AV',
    modulesCompleted: 5,
    totalModules: 7,
    xp: 1850,
    challengesSolved: 3,
    totalChallenges: 4,
    lastActive: 'Just now',
    status: 'active',
    avgScore: 94,
  },
  {
    id: 'std-2',
    name: 'Maya Lin',
    email: 'maya.lin@quantumlearn.edu',
    avatar: 'ML',
    modulesCompleted: 7,
    totalModules: 7,
    xp: 2400,
    challengesSolved: 4,
    totalChallenges: 4,
    lastActive: '15m ago',
    status: 'completed',
    avgScore: 98,
  },
  {
    id: 'std-3',
    name: 'Jordan Reed',
    email: 'jordan.reed@quantumlearn.edu',
    avatar: 'JR',
    modulesCompleted: 4,
    totalModules: 7,
    xp: 1320,
    challengesSolved: 2,
    totalChallenges: 4,
    lastActive: '1h ago',
    status: 'active',
    avgScore: 88,
  },
  {
    id: 'std-4',
    name: 'Chen Wei',
    email: 'chen.wei@quantumlearn.edu',
    avatar: 'CW',
    modulesCompleted: 6,
    totalModules: 7,
    xp: 2100,
    challengesSolved: 3,
    totalChallenges: 4,
    lastActive: '2h ago',
    status: 'active',
    avgScore: 91,
  },
  {
    id: 'std-5',
    name: 'Sam Taylor',
    email: 'sam.taylor@quantumlearn.edu',
    avatar: 'ST',
    modulesCompleted: 3,
    totalModules: 7,
    xp: 950,
    challengesSolved: 1,
    totalChallenges: 4,
    lastActive: 'Yesterday',
    status: 'idle',
    avgScore: 82,
  },
  {
    id: 'std-6',
    name: 'Elena Rostova',
    email: 'elena.r@quantumlearn.edu',
    avatar: 'ER',
    modulesCompleted: 5,
    totalModules: 7,
    xp: 1680,
    challengesSolved: 3,
    totalChallenges: 4,
    lastActive: '3h ago',
    status: 'active',
    avgScore: 95,
  },
  {
    id: 'std-7',
    name: 'Marcus Brody',
    email: 'm.brody@quantumlearn.edu',
    avatar: 'MB',
    modulesCompleted: 2,
    totalModules: 7,
    xp: 620,
    challengesSolved: 1,
    totalChallenges: 4,
    lastActive: '3 days ago',
    status: 'idle',
    avgScore: 78,
  },
  {
    id: 'std-8',
    name: 'Sophia Patel',
    email: 'sophia.p@quantumlearn.edu',
    avatar: 'SP',
    modulesCompleted: 7,
    totalModules: 7,
    xp: 2550,
    challengesSolved: 4,
    totalChallenges: 4,
    lastActive: '4h ago',
    status: 'completed',
    avgScore: 99,
  },
];

export const MOCK_MODULE_STATS: ModuleStat[] = [
  { id: 'mod-01', number: '01', title: 'Fundamentals', difficulty: 'Beginner', enrolled: 28, completedCount: 28, completionRate: 100, avgQuizScore: 96 },
  { id: 'mod-02', number: '02', title: 'Qubits & States', difficulty: 'Beginner', enrolled: 28, completedCount: 26, completionRate: 93, avgQuizScore: 92 },
  { id: 'mod-03', number: '03', title: 'Superposition', difficulty: 'Beginner', enrolled: 28, completedCount: 22, completionRate: 79, avgQuizScore: 89 },
  { id: 'mod-04', number: '04', title: 'Quantum Gates', difficulty: 'Intermediate', enrolled: 28, completedCount: 18, completionRate: 64, avgQuizScore: 85 },
  { id: 'mod-05', number: '05', title: 'Entanglement', difficulty: 'Intermediate', enrolled: 28, completedCount: 14, completionRate: 50, avgQuizScore: 88 },
  { id: 'mod-06', number: '06', title: 'Quantum Circuits', difficulty: 'Intermediate', enrolled: 28, completedCount: 9, completionRate: 32, avgQuizScore: 81 },
  { id: 'mod-07', number: '07', title: 'Quantum Algorithms', difficulty: 'Advanced', enrolled: 28, completedCount: 5, completionRate: 18, avgQuizScore: 84 },
];

export const MOCK_CHALLENGE_STATS: ChallengeStat[] = [
  { id: 'chal-01', number: '01', title: 'Create a Superposition State', difficulty: 'Beginner', points: 100, solvedCount: 26, totalAttempts: 31, successRate: 92 },
  { id: 'chal-02', number: '02', title: 'Construct the Bell State Φ⁺', difficulty: 'Intermediate', points: 150, solvedCount: 21, totalAttempts: 29, successRate: 75 },
  { id: 'chal-03', number: '03', title: 'Deterministic Bit Inversion', difficulty: 'Beginner', points: 80, solvedCount: 25, totalAttempts: 27, successRate: 89 },
  { id: 'chal-04', number: '04', title: 'The 3-Qubit GHZ Entanglement', difficulty: 'Advanced', points: 250, solvedCount: 12, totalAttempts: 28, successRate: 43 },
];

export const MOCK_CLASS_OVERVIEW = {
  totalStudents: 28,
  activeLearners: 22,
  averageProgress: 63,
  challengesCompleted: 84,
  avgXp: 1560,
};
