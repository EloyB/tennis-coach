using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Infrastructure.FeatureFlags;

public interface IFeatureFlagService
{
    bool IsEnabled(string featureName);
}

public class FeatureFlagService : IFeatureFlagService
{
    private readonly IConfiguration _configuration;
    private readonly string _environment;

    public FeatureFlagService(IConfiguration configuration, IHostEnvironment hostEnvironment)
    {
        _configuration = configuration;
        _environment = hostEnvironment.EnvironmentName;
    }

    public bool IsEnabled(string featureName)
    {
        // Check for explicit override in configuration first
        var configValue = _configuration[$"FeatureFlags:{featureName}"];
        if (!string.IsNullOrEmpty(configValue))
        {
            return bool.TryParse(configValue, out var result) && result;
        }

        // Default behavior based on environment
        // dvlp and staging: new features ON by default
        // prod: new features OFF by default
        return _environment.Equals("Development", StringComparison.OrdinalIgnoreCase) ||
               _environment.Equals("Staging", StringComparison.OrdinalIgnoreCase);
    }
}

public static class FeatureFlags
{
    public const string TrainingSessionManagement = "feature.trainingSessionManagement";
}
