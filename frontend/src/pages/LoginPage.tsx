import React from 'react'
import { Link } from 'react-router-dom'

const backendBase = 'http://localhost:5000'

export default function LoginPage(): JSX.Element {
  const redirect = (provider: string) => {
    window.location.href = `${backendBase}/api/auth/login/${provider}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-[#0f1720]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-[#071018]">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold">Sign in to MarketIQ</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Choose a provider to continue</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => redirect('google')}
            className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Continue with Google
          </button>

          <button
            onClick={() => redirect('tiktok')}
            className="w-full inline-flex items-center justify-center gap-3 rounded-md bg-[#000] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Continue with TikTok
          </button>

          <button
            onClick={() => redirect('dev')}
            className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-amber-400 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
          >
            Developer / Test Login
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-slate-600 hover:underline">Back to home</Link>
        </div>
      </div>
    </div>
  )
}
