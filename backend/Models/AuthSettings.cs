using System.ComponentModel.DataAnnotations;

namespace MarketIQ.Backend.Config
{
    public class GoogleAuthSettings
    {
        public bool Enabled { get; set; } = false;

        [Required(AllowEmptyStrings = false)]
        public string? ClientId { get; set; }

        [Required(AllowEmptyStrings = false)]
        public string? ClientSecret { get; set; }

        public string[]? RedirectUris { get; set; }

        public string RedirectUri { get; set; } = "http://localhost:5000/api/auth/google/callback";

        public string AuthorizationEndpoint { get; set; } = "https://accounts.google.com/o/oauth2/v2/auth";
        public string TokenEndpoint { get; set; } = "https://oauth2.googleapis.com/token";
        public string UserInfoEndpoint { get; set; } = "https://openidconnect.googleapis.com/v1/userinfo";

        public string[] Scopes { get; set; } = new[] { "openid", "email", "profile" };
    }

    public class AuthSettings
    {
        public GoogleAuthSettings Google { get; set; } = new GoogleAuthSettings();
    }
}