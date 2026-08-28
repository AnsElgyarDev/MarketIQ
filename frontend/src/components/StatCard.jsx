import React from 'react'

export default function StatCard({ title, value }) {
  return (
    <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-4 rounded-lg shadow flex flex-col">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  )
}
