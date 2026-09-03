using MarketIQ.Backend.Models;

namespace MarketIQ.Backend.Infrastructure.Auth
{
    public interface IJwtTokenService
    {
        string GenerateToken(AuthUserResult user);
    }
}
