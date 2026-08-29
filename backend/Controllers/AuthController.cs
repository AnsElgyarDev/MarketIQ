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
    private const string FrontendRoot = "http://localhost:5173";
    private const string OAuthTokensCookieName = "marketiq-oauth-tokens";

    [HttpGet("login/{provider}")]
    public IActionResult Login(string provider)
    {
        var scheme = ResolveScheme(provider);
        if (scheme is null)
        {
            return BadRequest(new { error = $"Unsupported provider '{provider}'. Supported providers are 'google' and 'tiktok'." });
        }

        var redirectUri = $"/api/auth/{provider.ToLowerInvariant()}/callback";
        return Challenge(new AuthenticationProperties { RedirectUri = redirectUri }, scheme);
    }

    [HttpGet("{provider}/callback")]
    public async Task<IActionResult> Callback(string provider)
    {
        var scheme = ResolveScheme(provider);
        if (scheme is null)
        {
            return BadRequest(new { error = $"Unsupported provider '{provider}'. Supported providers are 'google' and 'tiktok'." });
        }

        var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!result.Succeeded || result.Principal is null)
        {
            return Redirect($"{FrontendRoot}/login?auth=failed&provider={provider}");
        }

        var principal = result.Principal;
        var claims = principal.Claims.Select(c => new { type = c.Type, value = c.Value }).ToList();
        var tokenPayload = new
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
            Expires = ParseExpiry(tokenPayload.expiresAt) ?? DateTimeOffset.UtcNow.AddHours(1)
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
