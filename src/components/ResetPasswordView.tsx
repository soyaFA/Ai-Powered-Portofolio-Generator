import React, { useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, XCircle } from 'lucide-react';
import { apiClient } from '../services/api';

interface ResetPasswordViewProps {
  onGoToSignIn: () => void;
}

type ResetPhase = 'form' | 'submitting' | 'success';

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onGoToSignIn,
}) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phase, setPhase] = useState<ResetPhase>('form');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code.trim())) {
      setError('Please enter the 6-digit verification code from your email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setPhase('submitting');
    try {
      const res = await apiClient.resetPassword(code.trim(), password);
      setSuccessMessage(res.message);
      setPhase('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
      setPhase('form');
    }
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
            <div className="mx-auto flex w-11 h-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <KeyRound className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Reset your password
            </h1>
            <p className="text-sm text-slate-600">
              Enter the 6-digit code we sent to your email and choose a new password.
            </p>
          </div>

          {phase === 'success' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm text-slate-700" role="status">
                {successMessage}
              </p>
              <button
                type="button"
                onClick={onGoToSignIn}
                className="w-full inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                Go to sign in
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-code"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Verification Code{' '}
                    <span className="font-normal text-slate-400">
                      (6 digits from your email)
                    </span>
                  </label>
                  <input
                    id="reset-code"
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="123456"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono tracking-[0.4em] text-center focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reset-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    New Password{' '}
                    <span className="font-normal text-slate-400">
                      (minimum 6 characters)
                    </span>
                  </label>
                  <input
                    id="reset-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reset-password-confirm"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="reset-password-confirm"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800 flex items-start gap-2"
                  >
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={phase === 'submitting'}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {phase === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update password'
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={onGoToSignIn}
                className="w-full text-center text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
