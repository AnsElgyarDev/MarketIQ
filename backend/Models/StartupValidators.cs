using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MarketIQ.Backend.Config;
using System;

namespace MarketIQ.Backend.Startup
{
    public static class StartupValidators
    {
        /// <summary>
        /// Validates Google auth settings according to environment rules.
        /// - Production: if Enabled=true and missing ClientId/ClientSecret => throw ApplicationException (fail-fast)
        /// - Development: if Enabled=true and missing creds => log warning and set Enabled=false (lenient)
        /// </summary>
        public static void ValidateGoogleAuth(GoogleAuthSettings settings, IHostEnvironment env, ILogger logger)
        {
            if (settings == null) return;

            if (!settings.Enabled) return;

            var clientIdPresent = !string.IsNullOrWhiteSpace(settings.ClientId);
            var clientSecretPresent = !string.IsNullOrWhiteSpace(settings.ClientSecret);

            if (env.IsProduction())
            {
                if (!clientIdPresent || !clientSecretPresent)
                {
                    logger.LogCritical("Google auth is enabled but ClientId or ClientSecret is missing. Missing values: ClientId:{ClientIdPresent} ClientSecret:{ClientSecretPresent}", clientIdPresent, clientSecretPresent);
                    throw new ApplicationException("Missing Google auth configuration. Set Auth:Providers:Google:ClientId and ClientSecret in Production.");
                }
            }
            else
            {
                if (!clientIdPresent || !clientSecretPresent)
                {
                    logger.LogWarning("Google auth is enabled in {Environment} but credentials are missing; disabling Google auth for this run. Set Auth:Providers:Google:ClientId and ClientSecret to enable.", env.EnvironmentName);
                    // Disable for this runtime so the rest of the app can behave safely
                    settings.Enabled = false;
                }
            }
        }
    }
}
