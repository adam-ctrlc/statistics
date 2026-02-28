namespace BoardExam.Api.Infrastructure.Data;

public class DatabaseResilienceOptions
{
    public const string SectionName = "DatabaseResilience";

    public int EfMaxRetryCount { get; set; } = 5;
    public int EfMaxRetryDelaySeconds { get; set; } = 10;
    public int StartupRetryDelaySeconds { get; set; } = 5;
    public int HealthCheckIntervalSeconds { get; set; } = 30;
}
