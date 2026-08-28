MarketIQ Backend (Minimal API)

This is a small .NET 8 Minimal API that serves mock endpoints for the MarketIQ AI-Powered Ad Campaign Optimizer.

Endpoints:
- GET /api/campaigns  -> Returns a list of mock campaigns (Name, Platform, Spend, Conversions, CostPerResult, Status)
- POST /api/analyze  -> Accepts JSON body { "campaignIds": ["guid1","guid2"] } and returns mock AI insights: WhatToScale, WhatToStop, Summary

CORS:
- Configured to allow any origin for local testing.

Swagger:
- Available at /swagger when the app is running.

Run locally:
1. Open a terminal in this folder (D:\MarketIQ-SaaS\backend)
2. dotnet restore
3. dotnet run

The app will listen on the default URLs; visit https://localhost:<port>/swagger to test the endpoints.
