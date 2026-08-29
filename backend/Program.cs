using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;
using MarketIQ.Backend.MockData;
using MarketIQ.Backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
   options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(options =>
{
   options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
   options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
   options.Cookie.Name = "marketiq-auth";
   options.LoginPath = "/api/auth/login/google";
   options.AccessDeniedPath = "/api/auth/access-denied";
   options.Cookie.HttpOnly = true;
   options.Cookie.SameSite = SameSiteMode.Lax;
   options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
})
.AddGoogle(options =>
{
   options.ClientId = builder.Configuration["Authentication:Google:ClientId"]
       ?? throw new InvalidOperationException("Authentication:Google:ClientId is missing. Configure it in User Secrets or appsettings.Development.json.");
   options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
       ?? throw new InvalidOperationException("Authentication:Google:ClientSecret is missing. Configure it in User Secrets or appsettings.Development.json.");
   options.CallbackPath = "/api/auth/google/callback";
   options.SaveTokens = true;
})
.AddOAuth("TikTok", options =>
{
   options.ClientId = builder.Configuration["Authentication:TikTok:ClientKey"]
       ?? throw new InvalidOperationException("Authentication:TikTok:ClientKey is missing. Configure it in User Secrets or appsettings.Development.json.");
   options.ClientSecret = builder.Configuration["Authentication:TikTok:ClientSecret"]
       ?? throw new InvalidOperationException("Authentication:TikTok:ClientSecret is missing. Configure it in User Secrets or appsettings.Development.json.");
   options.CallbackPath = "/api/auth/tiktok/callback";
   options.AuthorizationEndpoint = "https://www.tiktok.com/v2/auth/authorize/";
   options.TokenEndpoint = "https://open.tiktokapis.com/v2/oauth/token/";
   options.UserInformationEndpoint = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,avatar_url";
   options.Scope.Add("user.info.basic");
   options.SaveTokens = true;
   options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "open_id");
   options.Events = new OAuthEvents
   {
       OnCreatingTicket = async context =>
       {
           using var request = new HttpRequestMessage(HttpMethod.Get, options.UserInformationEndpoint);
           request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);

           var response = await context.Backchannel.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, context.HttpContext.RequestAborted);
           response.EnsureSuccessStatusCode();

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
   };
});

builder.Services.AddAuthorization();

var app = builder.Build();

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