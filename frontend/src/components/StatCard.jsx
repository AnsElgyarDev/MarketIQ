import React from 'react'
nexport default function StatCard({ title, value }) {
  return (
    <div className="card p-6 flex flex-col">
      <div className="text-sm text-[#66635B]">{title}</div>
      <div className="mt-3 text-2xl font-serif font-semibold text-[#191919]">{value}</div>
    </div>
  )
}
