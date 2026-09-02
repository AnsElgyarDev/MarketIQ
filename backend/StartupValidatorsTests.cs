using Xunit;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using MarketIQ.Backend.Config;
using MarketIQ.Backend.Startup;
using System;
using FluentAssertions;

namespace MarketIQ.Backend.Tests
{
    public class StartupValidatorsTests
    {
        [Fact]
        public void Dev_With_GoogleEnabled_MissingCredentials_Disables_Google()
        {
            var settings = new GoogleAuthSettings { Enabled = true, ClientId = null, ClientSecret = null };
            var env = new HostingEnvironment { EnvironmentName = Environments.Development };
            var logger = NullLogger.Instance;

            StartupValidators.ValidateGoogleAuth(settings, env, logger);

            settings.Enabled.Should().BeFalse();
        }

        [Fact]
        public void Prod_With_GoogleEnabled_MissingCredentials_Throws()
        {
            var settings = new GoogleAuthSettings { Enabled = true, ClientId = null, ClientSecret = null };
            var env = new HostingEnvironment { EnvironmentName = Environments.Production };
            var logger = NullLogger.Instance;

            Action act = () => StartupValidators.ValidateGoogleAuth(settings, env, logger);

            act.Should().Throw<ApplicationException>().WithMessage("Missing Google auth configuration.*");
        }
    }

    // Minimal hosting environment implementation for tests
    internal class HostingEnvironment : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = Environments.Production;
        public string ApplicationName { get; set; } = "MarketIQ.Tests";
        public string ContentRootPath { get; set; } = AppContext.BaseDirectory;
    }
}
