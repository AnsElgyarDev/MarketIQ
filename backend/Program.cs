using MarketIQ.Backend.Models;
using MarketIQ.Backend.MockData;

var builder = WebApplication.CreateBuilder(args);

// Configure CORS for local testing - allow any origin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowAll");

// Swagger enabled for testing
app.UseSwagger();
app.UseSwaggerUI();

// Load mock campaigns
var campaigns = SeedData.Campaigns;

// GET /api/campaigns - returns mock campaigns
app.MapGet("/api/campaigns", () => Results.Ok(campaigns))
   .WithName("GetCampaigns")
   .WithTags("Campaigns");

// POST /api/analyze - accepts campaign IDs and returns mock AI insights
app.MapPost("/api/analyze", (AnalyzeRequest request) =>
{
    if (request.CampaignIds == null || request.CampaignIds.Count == 0)
    {
        return Results.BadRequest(new { Error = "Provide one or more campaign IDs in CampaignIds." });
    }

    var selected = campaigns.Where(c => request.CampaignIds.Contains(c.Id)).ToList();
    if (!selected.Any())
    {
        return Results.BadRequest(new { Error = "No campaigns found for the provided IDs." });
    }

    // Simple mock "AI" logic: recommend scaling low cost per result, stopping high cost per result
    var toScale = selected.OrderBy(c => c.CostPerResult).Take(3)
        .Select(c => $"{c.Name} (Platform: {c.Platform}) - CostPerResult: {c.CostPerResult:C}")
        .ToList();

    var toStop = selected.OrderByDescending(c => c.CostPerResult).Take(3)
        .Select(c => $"{c.Name} (Platform: {c.Platform}) - CostPerResult: {c.CostPerResult:C}")
        .ToList();

    var summary = $"Analyzed {selected.Count} campaign(s). Recommended scaling {toScale.Count} and stopping {toStop.Count}.";

    var response = new AnalyzeResponse
    {
        WhatToScale = toScale,
        WhatToStop = toStop,
        Summary = summary
    };

    return Results.Ok(response);
})
.WithName("AnalyzeCampaigns")
.WithTags("Analysis");

app.Run();