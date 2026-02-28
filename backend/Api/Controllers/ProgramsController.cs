using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/programs")]
[Authorize]
public class ProgramsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var rows = await dbContext.Programs
            .Include(x => x.Department)
            .OrderBy(x => x.Program)
            .ToListAsync(ct);
        return Ok(rows.Select(ApiShapeMapper.ToProgramResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var row = await dbContext.Programs
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? NotFound(new { error = "Program not found" }) : Ok(ApiShapeMapper.ToProgramResponse(row));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] ProgramUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Program) || string.IsNullOrWhiteSpace(request.Department_Id))
            return BadRequest(new { error = "program and department_id are required" });

        if (await dbContext.Programs.AnyAsync(x => x.Program == request.Program, ct))
            return BadRequest(new { error = "Program already exists" });

        var departmentExists = await dbContext.Departments.AnyAsync(x => x.Id == request.Department_Id, ct);
        if (!departmentExists) return NotFound(new { error = "Department not found" });

        var row = new ProgramEntity { Program = request.Program.Trim(), DepartmentId = request.Department_Id };
        dbContext.Programs.Add(row);
        await dbContext.SaveChangesAsync(ct);

        var created = await dbContext.Programs.Include(x => x.Department).FirstAsync(x => x.Id == row.Id, ct);
        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToProgramResponse(created));
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] ProgramUpsertRequest request, CancellationToken ct)
    {
        var row = await dbContext.Programs.Include(x => x.Department).FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Program not found" });
        if (string.IsNullOrWhiteSpace(request.Program) || string.IsNullOrWhiteSpace(request.Department_Id))
            return BadRequest(new { error = "program and department_id are required" });
        if (await dbContext.Programs.AnyAsync(x => x.Program == request.Program && x.Id != id, ct))
            return BadRequest(new { error = "Program already exists" });

        var departmentExists = await dbContext.Departments.AnyAsync(x => x.Id == request.Department_Id, ct);
        if (!departmentExists) return NotFound(new { error = "Department not found" });

        row.Program = request.Program.Trim();
        row.DepartmentId = request.Department_Id;
        await dbContext.SaveChangesAsync(ct);

        row = await dbContext.Programs.Include(x => x.Department).FirstAsync(x => x.Id == id, ct);
        return Ok(ApiShapeMapper.ToProgramResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var row = await dbContext.Programs.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Program not found" });
        var inUse = await dbContext.Users.AnyAsync(x => x.ProgramId == id, ct) || await dbContext.StatisticsDataRecords.AnyAsync(x => x.ProgramId == id, ct);
        if (inUse) return BadRequest(new { error = "Program is in use" });

        dbContext.Programs.Remove(row);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "Program deleted successfully" });
    }
}
