using System.Text.Json;
using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Application.Services;

public interface IStatisticsService
{
    Task<PagedResult<object>> GetPagedAsync(StatisticsFilter filter, CancellationToken ct);
    Task<object> BuildSummaryAsync(IReadOnlyCollection<StatisticsData> items, StatisticsFilter filter, CancellationToken ct);
}

public class StatisticsService(AppDbContext dbContext) : IStatisticsService
{
    public async Task<PagedResult<object>> GetPagedAsync(StatisticsFilter filter, CancellationToken ct)
    {
        var query = ApplyFilter(dbContext.StatisticsDataRecords
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .AsQueryable(), filter);

        var total = await query.CountAsync(ct);
        var page = Math.Max(1, filter.Page);
        var limit = Math.Clamp(filter.Limit, 1, 500);
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)limit));

        var records = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync(ct);

        var shaped = records.Select(ApiShapeMapper.ToStatisticsResponse).ToList();
        var summary = await BuildSummaryAsync(records, filter, ct);

        return new PagedResult<object>
        {
            Data = shaped,
            Total = total,
            Page = page,
            TotalPages = totalPages,
            Limit = limit,
            Summary = summary
        };
    }

    public async Task<object> BuildSummaryAsync(IReadOnlyCollection<StatisticsData> items, StatisticsFilter filter, CancellationToken ct)
    {
        var totalStudents = items.Count;
        var passed = items.Count(x => string.Equals(x.Status, "pass", StringComparison.OrdinalIgnoreCase));
        var failed = items.Count(x => string.Equals(x.Status, "failed", StringComparison.OrdinalIgnoreCase) || string.Equals(x.Status, "fail", StringComparison.OrdinalIgnoreCase));
        var pending = items.Count(x => string.Equals(x.Status, "pending", StringComparison.OrdinalIgnoreCase));
        var tookExam = items.Count(x => x.TookBoardExam);
        var retakers = items.Count(x => x.Retake);
        var firstTimeTakers = items.Count - retakers;

        var firstTimePassed = items.Count(x => !x.Retake && string.Equals(x.Status, "pass", StringComparison.OrdinalIgnoreCase));
        var retakerPassed = items.Count(x => x.Retake && string.Equals(x.Status, "pass", StringComparison.OrdinalIgnoreCase));

        var maleCount = items.Count(x => string.Equals(x.Gender, "male", StringComparison.OrdinalIgnoreCase));
        var femaleCount = items.Count(x => string.Equals(x.Gender, "female", StringComparison.OrdinalIgnoreCase));
        var otherCount = totalStudents - maleCount - femaleCount;

        var topPrograms = items
            .GroupBy(x => new { x.ProgramId, Name = x.Program?.Program ?? "Unknown" })
            .Select(g => new
            {
                program_id = g.Key.ProgramId,
                program_name = g.Key.Name,
                total_students = g.Count(),
                passed_students = g.Count(x => string.Equals(x.Status, "pass", StringComparison.OrdinalIgnoreCase)),
                passing_rate = g.Count() == 0 ? 0 : Math.Round(g.Count(x => string.Equals(x.Status, "pass", StringComparison.OrdinalIgnoreCase)) * 100.0 / g.Count(), 2)
            })
            .OrderByDescending(x => x.total_students)
            .Take(5)
            .ToList();

        string programName = "All Programs";
        if (filter.ProgramId is { Count: 1 })
        {
            var program = await dbContext.Programs.FirstOrDefaultAsync(x => x.Id == filter.ProgramId[0], ct);
            if (program is not null)
            {
                programName = program.Program;
            }
        }

        string schoolName = "All Schools";
        if (filter.SchoolId is { Count: 1 })
        {
            var school = await dbContext.Schools.FirstOrDefaultAsync(x => x.Id == filter.SchoolId[0], ct);
            if (school is not null)
            {
                schoolName = school.SchoolName;
            }
        }

        var recentStudents = items
            .OrderByDescending(x => x.CreatedAt)
            .Take(10)
            .Select(x => new
            {
                _id = x.Id,
                last_name = x.LastName,
                first_name = x.FirstName,
                middle_name = x.MiddleName,
                program_name = x.Program?.Program ?? "Unknown",
                school_name = x.School?.SchoolName ?? "Unknown",
                status = x.Status
            })
            .ToList();

        object GenderNode(int count)
            => new
            {
                count,
                percentage = totalStudents == 0 ? 0 : Math.Round(count * 100.0 / totalStudents, 2)
            };

        return new
        {
            total_students = totalStudents,
            passed_students = passed,
            failed_students = failed,
            pending_students = pending,
            overall_passing_rate = totalStudents == 0 ? 0 : Math.Round(passed * 100.0 / totalStudents, 2),
            took_exam_students = tookExam,
            first_time_takers = firstTimeTakers,
            first_time_pass_rate = firstTimeTakers == 0 ? 0 : Math.Round(firstTimePassed * 100.0 / firstTimeTakers, 2),
            retakers = retakers,
            retaker_pass_rate = retakers == 0 ? 0 : Math.Round(retakerPassed * 100.0 / retakers, 2),
            gender = new
            {
                male = GenderNode(maleCount),
                female = GenderNode(femaleCount),
                other = GenderNode(otherCount)
            },
            statusCounts = new
            {
                pass = passed,
                failed,
                pending
            },
            genderCounts = new
            {
                male = maleCount,
                female = femaleCount,
                other = otherCount
            },
            topPrograms = topPrograms,
            recent_students = recentStudents,
            program_name = programName,
            school_name = schoolName
        };
    }

    private static IQueryable<StatisticsData> ApplyFilter(IQueryable<StatisticsData> query, StatisticsFilter filter)
    {
        if (filter.ProgramId is { Count: > 0 })
        {
            query = query.Where(x => filter.ProgramId.Contains(x.ProgramId));
        }

        if (filter.SchoolId is { Count: > 0 })
        {
            query = query.Where(x => filter.SchoolId.Contains(x.SchoolId));
        }

        if (filter.Year is { Count: > 0 })
        {
            query = query.Where(x => x.ExamYearTaken != null && filter.Year.Contains(x.ExamYearTaken));
        }

        if (!string.IsNullOrWhiteSpace(filter.GenderFilter) && !string.Equals(filter.GenderFilter, "all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.Gender == filter.GenderFilter);
        }

        if (!string.IsNullOrWhiteSpace(filter.ExamStatusFilter) && !string.Equals(filter.ExamStatusFilter, "all", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.Status == filter.ExamStatusFilter);
        }

        if (!string.IsNullOrWhiteSpace(filter.RetakeFilter) && !string.Equals(filter.RetakeFilter, "all", StringComparison.OrdinalIgnoreCase))
        {
            var retake = string.Equals(filter.RetakeFilter, "yes", StringComparison.OrdinalIgnoreCase) || string.Equals(filter.RetakeFilter, "true", StringComparison.OrdinalIgnoreCase);
            query = query.Where(x => x.Retake == retake);
        }

        if (!string.IsNullOrWhiteSpace(filter.TookExamFilter) && !string.Equals(filter.TookExamFilter, "all", StringComparison.OrdinalIgnoreCase))
        {
            var took = string.Equals(filter.TookExamFilter, "yes", StringComparison.OrdinalIgnoreCase) || string.Equals(filter.TookExamFilter, "true", StringComparison.OrdinalIgnoreCase);
            query = query.Where(x => x.TookBoardExam == took);
        }

        if (!string.IsNullOrWhiteSpace(filter.GlobalFilter))
        {
            var term = filter.GlobalFilter.Trim().ToLowerInvariant();
            query = query.Where(x =>
                x.LastName.ToLower().Contains(term)
                || x.FirstName.ToLower().Contains(term)
                || (x.MiddleName != null && x.MiddleName.ToLower().Contains(term))
                || x.Gender.ToLower().Contains(term)
                || x.Status.ToLower().Contains(term)
                || (x.ExamMonthTaken != null && x.ExamMonthTaken.ToLower().Contains(term))
                || (x.ExamYearTaken != null && x.ExamYearTaken.ToLower().Contains(term)));
        }

        return query;
    }
}
