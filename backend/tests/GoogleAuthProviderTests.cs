using System.Net;
using System.Text;
using FluentAssertions;
using MarketIQ.Backend.Config;
using MarketIQ.Backend.Infrastructure.Auth;
using Microsoft.Extensions.Options;
using Xunit;

namespace MarketIQ.Backend.Tests
{
    public class GoogleAuthProviderTests
    {
        [Fact]
        public void BuildAuthorizationUrl_ContainsExpectedGoogleOAuthQueryParameters()
        {
            var provider = CreateProvider();

            var url = provider.BuildAuthorizationUrl("http://localhost:5000/api/auth/google/callback");

            url.Should().StartWith("https://accounts.google.com/o/oauth2/v2/auth");
            url.Should().Contain("client_id=test-client-id");
            url.Should().Contain("redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Fapi%2Fauth%2Fgoogle%2Fcallback");
            url.Should().Contain("scope=openid%20email%20profile");
            url.Should().Contain("response_type=code");
        }

        [Fact]
        public async Task ExchangeCodeAsync_RetrievesUserProfileAndTokens()
        {
            var provider = CreateProvider(
                onTokenRequest: _ => new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("{\"access_token\":\"access-123\",\"refresh_token\":\"refresh-456\",\"id_token\":\"id-789\",\"expires_in\":3600}", Encoding.UTF8, "application/json")
                },
                onUserInfoRequest: _ => new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent("{\"sub\":\"google-user-123\",\"email\":\"alice@example.com\",\"name\":\"Alice Example\",\"picture\":\"https://example.com/alice.png\"}", Encoding.UTF8, "application/json")
                });

            var result = await provider.ExchangeCodeAsync("auth-code-123", "http://localhost:5000/api/auth/google/callback");

            result.Provider.Should().Be("Google");
            result.Email.Should().Be("alice@example.com");
            result.Name.Should().Be("Alice Example");
            result.AccessToken.Should().Be("access-123");
            result.RefreshToken.Should().Be("refresh-456");
            result.IdToken.Should().Be("id-789");
            result.ExpiresAtUtc.Should().BeCloseTo(DateTimeOffset.UtcNow.AddSeconds(3600), TimeSpan.FromMinutes(1));
        }

        private static GoogleAuthProvider CreateProvider(
            Func<HttpRequestMessage, HttpResponseMessage>? onTokenRequest = null,
            Func<HttpRequestMessage, HttpResponseMessage>? onUserInfoRequest = null)
        {
            var handler = new StubHttpMessageHandler(request =>
            {
                if (request.RequestUri != null && request.RequestUri.ToString().Contains("oauth2.googleapis.com/token"))
                {
                    return onTokenRequest?.Invoke(request) ?? new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new StringContent("{\"access_token\":\"access-123\",\"refresh_token\":\"refresh-456\",\"id_token\":\"id-789\",\"expires_in\":3600}", Encoding.UTF8, "application/json")
                    };
                }

                if (request.RequestUri != null && request.RequestUri.ToString().Contains("openidconnect.googleapis.com"))
                {
                    return onUserInfoRequest?.Invoke(request) ?? new HttpResponseMessage(HttpStatusCode.OK)
                    {
                        Content = new StringContent("{\"sub\":\"google-user-123\",\"email\":\"alice@example.com\",\"name\":\"Alice Example\",\"picture\":\"https://example.com/alice.png\"}", Encoding.UTF8, "application/json")
                    };
                }

                return new HttpResponseMessage(HttpStatusCode.NotFound);
            });

            var settings = Options.Create(new GoogleAuthSettings
            {
                Enabled = true,
                ClientId = "test-client-id",
                ClientSecret = "test-client-secret",
                RedirectUri = "http://localhost:5000/api/auth/google/callback",
                AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth",
                TokenEndpoint = "https://oauth2.googleapis.com/token",
                UserInfoEndpoint = "https://openidconnect.googleapis.com/v1/userinfo",
                Scopes = new[] { "openid", "email", "profile" }
            });

            return new GoogleAuthProvider(settings, new HttpClient(handler));
        }

        private sealed class StubHttpMessageHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, HttpResponseMessage> _responseFactory;

            public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responseFactory)
            {
                _responseFactory = responseFactory;
            }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                return Task.FromResult(_responseFactory(request));
            }
        }
    }
}
