using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Application.Services;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/statistics-data")]
[Authorize]
public class StatisticsDataController(
    AppDbContext dbContext,
    IStatisticsService statisticsService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] List<string>? programId,
        [FromQuery] List<string>? schoolId,
        [FromQuery] List<string>? year,
        [FromQuery] string? genderFilter,
        [FromQuery] string? examStatusFilter,
        [FromQuery] string? retakeFilter,
        [FromQuery] string? tookExamFilter,
        [FromQuery] string? globalFilter,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        var filter = new StatisticsFilter
        {
            ProgramId = programId,
            SchoolId = schoolId,
            Year = year,
            GenderFilter = genderFilter,
            ExamStatusFilter = examStatusFilter,
            RetakeFilter = retakeFilter,
            TookExamFilter = tookExamFilter,
            GlobalFilter = globalFilter,
            Page = page,
            Limit = limit
        };

        var result = await statisticsService.GetPagedAsync(filter, ct);
        return Ok(new
        {
            data = result.Data,
            summary = result.Summary,
            total = result.Total,
            page = result.Page,
            totalPages = result.TotalPages,
            limit = result.Limit
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StatisticsUpsertRequest request, CancellationToken ct)
    {
        var validation = await ValidateUpsertRequest(request, ct);
        if (validation is not null) return validation;

        var exists = await dbContext.StatisticsDataRecords.AnyAsync(x =>
            x.LastName == request.Last_Name
            && x.FirstName == request.First_Name
            && x.MiddleName == request.Middle_Name
            && x.SchoolId == request.School_Id
            && x.Gender == request.Gender
            && x.ProgramId == request.Program_Id
            && x.TookBoardExam == request.Took_Board_Exam
            && x.ExamMonthTaken == request.Exam_Month_Taken
            && x.ExamYearTaken == request.Exam_Year_Taken
            && x.Status == (request.Status ?? "Pending")
            && x.Retake == request.Retake
            && x.RetakeTimes == request.Retake_Times,
            ct);

        if (exists) return BadRequest(new { error = "Duplicate entry" });

        var row = new StatisticsData
        {
            LastName = request.Last_Name,
            FirstName = request.First_Name,
            MiddleName = request.Middle_Name,
            SchoolId = request.School_Id,
            Gender = request.Gender,
            ProgramId = request.Program_Id,
            TookBoardExam = request.Took_Board_Exam,
            ExamMonthTaken = request.Exam_Month_Taken,
            ExamYearTaken = request.Exam_Year_Taken,
            Status = request.Status ?? "Pending",
            Retake = request.Retake,
            RetakeTimes = request.Retake_Times
        };

        dbContext.StatisticsDataRecords.Add(row);
        await dbContext.SaveChangesAsync(ct);

        var created = await dbContext.StatisticsDataRecords
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .FirstAsync(x => x.Id == row.Id, ct);

        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToStatisticsResponse(created));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var row = await dbContext.StatisticsDataRecords
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        return row is null ? NotFound(new { error = "Statistics data not found" }) : Ok(ApiShapeMapper.ToStatisticsResponse(row));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] StatisticsUpsertRequest request, CancellationToken ct)
    {
        var row = await dbContext.StatisticsDataRecords
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Statistics data not found" });

        var validation = await ValidateUpsertRequest(request, ct);
        if (validation is not null) return validation;

        row.LastName = request.Last_Name;
        row.FirstName = request.First_Name;
        row.MiddleName = request.Middle_Name;
        row.SchoolId = request.School_Id;
        row.Gender = request.Gender;
        row.ProgramId = request.Program_Id;
        row.TookBoardExam = request.Took_Board_Exam;
        row.ExamMonthTaken = request.Exam_Month_Taken;
        row.ExamYearTaken = request.Exam_Year_Taken;
        row.Status = request.Status ?? "Pending";
        row.Retake = request.Retake;
        row.RetakeTimes = request.Retake_Times;

        await dbContext.SaveChangesAsync(ct);

        row = await dbContext.StatisticsDataRecords
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .FirstAsync(x => x.Id == id, ct);
        return Ok(ApiShapeMapper.ToStatisticsResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var row = await dbContext.StatisticsDataRecords.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Statistics data not found" });

        dbContext.StatisticsDataRecords.Remove(row);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "Statistics data deleted successfully", deletedId = id });
    }

    [HttpPost("filter")]
    public async Task<IActionResult> Filter([FromBody] StatisticsFilter filter, CancellationToken ct)
    {
        var result = await statisticsService.GetPagedAsync(filter, ct);
        return Ok(new
        {
            data = result.Data,
            summary = result.Summary,
            total = result.Total,
            page = result.Page,
            totalPages = result.TotalPages,
            limit = result.Limit
        });
    }

    [HttpGet("years")]
    public async Task<IActionResult> GetYears(CancellationToken ct)
    {
        var years = await dbContext.StatisticsDataRecords
            .Where(x => x.ExamYearTaken != null && x.ExamYearTaken != "")
            .Select(x => x.ExamYearTaken!)
            .Distinct()
            .OrderByDescending(x => x)
            .ToListAsync(ct);

        return Ok(new { years });
    }

    [HttpPost("bulk-delete")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> BulkDelete([FromBody] StatisticsBulkDeleteRequest request, CancellationToken ct)
    {
        if (request.Ids is null || request.Ids.Count == 0)
        {
            return BadRequest(new { error = "ids is required" });
        }

        var rows = await dbContext.StatisticsDataRecords.Where(x => request.Ids.Contains(x.Id)).ToListAsync(ct);
        dbContext.StatisticsDataRecords.RemoveRange(rows);
        await dbContext.SaveChangesAsync(ct);

        return Ok(new { success = true, deletedCount = rows.Count });
    }

    [HttpPost("export")]
    public async Task<IActionResult> Export([FromBody] StatisticsFilter filter, CancellationToken ct)
    {
        filter.Page = 1;
        filter.Limit = 100000;
        var result = await statisticsService.GetPagedAsync(filter, ct);
        if (result.Data.Count == 0)
        {
            return NotFound(new { error = "No data found for export" });
        }

        return Ok(new { message = "Export successful", data = result.Data });
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import([FromBody] List<Dictionary<string, object?>> rows, CancellationToken ct)
    {
        if (rows.Count == 0) return BadRequest(new { error = "No rows to import" });

        var schools = await dbContext.Schools.ToListAsync(ct);
        var programs = await dbContext.Programs.ToListAsync(ct);

        var schoolByName = schools.ToDictionary(x => x.SchoolName.ToLowerInvariant(), x => x.Id);
        var programByName = programs.ToDictionary(x => x.Program.ToLowerInvariant(), x => x.Id);
        var toInsert = new List<StatisticsData>();

        foreach (var row in rows)
        {
            string ReadString(string key) => row.TryGetValue(key, out var val) ? Convert.ToString(val) ?? string.Empty : string.Empty;

            var schoolName = ReadString("school_name").ToLowerInvariant();
            var programName = ReadString("program_name").ToLowerInvariant();
            if (!schoolByName.TryGetValue(schoolName, out var schoolId)) return BadRequest(new { error = $"Unknown school: {schoolName}" });
            if (!programByName.TryGetValue(programName, out var programId)) return BadRequest(new { error = $"Unknown program: {programName}" });

            var tookExam = bool.TryParse(ReadString("took_board_exam"), out var tb) && tb;
            var retake = bool.TryParse(ReadString("retake"), out var rk) && rk;
            var retakeTimes = int.TryParse(ReadString("retake_times"), out var rt) ? rt : 0;

            toInsert.Add(new StatisticsData
            {
                LastName = ReadString("last_name"),
                FirstName = ReadString("first_name"),
                MiddleName = ReadString("middle_name"),
                SchoolId = schoolId,
                Gender = ReadString("gender"),
                ProgramId = programId,
                TookBoardExam = tookExam,
                ExamMonthTaken = ReadString("exam_month_taken"),
                ExamYearTaken = ReadString("exam_year_taken"),
                Status = string.IsNullOrWhiteSpace(ReadString("status")) ? "Pending" : ReadString("status"),
                Retake = retake,
                RetakeTimes = retakeTimes
            });
        }

        dbContext.StatisticsDataRecords.AddRange(toInsert);
        await dbContext.SaveChangesAsync(ct);
        return StatusCode(StatusCodes.Status201Created, new { message = "Import successful.", results = new { inserted = toInsert.Count } });
    }

    [HttpGet("create")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedRandom(CancellationToken ct)
    {
        var host = HttpContext.Connection.RemoteIpAddress?.ToString() ?? string.Empty;
        var local = host.Contains("127.0.0.1") || host.Contains("::1");
        if (!local) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Only localhost can call this endpoint" });

        var schools = await dbContext.Schools.ToListAsync(ct);
        var programs = await dbContext.Programs.ToListAsync(ct);
        if (schools.Count == 0 || programs.Count == 0)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { error = "No schools/programs available" });
        }

        var months = new[] { "January", "April", "June", "August", "November" };
        var statuses = new[] { "Pass", "Failed", "Pending" };
        var genders = new[] { "Male", "Female" };
        var random = new Random();

        var inserts = Enumerable.Range(1, 50).Select(_ =>
        {
            var took = random.Next(0, 2) == 1;
            return new StatisticsData
            {
                LastName = $"Last{random.Next(1000, 9999)}",
                FirstName = $"First{random.Next(1000, 9999)}",
                MiddleName = string.Empty,
                SchoolId = schools[random.Next(schools.Count)].Id,
                Gender = genders[random.Next(genders.Length)],
                ProgramId = programs[random.Next(programs.Count)].Id,
                TookBoardExam = took,
                ExamMonthTaken = took ? months[random.Next(months.Length)] : null,
                ExamYearTaken = took ? random.Next(2019, DateTime.UtcNow.Year + 1).ToString() : null,
                Status = took ? statuses[random.Next(statuses.Length)] : "Pending",
                Retake = random.Next(0, 2) == 1,
                RetakeTimes = random.Next(0, 4)
            };
        }).ToList();

        dbContext.StatisticsDataRecords.AddRange(inserts);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { insertedCount = inserts.Count, ids = inserts.Select(x => x.Id).ToList() });
    }

    private async Task<IActionResult?> ValidateUpsertRequest(StatisticsUpsertRequest request, CancellationToken ct)
    {
        var lookupOptions = dbContext.Set<LookupOption>();

        if (string.IsNullOrWhiteSpace(request.Last_Name)
            || string.IsNullOrWhiteSpace(request.First_Name)
            || string.IsNullOrWhiteSpace(request.School_Id)
            || string.IsNullOrWhiteSpace(request.Gender)
            || string.IsNullOrWhiteSpace(request.Program_Id))
        {
            return BadRequest(new { error = "Missing required fields" });
        }

        if (request.Took_Board_Exam && (string.IsNullOrWhiteSpace(request.Exam_Month_Taken) || string.IsNullOrWhiteSpace(request.Exam_Year_Taken) || string.IsNullOrWhiteSpace(request.Status)))
        {
            return BadRequest(new { error = "exam_month_taken, exam_year_taken, and status are required when took_board_exam is true" });
        }

        var hasGender = await lookupOptions.AnyAsync(x => x.Category == "gender" && x.Value == request.Gender, ct);
        if (!hasGender)
        {
            return BadRequest(new { error = "Invalid gender" });
        }

        var statusValue = string.IsNullOrWhiteSpace(request.Status) ? "Pending" : request.Status!;
        var hasStatus = await lookupOptions.AnyAsync(x => x.Category == "exam_status" && x.Value == statusValue, ct);
        if (!hasStatus)
        {
            return BadRequest(new { error = "Invalid exam status" });
        }

        var schoolExists = await dbContext.Schools.AnyAsync(x => x.Id == request.School_Id, ct);
        var programExists = await dbContext.Programs.AnyAsync(x => x.Id == request.Program_Id, ct);
        if (!schoolExists || !programExists)
        {
            return NotFound(new { error = "School or Program not found" });
        }

        return null;
    }
}
