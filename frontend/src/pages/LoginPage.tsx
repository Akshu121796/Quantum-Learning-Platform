import React, { useState } from 'react';
import type { User, UserRole } from '../types/auth';
import { 
  Atom, 
  Mail, 
  Lock, 
  GraduationCap, 
  UserCheck, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic empty-field validation
    if (!email.trim() && !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address (e.g. alex@quantumlearn.edu).');
      return;
    }

    // Generate a display name from email if needed
    const emailName = email.split('@')[0];
    const formattedName = emailName
      ? emailName.charAt(0).toUpperCase() + emailName.slice(1).replace(/[._]/g, ' ')
      : role === 'instructor' ? 'Dr. Sarah Lin' : 'Alex Vance';

    const user: User = {
      email: email.trim(),
      role,
      name: formattedName,
    };

    onLoginSuccess(user);
  };

  const handleFillDemo = (targetRole: UserRole) => {
    setError(null);
    setRole(targetRole);
    if (targetRole === 'student') {
      setEmail('alex.vance@quantumlearn.edu');
      setPassword('quantum2026!');
    } else {
      setEmail('prof.sarah.lin@quantumlearn.edu');
      setPassword('instructor2026!');
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-slate-200">
      {/* Top Branding Bar */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white shadow-sm mb-4">
          <Atom className="w-7 h-7 animate-pulse text-cyan-400" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            QuantumLearn
          </h2>
          <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
            v1.2
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600 max-w-xs mx-auto">
          Interactive Quantum Computing & Circuit Simulation Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs border border-slate-200 rounded-xl">
          {/* Header title inside box */}
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select your role and enter credentials to continue</p>
          </div>

          {/* Validation Error Alert */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection Segmented Control */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Select Portal Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="role-student-btn"
                  onClick={() => setRole('student')}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    role === 'student'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <GraduationCap className={`w-4 h-4 ${role === 'student' ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {role === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </div>
                  <span className="font-semibold text-sm">Student</span>
                  <span className={`text-[11px] mt-0.5 leading-tight ${role === 'student' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Lab & Coursework
                  </span>
                </button>

                <button
                  type="button"
                  id="role-instructor-btn"
                  onClick={() => setRole('instructor')}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    role === 'instructor'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <UserCheck className={`w-4 h-4 ${role === 'instructor' ? 'text-purple-400' : 'text-slate-500'}`} />
                    {role === 'instructor' && <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
                  </div>
                  <span className="font-semibold text-sm">Instructor</span>
                  <span className={`text-[11px] mt-0.5 leading-tight ${role === 'instructor' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Faculty Portal
                  </span>
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'student' ? 'alex.vance@quantumlearn.edu' : 'prof.lin@quantumlearn.edu'}
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="login-submit-btn"
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-xs cursor-pointer transition-colors"
            >
              <span>Sign In as {role === 'student' ? 'Student' : 'Instructor'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill Links */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Quick Demo Accounts:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('student')}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 transition-colors cursor-pointer text-[11px]"
              >
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('instructor')}
                className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium border border-purple-200 transition-colors cursor-pointer text-[11px]"
              >
                Demo Instructor
              </button>
            </div>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted Session</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Aer Qiskit Simulator Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
