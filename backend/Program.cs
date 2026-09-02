using MarketIQ.Backend.Models;
using MarketIQ.Backend.MockData;
using MarketIQ.Backend.Config;
using MarketIQ.Backend.Middleware;
using MarketIQ.Backend.Infrastructure;
using MarketIQ.Backend.Services;
using MarketIQ.Backend.Startup;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// Configure basic logging (console). Replace with Serilog in future for production sinks.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Bind provider configuration early so we can validate startup behavior based on environment.
var googleSection = builder.Configuration.GetSection("Auth:Providers:Google");
var googleSettings = new GoogleAuthSettings();
googleSection.Bind(googleSettings);
// Register the bound settings instance for later checks (no provider wiring yet)
builder.Services.AddSingleton(googleSettings);

// Configure CORS - development allows all, production should be restricted via AllowedOrigins config
builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
    }
    else
    {
        var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new string[0];
        options.AddPolicy("DefaultPolicy", p => p.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader().AllowCredentials());
    }
});

builder.Services.AddEndpointsApiExplorer();
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen();
}

// Application services (in-memory for now)
builder.Services.AddSingleton<ICampaignService, InMemoryCampaignService>();
// No provider implementations yet - register a safe disabled provider by default
builder.Services.AddSingleton<IAuthProvider, AuthDisabledProvider>();

var app = builder.Build();

var logger = app.Logger;

// Startup validation for provider configuration with environment-specific behavior.
StartupValidators.ValidateGoogleAuth(googleSettings, app.Environment, logger);

// Global exception handling middleware (catches unhandled exceptions and returns ProblemDetails)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
    // Swagger enabled in Development only
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseCors("DefaultPolicy");
}

// Health endpoints
app.MapGet("/health/live", () => Results.Ok(new { status = "Live" }))
   .WithName("Liveness");

app.MapGet("/health/ready", (GoogleAuthSettings google) =>
{
    if (google != null && google.Enabled)
    {
        if (string.IsNullOrWhiteSpace(google.ClientId) || string.IsNullOrWhiteSpace(google.ClientSecret))
        {
            return Results.StatusCode(503);
        }
    }
    return Results.Ok(new { status = "Ready" });
}).WithName("Readiness");

// API endpoints wired to application services
app.MapGet("/api/campaigns", (ICampaignService svc) => Results.Ok(svc.GetAll()))
   .WithName("GetCampaigns")
   .WithTags("Campaigns");

app.MapPost("/api/analyze", (AnalyzeRequest request, ICampaignService svc) =>
{
    if (request.CampaignIds == null || request.CampaignIds.Count == 0)
    {
        return Results.BadRequest(new { Error = "Provide one or more campaign IDs in CampaignIds." });
    }

    var response = svc.Analyze(request);
    if (string.IsNullOrEmpty(response.Summary) && (response.WhatToScale == null || response.WhatToScale.Count == 0) && (response.WhatToStop == null || response.WhatToStop.Count == 0))
    {
        return Results.BadRequest(new { Error = "No campaigns found for the provided IDs." });
    }

    return Results.Ok(response);
})
.WithName("AnalyzeCampaigns")
.WithTags("Analysis");

app.Run();

// Expose Program for integration testing (WebApplicationFactory)
public partial class Program { }