using System.Data;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Application.Services;

public interface IStorageService
{
    Task<object> GetStorageAsync(CancellationToken ct);
}

public class StorageService(AppDbContext dbContext) : IStorageService
{
    public async Task<object> GetStorageAsync(CancellationToken ct)
    {
        var db = dbContext.Database.GetDbConnection();
        if (db.State != ConnectionState.Open)
        {
            await db.OpenAsync(ct);
        }

        long totalBytes = 0;
        await using (var cmd = db.CreateCommand())
        {
            cmd.CommandText = @"
                SELECT IFNULL(SUM(DATA_LENGTH + INDEX_LENGTH), 0)
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = DATABASE();";
            var scalar = await cmd.ExecuteScalarAsync(ct);
            totalBytes = Convert.ToInt64(scalar ?? 0);
        }

        var objectCount = await dbContext.Departments.CountAsync(ct)
                         + await dbContext.Programs.CountAsync(ct)
                         + await dbContext.Regions.CountAsync(ct)
                         + await dbContext.Schools.CountAsync(ct)
                         + await dbContext.RoleStatuses.CountAsync(ct)
                         + await dbContext.LookupOptions.CountAsync(ct)
                         + await dbContext.Users.CountAsync(ct)
                         + await dbContext.StatisticsDataRecords.CountAsync(ct)
                         + await dbContext.NationalPassingRates.CountAsync(ct);

        return new
        {
            storageSize = new { raw = totalBytes, formatted = FormatBytes(totalBytes) },
            dataSize = new { raw = totalBytes, formatted = FormatBytes(totalBytes) },
            objectCount
        };
    }

    private static string FormatBytes(long bytes)
    {
        string[] sizes = ["B", "KB", "MB", "GB", "TB"];
        double len = bytes;
        var order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }

        return $"{Math.Round(len, 2)} {sizes[order]}";
    }
}
