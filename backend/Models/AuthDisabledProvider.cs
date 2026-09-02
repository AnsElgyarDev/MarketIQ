namespace MarketIQ.Backend.Infrastructure
{
    public class AuthDisabledProvider : IAuthProvider
    {
        public bool IsEnabled => false;
        public string Name => "Disabled";
    }
}