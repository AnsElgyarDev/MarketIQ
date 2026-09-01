using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;

namespace MarketIQ.Backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private static string FrontendRoot => Environment.GetEnvironmentVariable("FRONTEND_BASE_URL") ?? "http://localhost:5173";
    private const string OAuthTokensCookieName = "marketiq-oauth-tokens";

    [HttpGet("login/{provider}")]
    public async Task<IActionResult> Login(string provider)
    {
        // Development fake auth: directly sign in a test user when provider == "dev"
        if (provider.Equals("dev", StringComparison.OrdinalIgnoreCase))
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "dev-user-1"),
                new Claim(ClaimTypes.Name, "Developer Test User"),
                new Claim(ClaimTypes.Email, "dev@example.local"),
                new Claim("provider", "dev")
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                IssuedUtc = DateTimeOffset.UtcNow
            };

            // Sign in the developer principal into the cookie authentication scheme
            await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, authProperties);

            // Build a lightweight token payload for frontend consumption (dev-only)
            var tokenPayload = new
            {
                provider = "dev",
                accessToken = "dev-token",
                refreshToken = (string?)null,
                idToken = (string?)null,
                expiresAt = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds(),
                tokenType = "Bearer",
                issuedAt = DateTimeOffset.UtcNow.ToString("O"),
                user = new
                {
                    id = principal.FindFirstValue(ClaimTypes.NameIdentifier),
                    name = principal.FindFirstValue(ClaimTypes.Name),
                    email = principal.FindFirstValue(ClaimTypes.Email)
                }
            };

            // Set the same OAuth tokens cookie the real callbacks use so the frontend can read the dev session
            Response.Cookies.Append(OAuthTokensCookieName, JsonSerializer.Serialize(tokenPayload), new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Secure = Request.IsHttps,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });

            // Redirect directly to the frontend dashboard with success query params
            return Redirect($"{FrontendRoot}/dashboard?auth=success&provider=dev");
        }

        var scheme = ResolveScheme(provider);
        if (scheme is null)
        {
            return BadRequest(new { error = $"Unsupported provider '{provider}'. Supported providers are 'google' and 'tiktok'." });
        }

        var redirectUriFallback = $"/api/auth/{provider.ToLowerInvariant()}/callback";
        return Challenge(new AuthenticationProperties { RedirectUri = redirectUriFallback }, scheme);
    }

    [HttpGet("{provider}/callback")]
    public async Task<IActionResult> Callback(string provider)
    {
        if (provider.Equals("dev", StringComparison.OrdinalIgnoreCase))
        {
            var devResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!devResult.Succeeded || devResult.Principal is null)
            {
                return Redirect($"{FrontendRoot}/login?auth=failed&provider={provider}");
            }

            var principal = devResult.Principal;
            var claims = principal.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList();
            var tokenPayload = new
            {
                provider,
                accessToken = "dev-token",
                refreshToken = (string?)null,
                idToken = (string?)null,
                expiresAt = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds(),
                tokenType = "Bearer",
                issuedAt = DateTimeOffset.UtcNow.ToString("O"),
                user = new
                {
                    id = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub"),
                    name = principal.FindFirstValue(ClaimTypes.Name),
                    email = principal.FindFirstValue(ClaimTypes.Email),
                    claims
                }
            };

            Response.Cookies.Append(OAuthTokensCookieName, JsonSerializer.Serialize(tokenPayload), new CookieOptions
            {
                HttpOnly = true,
                SameSite = SameSiteMode.Lax,
                Secure = Request.IsHttps,
                Path = "/",
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });

            return Redirect($"{FrontendRoot}/dashboard?auth=success&provider={provider}");
        }

        var scheme = ResolveScheme(provider);
        if (scheme is null)
        {
            return BadRequest(new { error = $"Unsupported provider '{provider}'. Supported providers are 'google' and 'tiktok'." });
        }

        var authResult = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!authResult.Succeeded || authResult.Principal is null)
        {
            return Redirect($"{FrontendRoot}/login?auth=failed&provider={provider}");
        }

        var result = authResult;
        var principalFromCookie = result.Principal;
        var claimsFromCookie = principalFromCookie.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList();
        var tokenPayloadFromCookie = new
        {
            provider,
            accessToken = result.Properties?.GetTokenValue("access_token"),
            refreshToken = result.Properties?.GetTokenValue("refresh_token"),
            idToken = result.Properties?.GetTokenValue("id_token"),
            expiresAt = result.Properties?.GetTokenValue("expires_at"),
            tokenType = result.Properties?.GetTokenValue("token_type"),
            issuedAt = result.Properties?.GetTokenValue(".expires"),
            user = new
            {
                id = principalFromCookie.FindFirstValue(ClaimTypes.NameIdentifier) ?? principalFromCookie.FindFirstValue("sub"),
                name = principalFromCookie.FindFirstValue(ClaimTypes.Name),
                email = principalFromCookie.FindFirstValue(ClaimTypes.Email),
                claims = claimsFromCookie
            }
        };

        Response.Cookies.Append(OAuthTokensCookieName, JsonSerializer.Serialize(tokenPayloadFromCookie), new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = Request.IsHttps,
            Path = "/",
            Expires = ParseExpiry(tokenPayloadFromCookie.expiresAt) ?? DateTimeOffset.UtcNow.AddHours(1)
        });

        return Redirect($"{FrontendRoot}/dashboard?auth=success&provider={provider}");
    }

    [HttpGet("me")]
    [HttpGet("status")]
    public async Task<IActionResult> Me()
    {
        var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!result.Succeeded || result.Principal is null)
        {
            return Unauthorized(new { authenticated = false });
        }

        var principal = result.Principal;
        return Ok(new
        {
            authenticated = true,
            provider = principal.FindFirstValue("provider"),
            user = new
            {
                id = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub"),
                name = principal.FindFirstValue(ClaimTypes.Name),
                email = principal.FindFirstValue(ClaimTypes.Email)
            }
        });
    }

    [HttpGet("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(OAuthTokensCookieName, new CookieOptions { Path = "/", SameSite = SameSiteMode.Lax });
        return SignOut(new AuthenticationProperties { RedirectUri = $"{FrontendRoot}/" }, CookieAuthenticationDefaults.AuthenticationScheme);
    }

    private static string? ResolveScheme(string provider)
    {
        return provider.ToLowerInvariant() switch
        {
            "google" => GoogleDefaults.AuthenticationScheme,
            "tiktok" => "TikTok",
            "dev" => CookieAuthenticationDefaults.AuthenticationScheme,
            _ => null
        };
    }

    private static DateTimeOffset? ParseExpiry(string? rawValue)
    {
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return null;
        }

        if (long.TryParse(rawValue, out var unixSeconds))
        {
            return DateTimeOffset.FromUnixTimeSeconds(unixSeconds);
        }

        if (DateTimeOffset.TryParse(rawValue, out var dto))
        {
            return dto;
        }

        return null;
    }
}
