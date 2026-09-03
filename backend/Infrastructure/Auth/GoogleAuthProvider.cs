using System.Net.Http.Headers;
using System.Text.Json;
using MarketIQ.Backend.Config;
using MarketIQ.Backend.Models;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace MarketIQ.Backend.Infrastructure.Auth
{
    public class GoogleAuthProvider : IAuthProvider
    {
        private readonly GoogleAuthSettings _settings;
        private readonly HttpClient _httpClient;
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        public GoogleAuthProvider(IOptions<GoogleAuthSettings> settings, HttpClient httpClient)
        {
            _settings = settings.Value;
            _httpClient = httpClient;
        }

        public bool IsEnabled => _settings.Enabled;
        public string Name => "Google";

        public string BuildAuthorizationUrl(string redirectUri, string? state = null)
        {
            if (!_settings.Enabled)
            {
                throw new InvalidOperationException("Google auth is disabled.");
            }

            var resolvedRedirectUri = ResolveRedirectUri(redirectUri);
            var resolvedState = string.IsNullOrWhiteSpace(state) ? Guid.NewGuid().ToString("N") : state;

            var query = new Dictionary<string, string?>
            {
                ["client_id"] = _settings.ClientId,
                ["redirect_uri"] = resolvedRedirectUri,
                ["response_type"] = "code",
                ["scope"] = string.Join(" ", _settings.Scopes ?? new[] { "openid", "email", "profile" }),
                ["access_type"] = "offline",
                ["prompt"] = "consent",
                ["state"] = resolvedState
            };

            return QueryHelpers.AddQueryString(_settings.AuthorizationEndpoint, query);
        }

        public async Task<AuthUserResult> ExchangeCodeAsync(string code, string redirectUri, CancellationToken cancellationToken = default)
        {
            if (!_settings.Enabled)
            {
                throw new InvalidOperationException("Google auth is disabled.");
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                throw new ArgumentException("Authorization code is required.", nameof(code));
            }

            var resolvedRedirectUri = ResolveRedirectUri(redirectUri);
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = _settings.ClientId!,
                ["client_secret"] = _settings.ClientSecret!,
                ["redirect_uri"] = resolvedRedirectUri,
                ["grant_type"] = "authorization_code"
            });

            using var request = new HttpRequestMessage(HttpMethod.Post, _settings.TokenEndpoint)
            {
                Content = content
            };

            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseContentRead, cancellationToken);
            var payload = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"Google token exchange failed: {payload}");
            }

            var tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(payload, JsonOptions);
            if (tokenResponse == null || string.IsNullOrWhiteSpace(tokenResponse.AccessToken))
            {
                throw new InvalidOperationException("Google token exchange did not return an access token.");
            }

            var userResult = await GetUserAsync(tokenResponse.AccessToken, cancellationToken);
            userResult.AccessToken = tokenResponse.AccessToken;
            userResult.IdToken = tokenResponse.IdToken;
            userResult.RefreshToken = tokenResponse.RefreshToken;
            userResult.ExpiresAtUtc = DateTimeOffset.UtcNow.AddSeconds(tokenResponse.ExpiresIn > 0 ? tokenResponse.ExpiresIn : 3600);

            return userResult;
        }

        public async Task<AuthUserResult> GetUserAsync(string accessToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
            {
                throw new ArgumentException("Access token is required.", nameof(accessToken));
            }

            using var request = new HttpRequestMessage(HttpMethod.Get, _settings.UserInfoEndpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseContentRead, cancellationToken);
            var payload = await response.Content.ReadAsStringAsync(cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                throw new InvalidOperationException($"Google user-info validation failed: {payload}");
            }

            var userInfo = JsonSerializer.Deserialize<GoogleUserInfo>(payload, JsonOptions);
            if (userInfo == null || string.IsNullOrWhiteSpace(userInfo.Email))
            {
                throw new InvalidOperationException("Google user-info response was missing an email claim.");
            }

            return new AuthUserResult
            {
                Provider = Name,
                Subject = userInfo.Sub,
                Email = userInfo.Email,
                Name = userInfo.Name,
                Picture = userInfo.Picture,
                AccessToken = accessToken
            };
        }

        private string ResolveRedirectUri(string? redirectUri)
        {
            if (!string.IsNullOrWhiteSpace(redirectUri))
            {
                return redirectUri;
            }

            if (_settings.RedirectUris != null && _settings.RedirectUris.Length > 0)
            {
                return _settings.RedirectUris[0];
            }

            return _settings.RedirectUri;
        }
    }

    internal class GoogleTokenResponse
    {
        [System.Text.Json.Serialization.JsonPropertyName("access_token")]
        public string AccessToken { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonPropertyName("refresh_token")]
        public string? RefreshToken { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("id_token")]
        public string? IdToken { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [System.Text.Json.Serialization.JsonPropertyName("token_type")]
        public string TokenType { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonPropertyName("scope")]
        public string? Scope { get; set; }
    }

    internal class GoogleUserInfo
    {
        [System.Text.Json.Serialization.JsonPropertyName("sub")]
        public string Sub { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [System.Text.Json.Serialization.JsonPropertyName("picture")]
        public string? Picture { get; set; }
    }
}
