using MarketIQ.Backend.Models;

namespace MarketIQ.Backend.Infrastructure
{
    public class AuthDisabledProvider : IAuthProvider
    {
        public bool IsEnabled => false;
        public string Name => "Disabled";

        public string BuildAuthorizationUrl(string redirectUri, string? state = null)
            => throw new InvalidOperationException("Authentication is disabled for the current environment.");

        public Task<AuthUserResult> ExchangeCodeAsync(string code, string redirectUri, CancellationToken cancellationToken = default)
            => throw new InvalidOperationException("Authentication is disabled for the current environment.");

        public Task<AuthUserResult> GetUserAsync(string accessToken, CancellationToken cancellationToken = default)
            => throw new InvalidOperationException("Authentication is disabled for the current environment.");
    }
}