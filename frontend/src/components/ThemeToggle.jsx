import React from "react"

function SunIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.3M12 19.2v2.3M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" strokeLinecap="round" />
    </svg>
  )
}

function MoonIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d="M20.5 14.5A7.8 7.8 0 0 1 9.5 3.5a8.8 8.8 0 1 0 11 11Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === "dark"

  function handleClick() {
    const next = isDark ? 'light' : 'dark'
    try {
      // toggle the class directly on the root element for immediate effect
      document.documentElement.classList.toggle('dark', next === 'dark')
      localStorage.setItem('marketiq-theme', next)
    } catch (e) {
      // ignore storage errors
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group relative inline-flex items-center gap-3 rounded-lg border border-[#E6E2DD] bg-[#F3EFEA] px-3 py-1.5 text-sm font-medium text-[#191919] shadow-sm transition-colors duration-300 ease-in-out hover:opacity-90 dark:border-[#2E2E2A] dark:bg-[#282824] dark:text-[#ECE9E3] focus:outline-none focus:ring-2 focus:ring-[#DA7756] focus:ring-offset-2"
    >
      <span
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out dark:bg-[#21211F] ${
          isDark ? "translate-x-0" : "translate-x-0"
        }`}
      >
        <SunIcon className={`h-4 w-4 text-[#DA7756] transition-all duration-300 ease-in-out ${isDark ? "rotate-90 scale-75 opacity-60" : "rotate-0 scale-100 opacity-100"}`} />
      </span>

      <span className="flex items-center gap-2">
        <span className="sr-only">Theme</span>
        <span className="text-[#191919] dark:text-[#ECE9E3]">Theme</span>
      </span>

      <span className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-transparent text-[#66635B] dark:text-[#9E9A90] transition-transform duration-300">
        <MoonIcon className={`h-4 w-4 transition-all duration-300 ease-in-out ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-60"}`} />
      </span>
    </button>
  )
}
