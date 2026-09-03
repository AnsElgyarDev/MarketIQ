export type AuthSession = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  provider: string;
  user: {
    subject: string;
    email: string;
    name: string;
    picture?: string;
  };
};

const SESSION_STORAGE_KEY = 'marketiq.auth.session';

const readEnv = (key: string) => {
  if (typeof window === 'undefined') return undefined;

  const appEnv = (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }).env;

  return appEnv?.[key] || appEnv?.[key.toUpperCase()] || undefined;
};

export const getApiBaseUrl = () => {
  const fromWindow = typeof window !== 'undefined' ? window.location.origin : undefined;
  const configuredBase = readEnv('VITE_API_URL') || readEnv('NEXT_PUBLIC_API_URL');

  if (configuredBase && configuredBase.trim()) {
    return configuredBase.replace(/\/$/, '');
  }

  if (fromWindow) {
    return fromWindow.replace(/\/$/, '');
  }

  return 'http://localhost:5000';
};

export const getStoredSession = (): AuthSession | null => {
  if (typeof window === 'undefined') return null;

  try {
    const rawSession = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) return null;
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    return null;
  }
};

export const persistSession = (session: AuthSession) => {
  if (typeof window === 'undefined') return;

  const serialized = JSON.stringify(session);
  sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
  localStorage.setItem(SESSION_STORAGE_KEY, serialized);
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export async function initiateGoogleLogin() {
  const baseUrl = getApiBaseUrl();
  const redirectUri = `${window.location.origin}/auth/callback`;
  const response = await fetch(`${baseUrl}/api/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Unable to start Google sign-in.');
  }

  const payload = (await response.json()) as {
    authorizationUrl?: string;
    redirectUri?: string;
    state?: string;
  };

  if (!payload.authorizationUrl) {
    throw new Error('Google authorization URL was not returned by the backend.');
  }

  return payload;
}

export async function completeGoogleCallback(code: string, state?: string, redirectUri?: string) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/google/callback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      code,
      state: state || '',
      redirectUri: redirectUri || `${window.location.origin}/auth/callback`
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Google login failed.');
  }

  const payload = (await response.json()) as AuthSession & {
    accessToken: string;
    tokenType: string;
    expiresAt: string;
  };

  if (!payload.accessToken) {
    throw new Error('Google authentication completed without a JWT token.');
  }

  const session: AuthSession = {
    accessToken: payload.accessToken,
    tokenType: payload.tokenType || 'Bearer',
    expiresAt: payload.expiresAt,
    provider: payload.provider || 'Google',
    user: payload.user || {
      subject: 'unknown',
      email: '',
      name: 'Authenticated User'
    }
  };

  persistSession(session);
  return session;
}
