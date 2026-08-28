import React, { useState, useEffect } from 'react'

export default function AIInsightsPanel({ campaigns }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // Listen for selection changes from the table by polling DOM checkboxes (simple approach)
  // This keeps components decoupled for this demo. If desired, lift selection state to App.
  useEffect(() => {
    function readSelections() {
      const inputs = document.querySelectorAll('input[type=checkbox]')
      const ids = []
      inputs.forEach(inp => {
        try {
          if (inp.checked && inp.closest('tr') && inp.closest('tr').key) {
          }
        } catch {}
      })
    }
    // no-op; selection is gathered at click time below
  }, [campaigns])

  function gatherSelected() {
    const rows = Array.from(document.querySelectorAll('table tbody tr'))
    const ids = []
    rows.forEach(row => {
      const checkbox = row.querySelector('input[type=checkbox]')
      if (checkbox && checkbox.checked) {
        // assume first cell's checkbox corresponds to dataset; read key from react-generated key isn't accessible.
        // Instead, get the campaign name cell and map back to id by matching name. This is sufficient for demo.
        const nameCell = row.cells[1]
        if (nameCell) {
          const name = nameCell.textContent.trim()
          const match = (campaigns || []).find(c => (c.name || c.Name) === name)
          if (match) ids.push(match.id || match.Id)
        }
      }
    })
    return ids
  }

  async function runAnalysis() {
    setError(null)
    setResult(null)
    const ids = gatherSelected()
    if (!ids.length) {
      setError('Select one or more campaigns in the table to analyze.')
      return
    }
    setRunning(true)
    try {
      const res = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds: ids })
      })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || 'Analysis failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <div className="mb-3">
        <button onClick={runAnalysis} disabled={running} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">
          {running ? 'Running Analysis...' : 'Run AI Analysis'}
        </button>
      </div>

      {error && <div className="text-red-400 mb-3">{error}</div>}

      {result ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Summary</h3>
            <p className="text-gray-300">{result.summary || result.Summary}</p>
          </div>
n          <div>
            <h3 className="text-sm font-semibold">What to Scale</h3>
            <ul className="list-disc list-inside text-gray-300">
              {(result.whatToScale || result.WhatToScale || []).map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>
n          <div>
            <h3 className="text-sm font-semibold">What to Stop</h3>
            <ul className="list-disc list-inside text-gray-300">
              {(result.whatToStop || result.WhatToStop || []).map((s, idx) => <li key={idx}>{s}</li>)}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">No results yet. Select campaigns and click "Run AI Analysis".</div>
      )}
    </div>
  )
}
