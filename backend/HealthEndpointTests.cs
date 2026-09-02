using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace MarketIQ.Backend.Tests
{
    public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public HealthEndpointTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Readiness_ReturnsOk_When_NoEnabledProviders()
        {
            var client = _factory.WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment(Environments.Development);
                // no extra config -> default google disabled
            }).CreateClient();

            var resp = await client.GetAsync("/health/ready");
            Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        }
    }
}
