import React, { useEffect, useState } from 'react'
import StatCard from './components/StatCard'
import CampaignTable from './components/CampaignTable'
import AIInsightsPanel from './components/AIInsightsPanel'

export default function App() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">MarketIQ Dashboard</h1>
        <p className="text-sm text-gray-400">AI-powered ad campaign optimizer</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Spend" value="$12,450" />
        <StatCard title="Avg ROAS" value="3.8x" />
        <StatCard title="Wasted Budget" value="$1,200" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
          {loading && <div className="text-gray-300">Loading campaigns...</div>}
          {error && <div className="text-red-400">Error: {error}</div>}
          {!loading && !error && (
            <CampaignTable campaigns={campaigns} />
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4 shadow">
          <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
          <AIInsightsPanel campaigns={campaigns} />
        </div>
      </div>

      <footer className="mt-8 text-sm text-gray-500">MarketIQ — demo UI</footer>
    </div>
  )
}
