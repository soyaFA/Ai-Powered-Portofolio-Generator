import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import type { AuthUser } from '../types/portfolio';

interface AuthGateViewProps {
  onSuccess: (user: AuthUser) => void;
}

export const AuthGateView: React.FC<AuthGateViewProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);
  const [forgotDevHint, setForgotDevHint] = useState<string | null>(null);
  const [codeRequested, setCodeRequested] = useState(false);

  const switchMode = (next: 'login' | 'register' | 'forgot') => {
    setMode(next);
    setError(null);
    setForgotNotice(null);
    setForgotDevHint(null);
    setCodeRequested(false);
  };

  useEffect(() => {
    if (mode !== 'forgot') return;
    let cancelled = false;
    void apiClient.isResetEmailConfigured().then((configured) => {
      if (!cancelled && !configured) {
        setForgotDevHint(
          'Development mode: SMTP is not configured, so the verification code will be printed in the server console instead of emailed.'
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await apiClient.register({
          name,
          email,
          password,
          githubUsername: githubUsername.trim() || undefined,
        });
        onSuccess(res.user);
      } else if (mode === 'login') {
        const res = await apiClient.login({ email, password });
        onSuccess(res.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await apiClient.requestPasswordReset(email);
      setForgotNotice(res.message);
      setCodeRequested(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToResetPassword = () => {
    navigate('/reset-password');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4">
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            Repo2Folio
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Turn your GitHub repos into a developer portfolio
            </h1>
            <p className="text-sm text-slate-600">
              {mode === 'login'
                ? 'Sign in to continue to your workspace.'
                : mode === 'register'
                  ? 'Create an account to get started.'
                  : "Enter your email and we'll send you a 6-digit verification code."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`rounded-md py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {mode === 'forgot' ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="gate-forgot-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="gate-forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {forgotDevHint && (
                  <div
                    role="note"
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
                  >
                    {forgotDevHint}
                  </div>
                )}

                {forgotNotice && (
                  <div
                    role="status"
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
                  >
                    {forgotNotice}
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending verification code...
                    </>
                  ) : (
                    <>
                      Send verification code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {codeRequested && (
                  <button
                    type="button"
                    onClick={goToResetPassword}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    I have my code — enter it
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Back to sign in
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label
                      htmlFor="gate-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Full Name
                    </label>
                    <input
                      id="gate-name"
                      type="text"
                      required
                      minLength={2}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="gate-email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="gate-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gate-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Password <span className="font-normal text-slate-400">(minimum 6 characters)</span>
                  </label>
                  <input
                    id="gate-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {mode === 'login' && (
                  <div className="flex justify-end -mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label
                      htmlFor="gate-github"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      GitHub Username{' '}
                      <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      id="gate-github"
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-mono-tabular text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
