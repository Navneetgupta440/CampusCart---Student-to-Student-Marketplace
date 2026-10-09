import React, { useState } from 'react';
import { X, Lock, Mail, User, School, BookOpen, CheckCircle2 } from 'lucide-react';
import { api, setStoredToken } from '../api.js';

export const AuthModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setStoredToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        displayName,
        email,
        password,
        confirmPassword,
        college,
        department,
        course,
        yearOfStudy,
      });
      setStoredToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.resetPassword(email);
      setResetSuccessMsg(res.message);
    } catch (err) {
      setError(err.message || 'Password reset request failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo login helper
  const handleQuickDemo = async (demoEmail, demoPass) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      setStoredToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === 'login' && 'Sign in to CampusCart'}
              {mode === 'register' && 'Create Student Account'}
              {mode === 'forgot' && 'Reset Account Password'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'login' && 'Access student marketplace listings, saved items & enquiries'}
              {mode === 'register' && 'Connect with peer buyers and sellers in your college'}
              {mode === 'forgot' && 'Enter your campus email to receive a password reset link'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Login Picker Banner */}
        {mode === 'login' && (
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Quick Demo Accounts (One-Click)
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('aravind.cse@campuscart.edu', 'Student@123')}
                className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-[#3068E0] hover:bg-blue-50/50 transition-all text-xs"
              >
                <div className="font-semibold text-slate-900 truncate">Aravind (CSE)</div>
                <div className="text-[10px] text-slate-500">Student Seller</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('priya.ece@campuscart.edu', 'Student@123')}
                className="text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-[#3068E0] hover:bg-blue-50/50 transition-all text-xs"
              >
                <div className="font-semibold text-slate-900 truncate">Priya (ECE)</div>
                <div className="text-[10px] text-slate-500">Active Buyer</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@campuscart.edu', 'Admin@123')}
                className="text-left p-2 rounded-lg bg-white border border-amber-300 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-xs"
              >
                <div className="font-semibold text-amber-900 truncate">Campus Admin</div>
                <div className="text-[10px] text-amber-600">Moderator</div>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {resetSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{resetSuccessMsg}</div>
            </div>
          )}

          {/* Form: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu or demo email"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-xs text-[#3068E0] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#12213A] hover:bg-[#1a3156] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                New to CampusCart?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-[#3068E0] font-semibold hover:underline"
                >
                  Create student account
                </button>
              </div>
            </form>
          )}

          {/* Form: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Rahul Sundaram"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College or University *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. National Institute of Technology, Trichy"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department / Branch
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Year of Study
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0] bg-white"
                  >
                    <option value="1st Year">1st Year (Fresher)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior / Final)</option>
                    <option value="Postgraduate">Postgraduate / Research</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@campus.edu or student@college.ac.in"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use your official campus email for instant verified badge status.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#3068E0] hover:bg-[#2555b8] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 mt-2"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-[#3068E0] font-semibold hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* Form: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3068E0]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#12213A] hover:bg-[#1a3156] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Dispatching Instructions...' : 'Send Password Reset'}
              </button>

              <div className="text-center text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setResetSuccessMsg(null);
                  }}
                  className="text-[#3068E0] hover:underline"
                >
                  &larr; Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
