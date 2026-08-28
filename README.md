# MarketIQ SaaS

MarketIQ is a lightweight SaaS web application designed to help digital marketers analyze ad campaign performance and derive actionable optimizations. Built with a high-performance .NET 8 Minimal API backend and a clean, editorial React frontend, it processes campaign metrics to highlight key scaling and cost-reduction opportunities.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Design Philosophy](#design-philosophy)
- [Future Enhancements](#future-enhancements)

---

## Overview

Managing multi-platform advertising campaigns (Facebook, Google, TikTok, LinkedIn) often presents data overload. MarketIQ simplifies this process by aggregating core performance indicators (ROAS, total spend, wasted budget, cost per conversion) into a unified dashboard. Users can select active campaigns and trigger an analysis engine that synthesizes performance trends into actionable recommendations.

---

## Architecture & Tech Stack

### Backend
- **Framework:** .NET 8 Minimal APIs
- **Documentation:** OpenAPI / Swagger UI
- **Cross-Origin Resource Sharing:** Configured CORS policy for local client integration
- **Language:** C# 12

### Frontend
- **Framework:** React 18 (Vite)
- **Styling:** Tailwind CSS
- **HTTP Client:** Native Fetch API
- **Language:** JavaScript (ES6+)

---

## Key Features

- **Performance Metrics Overview:** High-level summary cards displaying Total Spend, Average ROAS, and Wasted Budget.
- **Campaign Management Table:** Structured data presentation supporting multi-campaign selection via checkboxes.
- **Analysis Trigger:** Synchronous analysis execution against selected campaign IDs.
- **Editorial Insights Panel:** Distinct categorization of recommended actions ("What to Scale", "What to Stop", and executive summaries).
- **Responsive Layout:** Editorial, light-themed user experience built with minimal clutter and clear typography.

---

## Project Structure

```text
MarketIQ-SaaS/
├── backend/
│   ├── Program.cs
│   ├── MarketIQ.csproj
│   ├── appsettings.json
│   └── Properties/
│       └── launchSettings.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── .gitignore
```

---

## Getting Started

### Prerequisites

Ensure the following runtimes and tools are installed on your environment:

- **.NET 8.0 SDK** or later
- **Node.js** (v18.0.0 or later)
- **npm** (v9.0.0 or later)
- **Git**

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Restore dependencies and build the solution:
   ```bash
   dotnet build
   ```

3. Run the .NET application:
   ```bash
   dotnet run
   ```
   The backend service will initialize on `http://localhost:5000` (or the configured HTTPS port). Swagger UI is accessible at `http://localhost:5000/swagger`.

---

### Frontend Setup

1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open the application in your browser at the address indicated by Vite (typically `http://localhost:5173`).

---

## API Documentation

### 1. Fetch Active Campaigns

- **Endpoint:** `GET /api/campaigns`
- **Description:** Retrieves all active marketing campaigns.
- **Response Format:** `application/json`

**Sample Response:**
```json
[
  {
    "id": 1,
    "name": "Spring Sale - Shoes",
    "platform": "Facebook",
    "spend": 1200,
    "conversions": 120,
    "costPerResult": 10.0,
    "status": "Active"
  },
  {
    "id": 2,
    "name": "Summer Promo - Sunglasses",
    "platform": "Google",
    "spend": 800,
    "conversions": 40,
    "costPerResult": 20.0,
    "status": "Active"
  }
]
```

### 2. Run Campaign Analysis

- **Endpoint:** `POST /api/analyze`
- **Description:** Accepts an array of campaign IDs and processes performance evaluations.
- **Request Body:**
```json
{
  "campaignIds": [1, 2]
}
```

**Sample Response:**
```json
{
  "whatToScale": [
    "Increase budget on Spring Sale - Shoes (Facebook) due to high conversion volume and low cost per result."
  ],
  "whatToStop": [
    "Re-evaluate Summer Promo - Sunglasses (Google) as acquisition costs exceed acceptable thresholds."
  ],
  "summary": "Selected campaigns show strong performance on social channels compared to search networks."
}
```

---

## Design Philosophy

The user interface avoids traditional high-contrast dark modes and neon accents in favor of a warm, editorial layout. Inspired by print typography and clean software tools, the UI uses:

- **Warm Cream & Off-White Surfaces:** Reduces eye fatigue during extended analytical sessions.
- **Dark Charcoal Typography:** Provides sharp readability without the harsh contrast of pure black on white.
- **Restrained Accents:** Highlighting relies on subtle borders, padding, and muted tones rather than saturated graphics.

---

## Future Enhancements

- **LLM API Integration:** Replace current rule-based placeholders with direct OpenAI / Claude API endpoints for dynamic narrative generation.
- **Authentication & Multi-Tenancy:** Implement JWT token validation and workspace separation.
- **Database Persistence:** Integrate Entity Framework Core with PostgreSQL/SQL Server for historical performance tracking.
- **Export Capabilities:** Allow automated PDF/CSV report generation for analytical summary findings.
