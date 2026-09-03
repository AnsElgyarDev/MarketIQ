using MarketIQ.Backend.Config;
using MarketIQ.Backend.Infrastructure.Auth;
using MarketIQ.Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace MarketIQ.Backend.Infrastructure.Auth
{
    public static class GoogleAuthEndpoints
    {
        public static void MapGoogleAuthEndpoints(this WebApplication app)
        {
            var authGroup = app.MapGroup("/api/auth/google");

            authGroup.MapGet("/login", (IAuthProvider provider, IConfiguration configuration, HttpContext httpContext) =>
            {
                if (provider is not GoogleAuthProvider googleProvider)
                {
                    return Results.Problem(
                        title: "Google authentication is disabled.",
                        detail: "Google OAuth is not enabled for this environment or the required credentials are missing.",
                        statusCode: StatusCodes.Status503ServiceUnavailable);
                }

                var requestedRedirectUri = httpContext.Request.Query["redirect_uri"].ToString();
                var redirectUri = !string.IsNullOrWhiteSpace(requestedRedirectUri)
                    ? requestedRedirectUri
                    : configuration["Auth:Providers:Google:RedirectUri"]
                        ?? configuration["Auth:Providers:Google:RedirectUris:0"]
                        ?? "http://localhost:5000/api/auth/google/callback";

                var state = Guid.NewGuid().ToString("N");
                var authorizationUrl = googleProvider.BuildAuthorizationUrl(redirectUri, state);

                return Results.Ok(new
                {
                    provider = googleProvider.Name,
                    redirectUri,
                    state,
                    authorizationUrl
                });
            }).WithName("GoogleLogin");

            authGroup.MapGet("/callback", async (IAuthProvider provider, IConfiguration configuration, IOptions<JwtSettings> jwtOptions, IJwtTokenService jwtTokenService, HttpContext httpContext) =>
            {
                var code = httpContext.Request.Query["code"].ToString();
                var state = httpContext.Request.Query["state"].ToString();
                var redirectUri = httpContext.Request.Query["redirect_uri"].ToString();

                if (string.IsNullOrWhiteSpace(code))
                {
                    return Results.BadRequest(new { error = "Authorization code is required." });
                }

                if (provider is not GoogleAuthProvider googleProvider)
                {
                    return Results.Problem(
                        title: "Google authentication is disabled.",
                        detail: "Google OAuth is not enabled for this environment or the required credentials are missing.",
                        statusCode: StatusCodes.Status503ServiceUnavailable);
                }

                var resolvedRedirectUri = string.IsNullOrWhiteSpace(redirectUri)
                    ? configuration["Auth:Providers:Google:RedirectUri"] ?? "http://localhost:5000/api/auth/google/callback"
                    : redirectUri;

                var result = await googleProvider.ExchangeCodeAsync(code, resolvedRedirectUri);
                var token = jwtTokenService.GenerateToken(result);
                var expiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(jwtOptions.Value.ExpiryMinutes);

                return Results.Ok(new
                {
                    provider = result.Provider,
                    isAuthenticated = true,
                    state,
                    accessToken = token,
                    tokenType = "Bearer",
                    expiresAt = expiresAtUtc,
                    user = new
                    {
                        result.Subject,
                        result.Email,
                        result.Name,
                        result.Picture
                    }
                });
            }).WithName("GoogleCallback");

            authGroup.MapPost("/callback", async ([FromBody] GoogleAuthCallbackRequest request, IAuthProvider provider, IConfiguration configuration, IOptions<JwtSettings> jwtOptions, IJwtTokenService jwtTokenService) =>
            {
                if (string.IsNullOrWhiteSpace(request.Code))
                {
                    return Results.BadRequest(new { error = "Authorization code is required." });
                }

                if (provider is not GoogleAuthProvider googleProvider)
                {
                    return Results.Problem(
                        title: "Google authentication is disabled.",
                        detail: "Google OAuth is not enabled for this environment or the required credentials are missing.",
                        statusCode: StatusCodes.Status503ServiceUnavailable);
                }

                var redirectUri = string.IsNullOrWhiteSpace(request.RedirectUri)
                    ? configuration["Auth:Providers:Google:RedirectUri"] ?? "http://localhost:5000/api/auth/google/callback"
                    : request.RedirectUri;

                var result = await googleProvider.ExchangeCodeAsync(request.Code, redirectUri);
                var token = jwtTokenService.GenerateToken(result);
                var expiresAtUtc = DateTimeOffset.UtcNow.AddMinutes(jwtOptions.Value.ExpiryMinutes);

                return Results.Ok(new
                {
                    provider = result.Provider,
                    isAuthenticated = true,
                    state = request.State,
                    accessToken = token,
                    tokenType = "Bearer",
                    expiresAt = expiresAtUtc,
                    user = new
                    {
                        result.Subject,
                        result.Email,
                        result.Name,
                        result.Picture
                    }
                });
            }).WithName("GoogleCallbackPost");
        }
    }

    public class GoogleAuthCallbackRequest
    {
        public string Code { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string RedirectUri { get; set; } = string.Empty;
    }
}
