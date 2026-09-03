using MarketIQ.Backend.Models;

namespace MarketIQ.Backend.Infrastructure
{
    public interface IAuthProvider
    {
        bool IsEnabled { get; }
        string Name { get; }
        string BuildAuthorizationUrl(string redirectUri, string? state = null);
        Task<AuthUserResult> ExchangeCodeAsync(string code, string redirectUri, CancellationToken cancellationToken = default);
        Task<AuthUserResult> GetUserAsync(string accessToken, CancellationToken cancellationToken = default);
    }
}