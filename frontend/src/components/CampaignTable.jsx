import React, { useMemo, useState } from 'react'

export default function CampaignTable({ campaigns: allCampaigns }) {
  // Only show active campaigns as requested
  const campaigns = useMemo(() => (allCampaigns || []).filter(c => c.status === 'Active' || c.Status === 'Active'), [allCampaigns])
  const [selected, setSelected] = useState(new Set())

  function toggle(id) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function toggleAll() {
    if (selected.size === campaigns.length) setSelected(new Set())
    else setSelected(new Set(campaigns.map(c => c.id || c.Id)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-400">Showing {campaigns.length} active campaign(s)</div>
        <div className="text-sm">
          <button onClick={toggleAll} className="text-sm text-blue-300 hover:underline">{selected.size === campaigns.length ? 'Deselect All' : 'Select All'}</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-700">
              <th className="py-2 pr-4"> </th>
              <th className="py-2 pr-6">Name</th>
              <th className="py-2 pr-6">Platform</th>
              <th className="py-2 pr-6">Spend</th>
              <th className="py-2 pr-6">Conversions</th>
              <th className="py-2 pr-6">Cost / Result</th>
              <th className="py-2 pr-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(c => {
              const id = c.id || c.Id
              const name = c.name || c.Name
              const platform = c.platform || c.Platform
              const spend = c.spend || c.Spend
              const conversions = c.conversions || c.Conversions
              const cost = c.costPerResult || c.CostPerResult
              const status = c.status || c.Status
              const isSelected = selected.has(id)
              return (
                <tr key={id} className={`border-b border-gray-800 ${isSelected ? 'bg-gray-700/40' : ''}`}>
                  <td className="py-2 pr-4">
                    <input type="checkbox" checked={isSelected} onChange={() => toggle(id)} />
                  </td>
                  <td className="py-2 pr-6">{name}</td>
                  <td className="py-2 pr-6">{platform}</td>
                  <td className="py-2 pr-6">${Number(spend).toLocaleString()}</td>
                  <td className="py-2 pr-6">{conversions}</td>
                  <td className="py-2 pr-6">${Number(cost).toFixed(2)}</td>
                  <td className="py-2 pr-6"><span className={`px-2 py-1 rounded ${status === 'Active' ? 'bg-green-700 text-green-100' : 'bg-yellow-700 text-yellow-100'}`}>{status}</span></td>
                </tr>
              )
            })}
            {campaigns.length === 0 && (
              <tr><td colSpan={7} className="py-4 text-gray-400">No active campaigns found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
