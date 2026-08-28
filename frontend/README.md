MarketIQ Frontend (Vite + React + Tailwind)

This is a demo frontend for the MarketIQ dashboard. It connects to the backend API at http://localhost:5000/api.

Features:
- Dark-themed dashboard using Tailwind CSS
- Analytics stat cards (Total Spend, Avg ROAS, Wasted Budget)
- Campaign table showing active campaigns fetched from GET /api/campaigns
- Select campaigns via checkboxes and run AI analysis using POST /api/analyze
- AI Insights Panel displays WhatToScale, WhatToStop, and Summary

Setup:
1. Ensure the backend is running and reachable at http://localhost:5000 (CORS is enabled in the backend project provided).
2. From this folder (D:\MarketIQ-SaaS\frontend):
   - npm install
   - npm run dev
3. Open the dev server printed by Vite (e.g. http://localhost:5173)

Notes:
- For simplicity the UI maps campaign rows to backend results by campaign name when gathering selections (adequate for demo). For production, lift selection state to a shared store.
- Tailwind is configured; run the normal install flow (npm install) to obtain dependencies.
