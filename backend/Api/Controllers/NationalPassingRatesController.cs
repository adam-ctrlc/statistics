using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/national-passing-rates")]
[Authorize]
public class NationalPassingRatesController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? year, [FromQuery] string? month, [FromQuery] string? programId, CancellationToken ct)
    {
        var query = dbContext.NationalPassingRates
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(year)) query = query.Where(x => x.Year == year);
        if (!string.IsNullOrWhiteSpace(month)) query = query.Where(x => x.Month == month);
        if (!string.IsNullOrWhiteSpace(programId)) query = query.Where(x => x.ProgramId == programId);

        var rows = await query.OrderByDescending(x => x.Year).ThenByDescending(x => x.Month).ToListAsync(ct);
        return Ok(rows.Select(ApiShapeMapper.ToNationalPassingRateResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var row = await dbContext.NationalPassingRates
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? NotFound(new { error = "National passing rate not found" }) : Ok(ApiShapeMapper.ToNationalPassingRateResponse(row));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] NationalPassingRateUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Month) || string.IsNullOrWhiteSpace(request.Year) || string.IsNullOrWhiteSpace(request.Program_Id))
            return BadRequest(new { error = "month, year, program_id are required" });

        var programExists = await dbContext.Programs.AnyAsync(x => x.Id == request.Program_Id, ct);
        if (!programExists) return NotFound(new { error = "Program not found" });

        var exists = await dbContext.NationalPassingRates.AnyAsync(x => x.Month == request.Month && x.Year == request.Year && x.ProgramId == request.Program_Id, ct);
        if (exists) return BadRequest(new { error = "Duplicate national passing rate" });

        var row = new NationalPassingRate
        {
            Month = request.Month,
            Year = request.Year,
            PassingRate = request.Passing_Rate,
            ProgramId = request.Program_Id
        };

        dbContext.NationalPassingRates.Add(row);
        await dbContext.SaveChangesAsync(ct);

        var created = await dbContext.NationalPassingRates.Include(x => x.Program)!.ThenInclude(x => x!.Department).FirstAsync(x => x.Id == row.Id, ct);
        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToNationalPassingRateResponse(created));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] NationalPassingRateUpsertRequest request, CancellationToken ct)
    {
        var row = await dbContext.NationalPassingRates.Include(x => x.Program)!.ThenInclude(x => x!.Department).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "National passing rate not found" });

        if (string.IsNullOrWhiteSpace(request.Month) || string.IsNullOrWhiteSpace(request.Year) || string.IsNullOrWhiteSpace(request.Program_Id))
            return BadRequest(new { error = "month, year, program_id are required" });

        var programExists = await dbContext.Programs.AnyAsync(x => x.Id == request.Program_Id, ct);
        if (!programExists) return NotFound(new { error = "Program not found" });

        var exists = await dbContext.NationalPassingRates.AnyAsync(x => x.Id != id && x.Month == request.Month && x.Year == request.Year && x.ProgramId == request.Program_Id, ct);
        if (exists) return BadRequest(new { error = "Duplicate national passing rate" });

        row.Month = request.Month;
        row.Year = request.Year;
        row.PassingRate = request.Passing_Rate;
        row.ProgramId = request.Program_Id;
        await dbContext.SaveChangesAsync(ct);

        row = await dbContext.NationalPassingRates.Include(x => x.Program)!.ThenInclude(x => x!.Department).FirstAsync(x => x.Id == id, ct);
        return Ok(ApiShapeMapper.ToNationalPassingRateResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var row = await dbContext.NationalPassingRates.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "National passing rate not found" });

        dbContext.NationalPassingRates.Remove(row);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "National passing rate deleted successfully" });
    }
}
