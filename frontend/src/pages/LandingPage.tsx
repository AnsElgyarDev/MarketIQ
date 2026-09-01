import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, BarChart, Zap, Globe } from 'lucide-react'

import logoSrc from '../assets/logo.png'

const accent = '#d97757'

const HeroBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45 }}
    className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-600 shadow-sm"
  >
    AI-POWERED AD CAMPAIGN OPTIMIZATION
  </motion.div>
)

// Navigation to dedicated login page
import { useNavigate } from 'react-router-dom'

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center">
    <div className="text-2xl font-semibold text-[#111827] dark:text-[#f3efe9]">{value}</div>
    <div className="text-xs text-slate-600 dark:text-slate-400">{label}</div>
  </div>
)

export default function LandingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#0f1720] text-[#111827] dark:text-[#ECE9E3] transition-colors duration-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-[#0b1013]/60 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoSrc} alt="MarketIQ" className="h-9 w-9 rounded-sm object-contain" />
            <span className="font-semibold tracking-wide">MARKETIQ</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-700 dark:text-slate-300">
            <a href="#features" className="hover:underline">Features</a>
            <a href="#signals" className="hover:underline">Signals</a>
            <a href="#integrations" className="hover:underline">Integrations</a>
            <a href="#pricing" className="hover:underline">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700">Sign In</Link>
            <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-[#d97757] px-4 py-2 text-sm font-medium text-white hover:opacity-95 shadow-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
          <div>
            <HeroBadge />

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-6 text-3xl md:text-4xl lg:text-5xl font-serif font-semibold tracking-tight leading-tight text-[#0b1220] dark:text-[#f7efea]"
            >
              Cut Wasted Spend. Maximize ROAS with Lethal AI Precision.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 max-w-xl text-slate-700 dark:text-slate-300"
            >
              Monitor performance signals in real time, automate ad strategies across Meta, Google &amp; TikTok, and stop budget leaks.
            </motion.p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-md bg-[#d97757] px-5 py-3 text-sm font-semibold text-white shadow hover:translate-y-[-2px] transition-transform">Get Started</Link>

              <Link to="/login" className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Sign In</Link>
            </div>

            {/* Metrics & Social Proof */}
            <motion.div
              id="signals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
            >
              <div className="flex items-center gap-6">
                <Metric label="$12M+ Spend Analyzed" value="$12M+" />
                <Metric label="3.8x Avg ROAS Boost" value="3.8x" />
                <Metric label="99.4% Signal Accuracy" value="99.4%" />
              </div>
            </motion.div>

          </div>

          {/* Mockup / Preview */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-[#0b1113]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#fff2ed] p-2 text-[#E06D53]">
                  <Zap size={20} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Live Stats</div>
                  <div className="text-sm font-medium">Campaign Overview</div>
                </div>
              </div>
              <div className="text-sm text-slate-500">Real-time</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-[#FAF8F6] p-3 text-center">
                <div className="text-xs text-slate-500">Spend</div>
                <div className="mt-1 text-lg font-semibold">$12,450</div>
              </div>
              <div className="rounded-lg bg-[#FAF8F6] p-3 text-center">
                <div className="text-xs text-slate-500">ROAS</div>
                <div className="mt-1 text-lg font-semibold">3.8x</div>
              </div>
              <div className="rounded-lg bg-[#FAF8F6] p-3 text-center">
                <div className="text-xs text-slate-500">Saved</div>
                <div className="mt-1 text-lg font-semibold">$1,200</div>
              </div>
            </div>

            <div className="mt-4 h-36 rounded-md border border-slate-100 bg-gradient-to-br from-[#fffdfb] to-[#fff6f0]" aria-hidden>
              {/* Placeholder for interactive chart / mockup */}
            </div>

          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="mt-16">
          <div id="integrations" className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div whileHover={{ y: -6 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#071018]">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#fff4e9] p-2 text-[#E06D53]"><BarChart size={20} /></div>
                <div>
                  <div className="text-base font-semibold">Real-Time Signal Detection</div>
                  <div className="text-sm text-slate-600">Detect performance shifts as they happen and act instantly.</div>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#071018]">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#fff4e9] p-2 text-[#E06D53]"><Globe size={20} /></div>
                <div>
                  <div className="text-base font-semibold">Multi-Platform Budget Reallocation</div>
                  <div className="text-sm text-slate-600">Automatically reallocate budget across Meta, Google & TikTok.</div>
                </div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#071018]">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-[#fff4e9] p-2 text-[#E06D53]"><CheckCircle size={20} /></div>
                <div>
                  <div className="text-base font-semibold">Computational ROAS Insights</div>
                  <div className="text-sm text-slate-600">Get model-driven ROAS forecasts and explanations for every recommendation.</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Banner */}
        <section id="pricing" className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between gap-6 dark:border-slate-800 dark:bg-[#071017]">
          <div>
            <div className="text-lg font-semibold">Try the live dashboard and see instant ROAS wins.</div>
            <div className="text-sm text-slate-600">No credit card required — get a 14-day free trial.</div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="rounded-md bg-[#d97757] px-4 py-2 text-sm font-medium text-white">Try Dashboard</Link>
            <a href="#pricing" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">See Pricing</a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-100 pt-8 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="MarketIQ" className="h-8 w-8 rounded-sm object-contain" />
              <div className="text-sm">MarketIQ</div>
            </div>

            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-6 text-slate-600">
              <a href="#" className="text-sm hover:underline">Product</a>
              <a href="#" className="text-sm hover:underline">Integrations</a>
              <a href="#" className="text-sm hover:underline">Status</a>
              <div className="text-sm">All Systems Operational</div>
            </div>

            <div className="text-sm text-slate-500">© {new Date().getFullYear()} MarketIQ</div>
          </div>
        </footer>
      </main>
    </div>
  )
}
