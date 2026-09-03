using System.ComponentModel.DataAnnotations;

namespace MarketIQ.Backend.Config
{
    public class JwtSettings
    {
        [Required(AllowEmptyStrings = false)]
        public string SecretKey { get; set; } = string.Empty;

        [Required(AllowEmptyStrings = false)]
        public string Issuer { get; set; } = "MarketIQ";

        [Required(AllowEmptyStrings = false)]
        public string Audience { get; set; } = "MarketIQ-Users";

        [Range(1, int.MaxValue)]
        public int ExpiryMinutes { get; set; } = 60;
    }
}
