import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Chrome, Lock, Sparkles } from 'lucide-react';

import { initiateGoogleLogin } from '../services/auth';

const providerOptions = [
  {
    id: 'google',
    name: 'Google',
    description: 'Continue with your Google account',
    accent: 'bg-[#d97757] text-white',
    icon: Chrome
  },
  {
    id: 'meta',
    name: 'Meta',
    description: 'Coming soon for enterprise SSO',
    accent: 'bg-slate-900 text-white',
    icon: Lock
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Sandbox integration ready',
    accent: 'bg-slate-700 text-white',
    icon: Sparkles
  }
] as const;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const { authorizationUrl } = await initiateGoogleLogin();
      window.location.assign(authorizationUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start Google sign-in.');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] px-6 py-8 text-slate-900 dark:bg-[#0f1720] dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-[0.18em] text-slate-800 dark:text-slate-200">
            MARKETIQ
          </Link>
          <Link to="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            Back to home
          </Link>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex rounded-full border border-[#f0d7ca] bg-[#fff5f1] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#b35c3b]">
              Secure access
            </div>

            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Get started with MarketIQ
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600 dark:text-slate-300">
                Access your campaign cockpit, AI insights, and budget optimization tools with a protected enterprise-ready sign-in.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#101922]">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#fff2ed] p-2 text-[#d97757]">
                  <Lock size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Protected workspace</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">JWT-backed authentication with secure startup validation</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#101922]">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Sign in</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Choose a provider</h2>
            </div>

            <div className="space-y-3">
              {providerOptions.map(({ id, name, description, accent, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    if (id === 'google') {
                      void handleGoogleLogin();
                      return;
                    }
                    setError(`${name} authentication is not enabled yet. Please use Google or continue in demo mode.`);
                  }}
                  disabled={isSubmitting}
                  className={`flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 ${accent}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                      <Icon size={18} />
                    </span>
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs opacity-80">{description}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                <AlertCircle size={16} className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Continue to dashboard demo
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
              {isSubmitting ? 'Redirecting securely to Google...' : 'No ad, analytics, or marketing data is stored during sign-in.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
