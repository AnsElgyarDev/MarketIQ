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
          const match = (campaigns || []).find(
            (c) => (c.name || c.Name) === name,
          );
          if (match) ids.push(match.id || match.Id);
        }
      }
    });
    return ids;
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

    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignIds: ids }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || String(err));
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
          className="px-4 py-2 rounded text-white font-medium transition duration-150 disabled:opacity-50"
          style={{ backgroundColor: "#DA7756" }}
        >
          {running ? "Running Analysis..." : "Run AI Analysis"}
        </button>
      </div>

      {error && <div className="text-[#C65D3B] mb-3">{error}</div>}

      {result ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-serif font-medium text-[#191919]">
              Summary
            </h3>
            <p className="text-[#66635B] mt-2 leading-relaxed">
              {result.summary || result.Summary}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-serif font-medium text-[#191919]">
              What to Scale
            </h3>
            <div className="mt-2 text-[#66635B] space-y-2">
              {(result.whatToScale || result.WhatToScale || []).map(
                (s, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border rounded"
                    style={{ borderColor: "#E6E2DD" }}
                  >
                    {s}
                  </div>
                ),
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-serif font-medium text-[#191919]">
              What to Stop
            </h3>
            <div className="mt-2 text-[#66635B] space-y-2">
              {(result.whatToStop || result.WhatToStop || []).map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white border rounded"
                  style={{ borderColor: "#E6E2DD" }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[#66635B]">
          No results yet. Select campaigns and click "Run AI Analysis".
        </div>
      )}
    </div>
  );
}
