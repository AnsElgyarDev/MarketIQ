using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using MarketIQ.Backend.MockData;
using MarketIQ.Backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
   options.AddPolicy("AllowAll", policy =>
   {
       policy.WithOrigins("http://localhost:5173", "http://localhost:4173")
             .AllowAnyHeader()
             .AllowAnyMethod()
             .AllowCredentials();
   });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure authentication with safe, conditional registration of external providers
var authBuilder = builder.Services.AddAuthentication(options =>
{
   // Default to cookie-based scheme for app authentication. Don't make a provider the default challenge
   options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
});

authBuilder.AddCookie(options =>
{
   options.Cookie.Name = "marketiq-auth";
   options.LoginPath = "/api/auth/login/google";
   options.AccessDeniedPath = "/api/auth/access-denied";
   options.Cookie.HttpOnly = true;
   options.Cookie.SameSite = SameSiteMode.Lax;
   options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

// Collect startup warnings to log after the app is built (can't resolve ILogger until DI is built)
var providerRegistrationWarnings = new System.Collections.Generic.List<string>();
var config = builder.Configuration;

// Google - read from configuration or environment variables and register the handler
var googleClientId = config["Authentication:Google:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID");
var googleClientSecret = config["Authentication:Google:ClientSecret"] ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_SECRET");

var googleConfigured = !string.IsNullOrWhiteSpace(googleClientId) && !string.IsNullOrWhiteSpace(googleClientSecret);

if (!googleConfigured)
{
    providerRegistrationWarnings.Add("Google authentication has missing ClientId/ClientSecret. Set them via User Secrets, environment variables (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET), or appsettings.");
}

// Register Google handler unconditionally so the scheme is available; credentials may come from env/user-secrets at runtime
authBuilder.AddGoogle(options =>
{
    options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.ClientId = googleClientId ?? string.Empty;
    options.ClientSecret = googleClientSecret ?? string.Empty;
    options.CallbackPath = "/api/auth/google/callback";
    options.SaveTokens = true;

    // Make correlation cookie tolerant for local development (SameSite=Lax, allow non-HTTPS if SameAsRequest)
    options.CorrelationCookie.SameSite = SameSiteMode.Lax;
    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.CorrelationCookie.HttpOnly = true;
});

// TikTok - read client key/id and secret from configuration or environment variables and register the handler
var tiktokClientKey = config["Authentication:TikTok:ClientKey"] ?? Environment.GetEnvironmentVariable("TIKTOK_CLIENT_KEY");
var tiktokClientId = config["Authentication:TikTok:ClientId"] ?? Environment.GetEnvironmentVariable("TIKTOK_CLIENT_ID"); // optional alternate name
var tiktokClientSecret = config["Authentication:TikTok:ClientSecret"] ?? Environment.GetEnvironmentVariable("TIKTOK_CLIENT_SECRET");

if (string.IsNullOrWhiteSpace(tiktokClientSecret) || (string.IsNullOrWhiteSpace(tiktokClientKey) && string.IsNullOrWhiteSpace(tiktokClientId)))
{
    providerRegistrationWarnings.Add("TikTok authentication has missing ClientKey/ClientId or ClientSecret. Set them via User Secrets, environment variables (TIKTOK_CLIENT_KEY/TIKTOK_CLIENT_SECRET), or appsettings.");
}

var resolvedTikTokClientId = !string.IsNullOrWhiteSpace(tiktokClientKey) ? tiktokClientKey : tiktokClientId;
var tiktokConfigured = !string.IsNullOrWhiteSpace(resolvedTikTokClientId) && !string.IsNullOrWhiteSpace(tiktokClientSecret);

// Register TikTok handler unconditionally so the scheme is available; credentials should be provided in env/user-secrets
authBuilder.AddOAuth("TikTok", options =>
{
    options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.ClientId = resolvedTikTokClientId ?? string.Empty;
    options.ClientSecret = tiktokClientSecret ?? string.Empty;
    options.CallbackPath = "/api/auth/tiktok/callback";
    options.AuthorizationEndpoint = "https://www.tiktok.com/v2/auth/authorize/";
    options.TokenEndpoint = "https://open.tiktokapis.com/v2/oauth/token/";
    options.UserInformationEndpoint = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,avatar_url";
    options.Scope.Add("user.info.basic");
    options.SaveTokens = true;
    options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "open_id");

    // Correlation cookie settings to cooperate with local HTTP dev servers
    options.CorrelationCookie.SameSite = SameSiteMode.Lax;
    options.CorrelationCookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.CorrelationCookie.HttpOnly = true;

    options.Events = new OAuthEvents
    {
        OnCreatingTicket = async context =>
        {
            var loggerFactory = context.HttpContext.RequestServices.GetService(typeof(ILoggerFactory)) as ILoggerFactory;
            var logger = loggerFactory?.CreateLogger("OAuth.TikTok") ?? Microsoft.Extensions.Logging.Abstractions.NullLogger.Instance;
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, options.UserInformationEndpoint);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);

                var response = await context.Backchannel.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);
                if (!response.IsSuccessStatusCode)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    var snippet = body?.Length > 1000 ? body.Substring(0, 1000) + "..." : body;
                    logger.LogWarning("TikTok userinfo request failed with status {StatusCode}. Response body (truncated): {BodySnippet}", response.StatusCode, snippet);
                    context.Fail($"Failed to retrieve TikTok user information. Status: {response.StatusCode}");
                    return;
                }

                using var payload = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
                var user = payload.RootElement.TryGetProperty("data", out var data) && data.TryGetProperty("user", out var userElement)
                    ? userElement
                    : payload.RootElement;

                if (user.TryGetProperty("open_id", out var openId) && !string.IsNullOrWhiteSpace(openId.GetString()))
                {
                    context.Identity?.AddClaim(new Claim(ClaimTypes.NameIdentifier, openId.GetString()!));
                }

                if (user.TryGetProperty("display_name", out var displayName) && !string.IsNullOrWhiteSpace(displayName.GetString()))
                {
                    context.Identity?.AddClaim(new Claim(ClaimTypes.Name, displayName.GetString()!));
                }

                if (user.TryGetProperty("avatar_url", out var avatarUrl) && !string.IsNullOrWhiteSpace(avatarUrl.GetString()))
                {
                    context.Identity?.AddClaim(new Claim("avatar_url", avatarUrl.GetString()!));
                }

                context.Identity?.AddClaim(new Claim("provider", "tiktok"));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Exception while creating TikTok authentication ticket.");
                context.Fail("Exception while retrieving TikTok user info.");
            }
        }
    };
});


// Configure cookie policy to be tolerant for local development (allows SameSite=Lax and permits cookies over http when SameAsRequest)
builder.Services.Configure<CookiePolicyOptions>(options =>
{
    options.MinimumSameSitePolicy = SameSiteMode.Lax;
    options.HttpOnly = Microsoft.AspNetCore.CookiePolicy.HttpOnlyPolicy.Always;
    options.Secure = CookieSecurePolicy.SameAsRequest;
});

builder.Services.AddAuthorization();

var app = builder.Build();
// After the app is built we can log any provider registration warnings and the presence/absence of secrets (without printing sensitive values)
var logger = app.Services.GetRequiredService<ILogger<Program>>();
if (providerRegistrationWarnings.Count > 0)
{
    foreach (var w in providerRegistrationWarnings)
    {
        logger.LogWarning(w);
    }
}
// Log presence/absence of configured authentication providers (do not log secret values)
void LogPresence(string name, bool isPresent)
{
    logger.LogInformation("Auth provider '{Provider}' configured: {Configured}", name, isPresent);
}
LogPresence("Google", googleConfigured);
LogPresence("TikTok", tiktokConfigured);

app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
   app.UseSwagger();
   app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var campaigns = SeedData.Campaigns;

app.MapGet("/api/campaigns", () => Results.Ok(campaigns))
   .WithName("GetCampaigns")
   .WithTags("Campaigns");

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

