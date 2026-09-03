import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { completeGoogleCallback, getStoredSession } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finalizing your secure sign-in...');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      const storedSession = getStoredSession();
      if (storedSession) {
        // ensure context is in sync with persisted session
        auth.login(storedSession);
        setStatus('success');
        setMessage('You are already signed in. Redirecting...');
        navigate('/dashboard', { replace: true });
        return;
      }

      setStatus('error');
      setMessage('No authorization code was returned by the identity provider.');
      return;
    }

    const doExchange = async () => {
      try {
        const session = await completeGoogleCallback(code, state || undefined, `${window.location.origin}/auth/callback`);
        // update auth context (this will persist and update UI globally)
        auth.login(session);

        setStatus('success');
        setMessage(`Welcome back, ${session.user.name || session.user.email || 'there'}! Redirecting...`);

        window.setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 900);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Google authentication failed.');
      }
    };

    void doExchange();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FBF9F5] px-6 dark:bg-[#0f1720]">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-700 dark:bg-[#101922]">
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-[5px] border-[#f3d1c6] border-t-[#d97757]" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
              <CheckCircle2 size={28} />
            </div>
            <p className="text-lg font-medium text-emerald-700 dark:text-emerald-200">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200">
              <AlertCircle size={28} />
            </div>
            <p className="text-lg font-medium text-red-700 dark:text-red-200">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="mt-2 rounded-full bg-[#d97757] px-4 py-2 text-sm font-medium text-white"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
