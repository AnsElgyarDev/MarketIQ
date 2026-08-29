import React, { useEffect, useState } from 'react'
import StatCard from './components/StatCard'
import CampaignTable from './components/CampaignTable'
import AIInsightsPanel from './components/AIInsightsPanel'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Lifted selection state so AI panel can consume selected IDs directly
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('http://localhost:5000/api/campaigns')
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        setCampaigns(data)
      } catch (err) {
        setError(err.message || String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-[#FAF8F5] text-[#191919]">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">MarketIQ</h1>
          <p className="text-sm mt-1 text-[#66635B]">AI-powered ad campaign optimizer</p>
        </div>

        <ThemeToggle theme={localStorage.getItem('marketiq-theme') === 'dark' ? 'dark' : 'light'} setTheme={(t) => { document.documentElement.classList.toggle('dark', t === 'dark'); try{ localStorage.setItem('marketiq-theme', t)}catch{} }} />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Spend" value="$12,450" />
        <StatCard title="Avg ROAS" value="3.8x" />
        <StatCard title="Wasted Budget" value="$1,200" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-xl font-serif font-medium mb-4 text-[#191919]">Active Campaigns</h2>
          {loading && <div className="text-[#66635B]">Loading campaigns...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          {!loading && !error && (
            <CampaignTable campaigns={campaigns} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-serif font-medium mb-4 text-[#191919]">AI Insights</h2>
          <AIInsightsPanel selectedIds={selectedIds} campaigns={campaigns} />
        </div>
      </div>

      <footer className="mt-8 text-sm text-[#66635B]">MarketIQ — demo UI</footer>
    </div>
  )
}
