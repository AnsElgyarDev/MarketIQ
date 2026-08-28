import React, { useMemo } from 'react'

export default function CampaignTable({ campaigns: allCampaigns, selectedIds = [], setSelectedIds }) {
  // Only show active campaigns as requested
  const campaigns = useMemo(() => (allCampaigns || []).filter(c => (c.status === 'Active' || c.Status === 'Active')), [allCampaigns])
n  function toggle(id) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(Array.from(next))
  }
n  function toggleAll() {
    if ((selectedIds || []).length === campaigns.length) setSelectedIds([])
    else setSelectedIds(campaigns.map(c => c.id || c.Id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-[#66635B]">Showing {campaigns.length} active campaign(s)</div>
        <div className="text-sm">
          <button onClick={toggleAll} className="text-sm text-[#C65D3B] hover:underline">{(selectedIds || []).length === campaigns.length ? 'Deselect All' : 'Select All'}</button>
        </div>
      </div>
n      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-sm text-[#66635B]" style={{ backgroundColor: '#F4F1EA' }}>
              <th className="py-3 pr-4"> </th>
              <th className="py-3 pr-6">Name</th>
              <th className="py-3 pr-6">Platform</th>
              <th className="py-3 pr-6">Spend</th>
              <th className="py-3 pr-6">Conversions</th>
              <th className="py-3 pr-6">Cost / Result</th>
              <th className="py-3 pr-6">Status</th>
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
              const isSelected = (selectedIds || []).includes(id)
              return (
                <tr key={id} className={`border-b`} style={{ borderColor: '#EFE9E2' }}>
                  <td className="py-3 pr-4">
                    <input aria-label={`select-${id}`} className="h-4 w-4 rounded border-[#E6E2DD] text-[#C65D3B] bg-white" type="checkbox" checked={isSelected} onChange={() => toggle(id)} />
                  </td>
                  <td className="py-3 pr-6 text-[#191919]">{name}</td>
                  <td className="py-3 pr-6 text-[#66635B]">{platform}</td>
                  <td className="py-3 pr-6 text-[#191919]">${Number(spend).toLocaleString()}</td>
                  <td className="py-3 pr-6 text-[#191919]">{conversions}</td>
                  <td className="py-3 pr-6 text-[#191919]">${Number(cost).toFixed(2)}</td>
                  <td className="py-3 pr-6"><span className={`px-2 py-1 rounded`} style={{ backgroundColor: status === 'Active' ? '#E7F6EE' : '#FFF4E6', color: status === 'Active' ? '#166534' : '#7C2D12' }}>{status}</span></td>
                </tr>
              )
            })}
            {campaigns.length === 0 && (
              <tr><td colSpan={7} className="py-6 text-[#66635B]">No active campaigns found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
