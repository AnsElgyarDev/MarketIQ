import React, { useMemo } from "react"
import type { Campaign } from '../data/mockData'

type CampaignTableProps = {
  campaigns: Campaign[]
  selectedIds?: string[]
  setSelectedIds: (ids: string[]) => void
}

function formatCurrency(value: number | string, fractionDigits = 0) {
  try {
    let num: number | string = value
    if (typeof value === 'string') {
      num = Number(String(value).replace(/[^0-9.-]+/g, ''))
    }
    if (typeof num === 'number' && !isNaN(num)) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: fractionDigits }).format(num)
    }
  } catch {
    // ignore
  }
  return String(value)
}

export default function CampaignTable({ campaigns: allCampaigns, selectedIds = [], setSelectedIds }: CampaignTableProps) {
  const campaigns = useMemo(() => (allCampaigns || []).filter((campaign) => campaign.status === "Active"), [allCampaigns])

  function toggle(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(Array.from(next))
  }

  function toggleAll() {
    if ((selectedIds || []).length === campaigns.length) setSelectedIds([])
    else setSelectedIds(campaigns.map((campaign) => campaign.id))
  }

  function handleRowKey(event: React.KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      toggle(id)
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-[#66635B] dark:text-[#9E9A90]">Showing {campaigns.length} active campaign(s)</div>
        <div>
          <button
            onClick={toggleAll}
            className="inline-flex items-center gap-2 transform-gpu rounded-lg border border-[#E6E2DD] bg-white px-3 py-1.5 text-sm font-medium text-[#DA7756] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DA7756] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] motion-reduce:transition-none btn-bouncy dark:border-[#2E2E2A] dark:bg-[#1F1F1D] dark:text-[#F2B79F] dark:focus-visible:ring-offset-[#171715]"
          >
            {(selectedIds || []).length === campaigns.length ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E6E2DD] bg-white/80 shadow-sm dark:border-[#2E2E2A] dark:bg-[#21211F]/95">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-[#F3EFEA] text-sm text-[#66635B] dark:bg-[#282824] dark:text-[#9E9A90]">
              <th className="px-4 py-3" />
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Platform</th>
              <th className="px-6 py-3">Spend</th>
              <th className="px-6 py-3">Conversions</th>
              <th className="px-6 py-3">Cost / Result</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const id = campaign.id
              const name = campaign.name
              const platform = campaign.platform
              const spend = campaign.spend || 0
              const conversions = campaign.conversions || 0
              const cost = campaign.costPerResult || 0
              const status = campaign.status
              const isSelected = (selectedIds || []).includes(id)

              return (
                <tr
                  key={id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => handleRowKey(event, id)}
                  onClick={() => toggle(id)}
                  className={`cursor-pointer border-b border-[#EFE9E2] transition-all duration-200 dark:border-[#2E2E2A] ${isSelected ? "bg-[#FDF5F2] shadow-sm dark:bg-[#2B2722]" : "hover:bg-[#F8F5F1] hover:-translate-y-0.5 dark:hover:bg-[#282824]"}`}
                >
                  <td className="px-4 py-3">
                    <input
                      aria-label={`select-${id}`}
                      type="checkbox"
                      checked={isSelected}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggle(id)}
                      className="h-4 w-4 rounded border-[#E6E2DD] bg-white text-[#DA7756] shadow-sm focus:ring-2 focus:ring-[#DA7756] focus:ring-offset-2 focus:ring-offset-[#FAF8F5] dark:border-[#4A4A46] dark:bg-[#1D1C1A] dark:text-[#DA7756] dark:focus:ring-offset-[#171715]"
                    />
                  </td>

                  <td className="px-6 py-3 font-medium text-[#191919] dark:text-[#ECE9E3]">{name}</td>
                  <td className="px-6 py-3 text-[#66635B] dark:text-[#9E9A90]">{platform}</td>
                  <td className="px-6 py-3 text-[#191919] dark:text-[#ECE9E3]">{formatCurrency(spend, 0)}</td>
                  <td className="px-6 py-3 text-[#191919] dark:text-[#ECE9E3]">{conversions}</td>
                  <td className="px-6 py-3 text-[#191919] dark:text-[#ECE9E3]">{formatCurrency(cost, 2)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${status === "Active" ? "bg-[#E7F6EE] text-[#166534] dark:bg-[#1E382B] dark:text-[#B7E8CB]" : "bg-[#FFF4E6] text-[#7C2D12] dark:bg-[#33291F] dark:text-[#F3C09A]"}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              )
            })}

            {campaigns.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-[#66635B] dark:text-[#9E9A90]">No active campaigns found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
