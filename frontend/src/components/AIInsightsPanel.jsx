import React, { useState } from "react";

export default function AIInsightsPanel({ selectedIds = [], campaigns = [] }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function gatherSelected() {
    if (selectedIds && selectedIds.length > 0) {
      return selectedIds;
    }

    const rows = Array.from(document.querySelectorAll("table tbody tr"));
    const ids = [];

    rows.forEach((row) => {
      const checkbox = row.querySelector("input[type=checkbox]");
      if (checkbox && checkbox.checked) {
        const nameCell = row.cells[1];
        if (nameCell) {
          const name = nameCell.textContent.trim();
          const match = (campaigns || []).find((c) => (c.name || c.Name) === name);
          if (match) ids.push(match.id || match.Id);
        }
      }
    });

    return ids;
  }

  function buildMockInsights(ids, selectedCampaigns) {
    const chosen = (selectedCampaigns || []).filter((c) =>
      ids.includes(c.id || c.Id),
    );

    const ordered = [...chosen].sort(
      (a, b) =>
        Number(a.costPerResult || a.CostPerResult) -
        Number(b.costPerResult || b.CostPerResult),
    );

    const whatToScale = ordered.slice(0, 3).map((c) => {
      const name = c.name || c.Name;
      const platform = c.platform || c.Platform;
      const costPerResult = c.costPerResult || c.CostPerResult;
      return `${name} (${platform}) is performing efficiently at $${Number(costPerResult).toFixed(2)} per result — increase budget gradually.`;
    });

    const whatToStop = [...chosen]
      .sort(
        (a, b) =>
          Number(b.costPerResult || b.CostPerResult) -
          Number(a.costPerResult || a.CostPerResult),
      )
      .slice(0, 3)
      .map((c) => {
        const name = c.name || c.Name;
        const platform = c.platform || c.Platform;
        const costPerResult = c.costPerResult || c.CostPerResult;
        return `${name} (${platform}) is over budget at $${Number(costPerResult).toFixed(2)} per result — reallocate or pause spend.`;
      });

    return {
      summary: `Completed a quick AI review for ${chosen.length} selected campaign(s). Prioritize spend on the most efficient channels and reduce exposure on expensive low-converting segments.`,
      whatToScale,
      whatToStop,
    };
  }

  async function runAnalysis() {
    setError(null);
    setResult(null);

    const ids = gatherSelected();

    if (!ids.length) {
      setError("Select one or more campaigns to analyze.");
      return;
    }

    setRunning(true);
    const MIN_SPINNER_MS = 700;
    const startedAt = Date.now();

    const selectedCampaigns = (campaigns || []).filter((c) =>
      ids.includes(c.id || c.Id),
    );
    const fallback = buildMockInsights(ids, selectedCampaigns);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignIds: ids }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let data;
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Analysis failed");
      } else {
        data = await res.json();
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SPINNER_MS) {
        await new Promise((r) => setTimeout(r, MIN_SPINNER_MS - elapsed));
      }

      setResult(data);
    } catch (err) {
      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_SPINNER_MS) {
        await new Promise((r) => setTimeout(r, MIN_SPINNER_MS - elapsed));
      }
      setError(
        "The live AI endpoint is unavailable right now, so a mock optimization summary is being shown instead.",
      );
      setResult(fallback);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={runAnalysis}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-[#DA7756] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#C96A4A] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#DA7756] focus:ring-offset-2 focus:ring-offset-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {running ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="2"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="animate-pulse">Running Analysis...</span>
            </>
          ) : (
            "Run AI Analysis"
          )}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-[#F7D7CF] bg-[#FFF7F4] p-3 text-sm text-[#C65D3B] transition-all duration-300">
          {error}
        </div>
      )}

      {result ? (
        <div className="space-y-6 transition-all duration-300 animate-fade-in-up">
          <div className="rounded-xl border border-[#E6E2DD] bg-[#F8F5F1] p-3">
            <h3 className="text-sm font-serif font-medium text-[#191919]">
              Summary
            </h3>
            <p className="mt-2 leading-relaxed text-[#66635B]">
              {result.summary || result.Summary}
            </p>
          </div>

          <div className="rounded-xl border border-[#E6E2DD] bg-white p-3 transition-all duration-300 animate-fade-in-up">
            <h3 className="text-sm font-serif font-medium text-[#191919]">
              What to Scale
            </h3>
            <div className="mt-2 space-y-2 text-[#66635B]">
              {(result.whatToScale || result.WhatToScale || []).map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E6E2DD] bg-[#F8F5F1] p-3 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E6E2DD] bg-white p-3 transition-all duration-300 animate-fade-in-up">
            <h3 className="text-sm font-serif font-medium text-[#191919]">
              What to Stop
            </h3>
            <div className="mt-2 space-y-2 text-[#66635B]">
              {(result.whatToStop || result.WhatToStop || []).map((s, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#E6E2DD] bg-[#F8F5F1] p-3 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#E6E2DD] bg-[#F8F5F1] p-3 text-sm text-[#66635B] transition-all duration-300 animate-fade-in-up">
          No results yet. Select campaigns and click "Run AI Analysis".
        </div>
      )}
    </div>
  );
}
