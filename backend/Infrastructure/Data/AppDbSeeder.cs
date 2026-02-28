using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Infrastructure.Data;

public interface IAppDbSeeder
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}

public class AppDbSeeder(
    AppDbContext dbContext,
    IPasswordHasher passwordHasher,
    ILogger<AppDbSeeder> logger) : IAppDbSeeder
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await EnsureLookupAsync("user_status", "active", true, cancellationToken);
        await EnsureLookupAsync("user_status", "inactive", true, cancellationToken);
        await EnsureLookupAsync("user_status", "pending", true, cancellationToken);
        await EnsureLookupAsync("gender", "Male", true, cancellationToken);
        await EnsureLookupAsync("gender", "Female", true, cancellationToken);
        await EnsureLookupAsync("exam_status", "Pass", true, cancellationToken);
        await EnsureLookupAsync("exam_status", "Failed", true, cancellationToken);
        await EnsureLookupAsync("exam_status", "Pending", true, cancellationToken);
        await EnsureLookupAsync("role", "admin", true, cancellationToken);
        await EnsureLookupAsync("role", "editor", false, cancellationToken);
        await EnsureLookupAsync("role", "viewer", false, cancellationToken);

        var adminRole = await EnsureRoleAsync("admin", cancellationToken);
        var editorRole = await EnsureRoleAsync("editor", cancellationToken);
        var viewerRole = await EnsureRoleAsync("viewer", cancellationToken);

        var engineering = await EnsureDepartmentAsync("Engineering", cancellationToken);
        var architecture = await EnsureDepartmentAsync("Architecture", cancellationToken);

        var civilProgram = await EnsureProgramAsync("BS Civil Engineering", engineering.Id, cancellationToken);
        var architectureProgram = await EnsureProgramAsync("BS Architecture", architecture.Id, cancellationToken);
        var eceProgram = await EnsureProgramAsync("BS Electronics Engineering", engineering.Id, cancellationToken);

        var regionX = await EnsureRegionAsync("Region X", cancellationToken);
        var regionXI = await EnsureRegionAsync("Region XI", cancellationToken);

        var coc = await EnsureSchoolAsync("PHINMA COC - CEA", regionX.Id, true, cancellationToken);
        var davao = await EnsureSchoolAsync("PHINMA Davao", regionXI.Id, true, cancellationToken);

        await EnsureUserAsync(
            username: "admin",
            password: "admin123",
            firstName: "System",
            lastName: "Administrator",
            schoolId: coc.Id,
            programId: civilProgram.Id,
            roleId: adminRole.Id,
            modifyAccess: true,
            status: "active",
            cancellationToken);

        await EnsureUserAsync(
            username: "editor",
            password: "editor123",
            firstName: "Data",
            lastName: "Editor",
            schoolId: coc.Id,
            programId: eceProgram.Id,
            roleId: editorRole.Id,
            modifyAccess: true,
            status: "active",
            cancellationToken);

        await EnsureUserAsync(
            username: "viewer",
            password: "viewer123",
            firstName: "Read",
            lastName: "Only",
            schoolId: davao.Id,
            programId: architectureProgram.Id,
            roleId: viewerRole.Id,
            modifyAccess: false,
            status: "active",
            cancellationToken);

        await EnsureNationalRateAsync("June", "2024", 52.40m, civilProgram.Id, cancellationToken);
        await EnsureNationalRateAsync("June", "2024", 61.75m, architectureProgram.Id, cancellationToken);
        await EnsureNationalRateAsync("April", "2025", 57.30m, eceProgram.Id, cancellationToken);

        await EnsureStatisticsSeedAsync(new[] { coc.Id, davao.Id }, new[] { civilProgram.Id, architectureProgram.Id, eceProgram.Id }, cancellationToken);

        logger.LogInformation("Seed completed. Default users: admin/admin123, editor/editor123, viewer/viewer123");
    }

    private async Task<RoleStatus> EnsureRoleAsync(string role, CancellationToken ct)
    {
        var entity = await dbContext.RoleStatuses.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Role == role, ct);
        if (entity is null)
        {
            entity = new RoleStatus { Role = role };
            dbContext.RoleStatuses.Add(entity);
            await dbContext.SaveChangesAsync(ct);
            return entity;
        }

        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
            await dbContext.SaveChangesAsync(ct);
        }

        return entity;
    }

    private async Task<Department> EnsureDepartmentAsync(string name, CancellationToken ct)
    {
        var entity = await dbContext.Departments.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Name == name, ct);
        if (entity is null)
        {
            entity = new Department { Name = name };
            dbContext.Departments.Add(entity);
            await dbContext.SaveChangesAsync(ct);
            return entity;
        }

        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
            await dbContext.SaveChangesAsync(ct);
        }

        return entity;
    }

    private async Task<ProgramEntity> EnsureProgramAsync(string name, string departmentId, CancellationToken ct)
    {
        var entity = await dbContext.Programs.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Program == name, ct);
        if (entity is null)
        {
            entity = new ProgramEntity { Program = name, DepartmentId = departmentId };
            dbContext.Programs.Add(entity);
            await dbContext.SaveChangesAsync(ct);
            return entity;
        }

        entity.DepartmentId = departmentId;
        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
        }

        await dbContext.SaveChangesAsync(ct);
        return entity;
    }

    private async Task<Region> EnsureRegionAsync(string name, CancellationToken ct)
    {
        var entity = await dbContext.Regions.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Name == name, ct);
        if (entity is null)
        {
            entity = new Region { Name = name };
            dbContext.Regions.Add(entity);
            await dbContext.SaveChangesAsync(ct);
            return entity;
        }

        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
            await dbContext.SaveChangesAsync(ct);
        }

        return entity;
    }

    private async Task<School> EnsureSchoolAsync(string schoolName, string regionId, bool isPhinma, CancellationToken ct)
    {
        var entity = await dbContext.Schools.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.SchoolName == schoolName, ct);
        if (entity is null)
        {
            entity = new School { SchoolName = schoolName, RegionId = regionId, IsPhinma = isPhinma };
            dbContext.Schools.Add(entity);
            await dbContext.SaveChangesAsync(ct);
            return entity;
        }

        entity.RegionId = regionId;
        entity.IsPhinma = isPhinma;
        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
        }

        await dbContext.SaveChangesAsync(ct);
        return entity;
    }

    private async Task<User> EnsureUserAsync(
        string username,
        string password,
        string firstName,
        string lastName,
        string schoolId,
        string programId,
        string roleId,
        bool modifyAccess,
        string status,
        CancellationToken ct)
    {
        var entity = await dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Username == username, ct);
        if (entity is null)
        {
            entity = new User
            {
                Username = username,
                PasswordHashed = passwordHasher.Hash(password),
                FirstName = firstName,
                LastName = lastName,
                Gender = "Male",
                SchoolId = schoolId,
                ProgramId = programId,
                RoleId = roleId,
                ModifyAccess = modifyAccess,
                Status = status
            };
            dbContext.Users.Add(entity);
            await dbContext.SaveChangesAsync(ct);
            return entity;
        }

        entity.FirstName = firstName;
        entity.LastName = lastName;
        entity.SchoolId = schoolId;
        entity.ProgramId = programId;
        entity.RoleId = roleId;
        entity.ModifyAccess = modifyAccess;
        entity.Status = status;
        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
        }

        await dbContext.SaveChangesAsync(ct);
        return entity;
    }

    private async Task EnsureNationalRateAsync(string month, string year, decimal rate, string programId, CancellationToken ct)
    {
        var entity = await dbContext.NationalPassingRates.IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Month == month && x.Year == year && x.ProgramId == programId, ct);

        if (entity is null)
        {
            dbContext.NationalPassingRates.Add(new NationalPassingRate
            {
                Month = month,
                Year = year,
                PassingRate = rate,
                ProgramId = programId
            });
            await dbContext.SaveChangesAsync(ct);
            return;
        }

        entity.PassingRate = rate;
        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
        }

        await dbContext.SaveChangesAsync(ct);
    }

    private async Task EnsureLookupAsync(string category, string value, bool isSystem, CancellationToken ct)
    {
        var entity = await dbContext.LookupOptions.IgnoreQueryFilters()
            .FirstOrDefaultAsync(x => x.Category == category && x.Value == value, ct);

        if (entity is null)
        {
            dbContext.LookupOptions.Add(new LookupOption
            {
                Category = category,
                Value = value,
                IsSystem = isSystem
            });
            await dbContext.SaveChangesAsync(ct);
            return;
        }

        entity.IsSystem = isSystem;
        if (entity.IsDeleted)
        {
            entity.IsDeleted = false;
            entity.DeletedAt = null;
        }

        await dbContext.SaveChangesAsync(ct);
    }

    private async Task EnsureStatisticsSeedAsync(IReadOnlyList<string> schoolIds, IReadOnlyList<string> programIds, CancellationToken ct)
    {
        var existing = await dbContext.StatisticsDataRecords.CountAsync(ct);
        if (existing >= 20)
        {
            return;
        }

        var random = new Random();
        var months = new[] { "January", "April", "June", "August", "November" };
        var genders = new[] { "Male", "Female" };
        var statuses = new[] { "Pass", "Failed", "Pending" };

        var batch = new List<StatisticsData>();
        for (var i = 1; i <= 30; i++)
        {
            var took = random.Next(0, 2) == 1;
            var retake = random.Next(0, 2) == 1;
            batch.Add(new StatisticsData
            {
                LastName = $"Student{i:000}",
                FirstName = $"Seed{i:000}",
                MiddleName = string.Empty,
                SchoolId = schoolIds[random.Next(0, schoolIds.Count)],
                Gender = genders[random.Next(0, genders.Length)],
                ProgramId = programIds[random.Next(0, programIds.Count)],
                TookBoardExam = took,
                ExamMonthTaken = took ? months[random.Next(0, months.Length)] : null,
                ExamYearTaken = took ? random.Next(2022, 2026).ToString() : null,
                Status = took ? statuses[random.Next(0, statuses.Length)] : "Pending",
                Retake = retake,
                RetakeTimes = retake ? random.Next(1, 4) : 0
            });
        }

        dbContext.StatisticsDataRecords.AddRange(batch);
        await dbContext.SaveChangesAsync(ct);
    }
}
