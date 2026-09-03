namespace MarketIQ.Backend.Models
{
    public class AuthUserResult
    {
        public string Provider { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Picture { get; set; }
        public string AccessToken { get; set; } = string.Empty;
        public string? IdToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTimeOffset ExpiresAtUtc { get; set; }
    }
}
