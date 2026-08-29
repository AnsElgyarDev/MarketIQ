import React from "react"

function formatCurrency(value) {
  try {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
    }
    // if it's a numeric string (like '1200')
    const num = Number(String(value).replace(/[^0-9.-]+/g, ''))
    if (!isNaN(num)) return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
  } catch (e) {
    // fall through
  }
  return value
}

export default function StatCard({ title, value }) {
  const display = (typeof value === 'number' || typeof value === 'string') && String(title).toLowerCase().includes('spend') ? formatCurrency(value) : value

  return (
    <div className="group transform-gpu rounded-2xl border border-[#E6E2DD] bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg dark:border-[#2E2E2A] dark:bg-[#21211F] sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-[#DA7756] shadow-sm" />
          <div className="text-sm font-medium text-[#66635B] dark:text-[#9E9A90]">{title}</div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-[#66635B] dark:text-[#9E9A90]">Live</div>
      </div>

      <div className="mt-1 text-3xl font-sans font-semibold tracking-normal text-neutral-900 dark:text-neutral-100">{display}</div>
    </div>
  )
}
