import React, { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import StatCard from "./components/StatCard"
import CampaignTable from "./components/CampaignTable"
import AIInsightsPanel from "./components/AIInsightsPanel"
import ThemeToggle from "./components/ThemeToggle"
import LandingPage from './pages/LandingPage'
import { mockCampaigns, type Campaign } from './data/mockData'

const THEME_KEY = "marketiq-theme"
type ThemeMode = "light" | "dark"

type DashboardProps = {
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}

function Dashboard({ theme, setTheme }: DashboardProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns || [])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    setCampaigns(mockCampaigns || [])
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#171715] text-[#191919] dark:text-[#ECE9E3] transition-colors duration-200 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <div
              role="img"
              aria-label="MarketIQ logo"
              tabIndex={0}
              className="inline-flex items-center gap-2 transform-gpu rounded-full border border-[#E6E2DD] bg-white/80 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[#66635B] shadow-sm transition-all duration-300 ease-out hover:scale-[1.05] hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA7756] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] cursor-pointer animate-fade-in-up logo-bouncy dark:border-[#2E2E2A] dark:bg-[#21211F]/80 dark:text-[#9E9A90] dark:focus-visible:ring-offset-[#171715]"
            >
              MarketIQ
            </div>
            <h1 className="mt-4 text-3xl font-serif font-semibold tracking-tight text-[#191919] transition-all duration-300 ease-out transform-gpu hover:translate-y-[-2px] dark:text-[#ECE9E3]">
              AI-powered ad campaign optimizer
            </h1>
            <p className="mt-2 text-sm text-[#66635B] dark:text-[#9E9A90]">
              Monitor performance signals, compare strategy, and unlock the next best move.
            </p>
          </div>

          <div className="flex items-start">
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard title="Total Spend" value="$12,450" />
          <StatCard title="Avg ROAS" value="3.8x" />
          <StatCard title="Wasted Budget" value="$1,200" />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#E6E2DD] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg dark:border-[#2E2E2A] dark:bg-[#21211F] lg:col-span-2">
            <h2 className="mb-4 text-xl font-serif font-medium text-[#191919] dark:text-[#ECE9E3]">Active Campaigns</h2>

            {loading && (
              <div className="animate-fade-in-up rounded-xl border border-[#E6E2DD] bg-[#F8F5F1] p-4 text-sm text-[#66635B] dark:border-[#2E2E2A] dark:bg-[#262521] dark:text-[#9E9A90]">
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#DA7756]/30 border-t-[#DA7756]" />
                  Loading campaigns...
                </span>
              </div>
            )}

            {error && (
              <div className="animate-fade-in-up rounded-xl border border-[#F7D7CF] bg-[#FFF7F4] p-4 text-sm text-[#C65D3B] dark:border-[#4A312D] dark:bg-[#2D2421] dark:text-[#E9B09A]">
                Error: {error}
              </div>
            )}

            {!loading && !error && (
              <CampaignTable campaigns={campaigns} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
            )}
          </div>

          <div className="rounded-2xl border border-[#E6E2DD] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg dark:border-[#2E2E2A] dark:bg-[#21211F]">
            <h2 className="mb-4 text-xl font-serif font-medium text-[#191919] dark:text-[#ECE9E3]">AI Insights</h2>
            <AIInsightsPanel selectedIds={selectedIds} campaigns={campaigns} />
          </div>
        </div>

        <footer className="mt-8 text-sm text-[#66635B] dark:text-[#9E9A90]">MarketIQ — demo UI</footer>
      </div>
    </div>
  )
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light"
    try {
      const saved = localStorage.getItem(THEME_KEY)
      if (saved === "light" || saved === "dark") return saved as ThemeMode
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    } catch {
      return "light"
    }
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // ignore storage failures in private mode or restricted browsers
    }
  }, [theme])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard theme={theme} setTheme={setTheme} />} />
      </Routes>
    </Router>
  )
}

