using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/schools")]
[Authorize]
public class SchoolsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var rows = await dbContext.Schools
            .Include(x => x.Region)
            .OrderBy(x => x.SchoolName)
            .ToListAsync(ct);
        return Ok(rows.Select(ApiShapeMapper.ToSchoolResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var row = await dbContext.Schools
            .Include(x => x.Region)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? NotFound(new { error = "School not found" }) : Ok(ApiShapeMapper.ToSchoolResponse(row));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] SchoolUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.School) || string.IsNullOrWhiteSpace(request.Region_Id))
            return BadRequest(new { error = "school and region_id are required" });

        if (await dbContext.Schools.AnyAsync(x => x.SchoolName == request.School, ct))
            return BadRequest(new { error = "School already exists" });

        var regionExists = await dbContext.Regions.AnyAsync(x => x.Id == request.Region_Id, ct);
        if (!regionExists) return NotFound(new { error = "Region not found" });

        var row = new School { SchoolName = request.School.Trim(), RegionId = request.Region_Id, IsPhinma = request.Is_Phinma };
        dbContext.Schools.Add(row);
        await dbContext.SaveChangesAsync(ct);

        var created = await dbContext.Schools.Include(x => x.Region).FirstAsync(x => x.Id == row.Id, ct);
        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToSchoolResponse(created));
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] SchoolUpsertRequest request, CancellationToken ct)
    {
        var row = await dbContext.Schools.Include(x => x.Region).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "School not found" });
        if (string.IsNullOrWhiteSpace(request.School) || string.IsNullOrWhiteSpace(request.Region_Id))
            return BadRequest(new { error = "school and region_id are required" });
        if (await dbContext.Schools.AnyAsync(x => x.SchoolName == request.School && x.Id != id, ct))
            return BadRequest(new { error = "School already exists" });

        var regionExists = await dbContext.Regions.AnyAsync(x => x.Id == request.Region_Id, ct);
        if (!regionExists) return NotFound(new { error = "Region not found" });

        row.SchoolName = request.School.Trim();
        row.RegionId = request.Region_Id;
        row.IsPhinma = request.Is_Phinma;
        await dbContext.SaveChangesAsync(ct);

        row = await dbContext.Schools.Include(x => x.Region).FirstAsync(x => x.Id == id, ct);
        return Ok(ApiShapeMapper.ToSchoolResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var row = await dbContext.Schools.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "School not found" });

        var inUse = await dbContext.Users.AnyAsync(x => x.SchoolId == id, ct) || await dbContext.StatisticsDataRecords.AnyAsync(x => x.SchoolId == id, ct);
        if (inUse) return BadRequest(new { error = "School is in use" });

        dbContext.Schools.Remove(row);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "School deleted successfully" });
    }
}
