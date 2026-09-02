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
    }

    public class AuthSettings
    {
        public GoogleAuthSettings Google { get; set; } = new GoogleAuthSettings();
    }
}