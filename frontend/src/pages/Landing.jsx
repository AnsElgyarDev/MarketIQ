import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-[#171715] transition-colors duration-200 p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-serif mb-4 text-[#191919] dark:text-[#ECE9E3]">Welcome to MarketIQ</h1>
        <p className="mb-6 text-[#66635B] dark:text-[#9E9A90]">A lightweight demo showing AI-driven insights and improved UX micro-interactions.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-[#DA7756] px-4 py-2 text-white hover:opacity-90 transition-all duration-200">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
