import React, { useState } from "react"
import type { Campaign } from '../data/mockData'

const MIN_SPINNER_MS = 700
const FETCH_TIMEOUT_MS = 2000

type AIInsightResult = {
  summary?: string
  Summary?: string
  whatToScale?: string[]
  WhatToScale?: string[]
  whatToStop?: string[]
  WhatToStop?: string[]
}

type AIInsightsPanelProps = {
  selectedIds?: string[]
  campaigns?: Campaign[]
}

export default function AIInsightsPanel({ selectedIds = [], campaigns = [] }: AIInsightsPanelProps) {
  const [running, setRunning] = useState<boolean>(false)
  const [result, setResult] = useState<AIInsightResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function buildMockInsights(ids: string[]) {
    const picked = (campaigns || []).filter((campaign) => ids.includes(campaign.id))
    const names = picked.map((campaign) => campaign.name || 'Campaign')
    return {
      summary: `Analyzed ${ids.length} campaign(s). Showing quick mock insights based on selected campaigns.`,
      whatToScale: names.slice(0, 2).map((name) => `Increase budget on ${name} — strong conversion signal.`),
      whatToStop: names.slice(2).map((name) => `Pause ${name} — high cost per result relative to others.`)
    }
  }

  async function runAnalysis() {
    setError(null)
    setResult(null)
    const ids = selectedIds || []

    if (!ids.length) {
      setError("Select one or more campaigns to analyze.")
      return
    }

    setRunning(true)
    const start = Date.now()

    try {
      const ctrl = new AbortController()
      const timeout = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)

      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignIds: ids }),
        signal: ctrl.signal
      }).catch(() => null)

      clearTimeout(timeout)

      if (res && res.ok) {
        const data = await res.json() as AIInsightResult
        setResult(data)
      } else {
        setResult(buildMockInsights(ids))
      }
    } catch {
      setResult(buildMockInsights(ids))
    } finally {
      const elapsed = Date.now() - start
      const remaining = MIN_SPINNER_MS - elapsed
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
      setRunning(false)
    }
  }

  function RenderList({ title, items }: { title: string; items?: string[] }) {
    const list = items || []
    return (
      <div className="animate-fade-in-up">
        <h3 className="text-sm font-serif font-medium text-[#191919] dark:text-[#ECE9E3]">{title}</h3>
        <div className="mt-3 space-y-2">
          {list.length ? (
            list.map((item, index) => (
              <div key={`${title}-${index}`} className="rounded-xl border border-[#E6E2DD] bg-[#F8F5F1] p-3 text-[#66635B] transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:border-[#2E2E2A] dark:bg-[#1D1C1A] dark:text-[#9E9A90]">
                {item}
              </div>
            ))
          ) : (
            <div className="rounded-xl border-dashed border-[#E6E2DD] bg-[#F8F5F1] p-3 text-sm text-[#66635B] dark:border-[#2E2E2A] dark:bg-[#1D1C1A] dark:text-[#9E9A90]">
              No recommendations yet.
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={runAnalysis}
          disabled={running}
          aria-pressed={running}
          className={`inline-flex items-center gap-2 transform-gpu rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA7756] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] motion-reduce:transition-none disabled:opacity-60 disabled:cursor-not-allowed btn-bouncy ${running ? "bg-[#C65D3B] animate-pulse" : "bg-[#DA7756]"}`}
        >
          {running && (
            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {running ? "Running Analysis..." : "Run AI Analysis"}
        </button>
      </div>

      {error && (
        <div className="animate-fade-in-up rounded-xl border border-[#F7D7CF] bg-[#FFF7F4] p-3 text-sm text-[#C65D3B] dark:border-[#4A312D] dark:bg-[#2D2421] dark:text-[#E9B09A]" role="alert">
          {error}
        </div>
      )}

      {result ? (
        <div className="space-y-4 animate-fade-in-up" aria-live="polite">
          <div className="rounded-xl border border-[#E6E2DD] bg-[#F8F5F1] p-3 text-[#66635B] dark:border-[#2E2E2A] dark:bg-[#1D1C1A] dark:text-[#9E9A90]">
            <h3 className="text-sm font-serif font-medium text-[#191919] dark:text-[#ECE9E3]">Summary</h3>
            <p className="mt-2">{result.summary || result.Summary}</p>
          </div>

          <RenderList title="What to Scale" items={result.whatToScale || result.WhatToScale || []} />
          <RenderList title="What to Stop" items={result.whatToStop || result.WhatToStop || []} />
        </div>
      ) : (
        <div className="animate-fade-in-up rounded-xl border-dashed border-[#E6E2DD] bg-[#F8F5F1] p-3 text-sm text-[#66635B] dark:border-[#2E2E2A] dark:bg-[#1D1C1A] dark:text-[#9E9A90]">
          No results yet. Select campaigns and click "Run AI Analysis".
        </div>
      )}
    </div>
  )
}
