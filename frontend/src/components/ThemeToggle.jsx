import React, { useEffect } from "react"

export default function ThemeToggle({ theme, setTheme }) {
  // This component toggles the 'dark' class on <html> and saves to localStorage for the legacy frontend copy
  const isDark = theme === "dark"

  useEffect(() => {
    // ensure root class in case parent didn't set
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark)
    }
  }, [isDark])

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-2 rounded-lg bg-[#F3EFEA] dark:bg-[#282824] px-3 py-1.5 text-sm font-medium text-[#191919] dark:text-[#ECE9E3] shadow-sm transition-all duration-200"
    >
      <span className="h-5 w-5">
        {isDark ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#ECE9E3]">
            <path d="M21.64 13a8.06 8.06 0 0 1-9.28 8.6 8 8 0 1 0 9.28-8.6z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#DA7756]">
            <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8L6.76 4.84zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.83 2.05l1.79-1.8-1.79-1.79-1.8 1.79 1.8 1.8zM17 13h3v-2h-3v2zM6.76 19.16l-1.79 1.8 1.79 1.79 1.8-1.79-1.8-1.8zM12 19a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" />
          </svg>
        )}
      </span>
      <span className="text-[#191919] dark:text-[#ECE9E3]">Theme</span>
    </button>
  )
}
