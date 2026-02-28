using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BoardExam.Api.Infrastructure.Data;

public class DatabaseSelfHealingHostedService(
    IServiceScopeFactory scopeFactory,
    IOptions<DatabaseResilienceOptions> options,
    ILogger<DatabaseSelfHealingHostedService> logger) : BackgroundService
{
    private readonly DatabaseResilienceOptions _options = options.Value;
    private bool _initialized;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var retryDelay = TimeSpan.FromSeconds(Math.Max(1, _options.StartupRetryDelaySeconds));
        var healthInterval = TimeSpan.FromSeconds(Math.Max(5, _options.HealthCheckIntervalSeconds));

        while (!stoppingToken.IsCancellationRequested)
        {
            if (!_initialized)
            {
                _initialized = await TryInitializeAsync(stoppingToken);
                if (!_initialized)
                {
                    logger.LogWarning("Database initialization failed. Retrying in {DelaySeconds}s...", retryDelay.TotalSeconds);
                    await Task.Delay(retryDelay, stoppingToken);
                }

                continue;
            }

            var isHealthy = await CheckHealthAsync(stoppingToken);
            if (!isHealthy)
            {
                logger.LogWarning("Database health-check failed. Switching to self-heal mode.");
                _initialized = false;
                continue;
            }

            await Task.Delay(healthInterval, stoppingToken);
        }
    }

    private async Task<bool> TryInitializeAsync(CancellationToken ct)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var seeder = scope.ServiceProvider.GetRequiredService<IAppDbSeeder>();

            var strategy = db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                await db.Database.EnsureCreatedAsync(ct);
                await seeder.SeedAsync(ct);
            });

            logger.LogInformation("Database is ready and seed completed.");
            return true;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database initialization attempt failed.");
            return false;
        }
    }

    private async Task<bool> CheckHealthAsync(CancellationToken ct)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            return await db.Database.CanConnectAsync(ct);
        }
        catch
        {
            return false;
        }
    }
}
