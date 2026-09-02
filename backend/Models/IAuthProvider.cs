namespace MarketIQ.Backend.Infrastructure
{
    public interface IAuthProvider
    {
        bool IsEnabled { get; }
        string Name { get; }
    }
}