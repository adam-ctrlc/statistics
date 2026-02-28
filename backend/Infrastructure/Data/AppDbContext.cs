using BoardExam.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<School> Schools => Set<School>();
    public DbSet<ProgramEntity> Programs => Set<ProgramEntity>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<RoleStatus> RoleStatuses => Set<RoleStatus>();
    public DbSet<LookupOption> LookupOptions => Set<LookupOption>();
    public DbSet<StatisticsData> StatisticsDataRecords => Set<StatisticsData>();
    public DbSet<NationalPassingRate> NationalPassingRates => Set<NationalPassingRate>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureDepartment(modelBuilder.Entity<Department>());
        ConfigureRegion(modelBuilder.Entity<Region>());
        ConfigureRoleStatus(modelBuilder.Entity<RoleStatus>());
        ConfigureLookupOption(modelBuilder.Entity<LookupOption>());
        ConfigureProgram(modelBuilder.Entity<ProgramEntity>());
        ConfigureSchool(modelBuilder.Entity<School>());
        ConfigureUser(modelBuilder.Entity<User>());
        ConfigureStatisticsData(modelBuilder.Entity<StatisticsData>());
        ConfigureNationalPassingRate(modelBuilder.Entity<NationalPassingRate>());
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var softDeleteEntries = ChangeTracker
            .Entries<SoftDeletableEntity>()
            .Where(e => e.State == EntityState.Deleted);

        foreach (var entry in softDeleteEntries)
        {
            entry.State = EntityState.Modified;
            entry.Entity.IsDeleted = true;
            entry.Entity.DeletedAt = DateTime.UtcNow;
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        var timestampEntries = ChangeTracker
            .Entries<TimestampedEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in timestampEntries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    private static void ConfigureBase<TEntity>(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<TEntity> entity)
        where TEntity : TimestampedEntity
    {
        entity.HasKey(e => e.Id);
        entity.Property(e => e.Id).HasColumnName("_id").HasMaxLength(32);
        entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
    }

    private static void ConfigureSoftDelete<TEntity>(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<TEntity> entity)
        where TEntity : SoftDeletableEntity
    {
        entity.Property(e => e.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
        entity.Property(e => e.DeletedAt).HasColumnName("deleted_at");
        entity.HasQueryFilter(e => !e.IsDeleted);
    }

    private static void ConfigureDepartment(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<Department> entity)
    {
        entity.ToTable("departments");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        entity.HasIndex(x => x.Name).IsUnique();
    }

    private static void ConfigureRegion(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<Region> entity)
    {
        entity.ToTable("regions");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        entity.HasIndex(x => x.Name).IsUnique();
    }

    private static void ConfigureRoleStatus(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<RoleStatus> entity)
    {
        entity.ToTable("role_status");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.Role).HasColumnName("role").HasMaxLength(50).IsRequired();
        entity.HasIndex(x => x.Role).IsUnique();
    }

    private static void ConfigureProgram(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<ProgramEntity> entity)
    {
        entity.ToTable("programs");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.Program).HasColumnName("program").HasMaxLength(100).IsRequired();
        entity.Property(x => x.DepartmentId).HasColumnName("department_id").HasMaxLength(32).IsRequired();
        entity.HasIndex(x => x.Program).IsUnique();

        entity.HasOne(x => x.Department)
            .WithMany(x => x.Programs)
            .HasForeignKey(x => x.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureLookupOption(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<LookupOption> entity)
    {
        entity.ToTable("lookup_options");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.Category).HasColumnName("category").HasMaxLength(100).IsRequired();
        entity.Property(x => x.Value).HasColumnName("value").HasMaxLength(100).IsRequired();
        entity.Property(x => x.IsSystem).HasColumnName("is_system").HasDefaultValue(false);

        entity.HasIndex(x => new { x.Category, x.Value }).IsUnique();
    }

    private static void ConfigureSchool(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<School> entity)
    {
        entity.ToTable("schools");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.SchoolName).HasColumnName("school").HasMaxLength(100).IsRequired();
        entity.Property(x => x.RegionId).HasColumnName("region_id").HasMaxLength(32).IsRequired();
        entity.Property(x => x.IsPhinma).HasColumnName("is_phinma").HasDefaultValue(false);
        entity.HasIndex(x => x.SchoolName).IsUnique();

        entity.HasOne(x => x.Region)
            .WithMany(x => x.Schools)
            .HasForeignKey(x => x.RegionId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureUser(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<User> entity)
    {
        entity.ToTable("users");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.LastName).HasColumnName("last_name").HasMaxLength(50).IsRequired();
        entity.Property(x => x.FirstName).HasColumnName("first_name").HasMaxLength(50).IsRequired();
        entity.Property(x => x.MiddleName).HasColumnName("middle_name").HasMaxLength(50);
        entity.Property(x => x.SchoolId).HasColumnName("school_id").HasMaxLength(32).IsRequired();
        entity.Property(x => x.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
        entity.Property(x => x.PasswordHashed).HasColumnName("password_hashed").IsRequired();
        entity.Property(x => x.Gender).HasColumnName("gender").HasMaxLength(10).IsRequired();
        entity.Property(x => x.ProgramId).HasColumnName("program_id").HasMaxLength(32).IsRequired();
        entity.Property(x => x.ModifyAccess).HasColumnName("modify_access").HasDefaultValue(false);
        entity.Property(x => x.RoleId).HasColumnName("role_id").HasMaxLength(32).IsRequired();
        entity.Property(x => x.Status).HasColumnName("status").HasMaxLength(15).HasDefaultValue("inactive").IsRequired();
        entity.HasIndex(x => x.Username).IsUnique();

        entity.HasOne(x => x.School)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.SchoolId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.Program)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.Role)
            .WithMany(x => x.Users)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureStatisticsData(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<StatisticsData> entity)
    {
        entity.ToTable("statistics_data");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.LastName).HasColumnName("last_name").IsRequired();
        entity.Property(x => x.FirstName).HasColumnName("first_name").IsRequired();
        entity.Property(x => x.MiddleName).HasColumnName("middle_name");
        entity.Property(x => x.SchoolId).HasColumnName("school_id").HasMaxLength(32).IsRequired();
        entity.Property(x => x.Gender).HasColumnName("gender").IsRequired();
        entity.Property(x => x.ProgramId).HasColumnName("program_id").HasMaxLength(32).IsRequired();
        entity.Property(x => x.TookBoardExam).HasColumnName("took_board_exam").HasDefaultValue(false);
        entity.Property(x => x.ExamMonthTaken).HasColumnName("exam_month_taken");
        entity.Property(x => x.ExamYearTaken).HasColumnName("exam_year_taken");
        entity.Property(x => x.Status).HasColumnName("status").HasDefaultValue("Pending");
        entity.Property(x => x.Retake).HasColumnName("retake").HasDefaultValue(false);
        entity.Property(x => x.RetakeTimes).HasColumnName("retake_times").HasDefaultValue(0);

        entity.HasIndex(x => new
        {
            x.LastName,
            x.FirstName,
            x.MiddleName,
            x.SchoolId,
            x.Gender,
            x.ProgramId,
            x.TookBoardExam,
            x.ExamMonthTaken,
            x.ExamYearTaken,
            x.Status,
            x.Retake,
            x.RetakeTimes
        }).IsUnique();

        entity.HasOne(x => x.School)
            .WithMany(x => x.StatisticsDataRecords)
            .HasForeignKey(x => x.SchoolId)
            .OnDelete(DeleteBehavior.Restrict);

        entity.HasOne(x => x.Program)
            .WithMany(x => x.StatisticsDataRecords)
            .HasForeignKey(x => x.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private static void ConfigureNationalPassingRate(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<NationalPassingRate> entity)
    {
        entity.ToTable("national_passing_rate");
        ConfigureBase(entity);
        ConfigureSoftDelete(entity);

        entity.Property(x => x.Month).HasColumnName("month").HasMaxLength(20).IsRequired();
        entity.Property(x => x.Year).HasColumnName("year").HasMaxLength(4).IsRequired();
        entity.Property(x => x.PassingRate).HasColumnName("passing_rate").HasPrecision(5, 2).IsRequired();
        entity.Property(x => x.ProgramId).HasColumnName("program_id").HasMaxLength(32).IsRequired();

        entity.HasIndex(x => new { x.Month, x.Year, x.ProgramId }).IsUnique();

        entity.HasOne(x => x.Program)
            .WithMany(x => x.NationalPassingRates)
            .HasForeignKey(x => x.ProgramId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
