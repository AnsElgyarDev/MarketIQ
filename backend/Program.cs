using MarketIQ.Backend.Models;
using MarketIQ.Backend.MockData;
using MarketIQ.Backend.Config;
using MarketIQ.Backend.Middleware;
using MarketIQ.Backend.Infrastructure;
using MarketIQ.Backend.Infrastructure.Auth;
using MarketIQ.Backend.Services;
using MarketIQ.Backend.Startup;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var googleSection = builder.Configuration.GetSection("Auth:Providers:Google");
var googleSettings = new GoogleAuthSettings();
googleSection.Bind(googleSettings);
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtSettings = jwtSection.Get<JwtSettings>() ?? new JwtSettings();

builder.Services.Configure<GoogleAuthSettings>(googleSection);
builder.Services.Configure<JwtSettings>(jwtSection);
builder.Services.AddSingleton(googleSettings);
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddTransient<OpenAIService>();

builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
    }
    else
    {
        var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
        if (origins.Length == 0)
        {
            options.AddPolicy("DefaultPolicy", p => p.SetIsOriginAllowed(_ => false));
        }
        else
        {
            options.AddPolicy("DefaultPolicy", p => p.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader().AllowCredentials());
        }
    }
});

builder.Services.AddEndpointsApiExplorer();
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen();
}

builder.Services.AddSingleton<ICampaignService, InMemoryCampaignService>();

var startupLogger = LoggerFactory.Create(logging => logging.AddConsole()).CreateLogger("MarketIQ.Startup");
StartupValidators.ValidateGoogleAuth(googleSettings, builder.Environment, startupLogger);
StartupValidators.ValidateJwtSettings(jwtSettings, builder.Environment, startupLogger);

if (googleSettings.Enabled)
{
    builder.Services.AddHttpClient<IAuthProvider, GoogleAuthProvider>();
}
else
{
    builder.Services.AddSingleton<IAuthProvider, AuthDisabledProvider>();
}

builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

var logger = app.Logger;
if (!googleSettings.Enabled)
{
    logger.LogWarning("Google auth is disabled for this runtime. The app is running with AuthDisabledProvider.");
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseCors("DefaultPolicy");
}

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

app.MapGoogleAuthEndpoints();

app.Run();

public partial class Program { }