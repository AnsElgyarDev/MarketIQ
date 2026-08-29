import React from "react"

export default function StatCard({ title, value }) {
  return (
    <div className="group transform-gpu rounded-2xl border border-[#E6E2DD] bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg dark:border-[#2E2E2A] dark:bg-[#21211F] sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block h-3 w-3 rounded-full bg-[#DA7756] shadow-sm" />
          <div className="text-sm font-medium text-[#66635B] dark:text-[#9E9A90]">{title}</div>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-[#66635B] dark:text-[#9E9A90]">Live</div>
      </div>

      <div className="mt-1 text-3xl font-sans font-semibold tracking-normal text-neutral-900 dark:text-neutral-100">{value}</div>
    </div>
  )
}
