using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/departments")]
[Authorize]
public class DepartmentsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var rows = await dbContext.Departments.OrderBy(x => x.Name).ToListAsync(ct);
        return Ok(rows.Select(ApiShapeMapper.ToDepartmentResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var row = await dbContext.Departments.FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? NotFound(new { error = "Department not found" }) : Ok(ApiShapeMapper.ToDepartmentResponse(row));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] DepartmentUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest(new { error = "name is required" });
        if (await dbContext.Departments.AnyAsync(x => x.Name == request.Name, ct)) return BadRequest(new { error = "Department already exists" });

        var row = new Department { Name = request.Name.Trim() };
        dbContext.Departments.Add(row);
        await dbContext.SaveChangesAsync(ct);
        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToDepartmentResponse(row));
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] DepartmentUpsertRequest request, CancellationToken ct)
    {
        var row = await dbContext.Departments.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Department not found" });
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest(new { error = "name is required" });
        if (await dbContext.Departments.AnyAsync(x => x.Name == request.Name && x.Id != id, ct)) return BadRequest(new { error = "Department already exists" });

        row.Name = request.Name.Trim();
        await dbContext.SaveChangesAsync(ct);
        return Ok(ApiShapeMapper.ToDepartmentResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var row = await dbContext.Departments.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Department not found" });

        var hasPrograms = await dbContext.Programs.AnyAsync(x => x.DepartmentId == id, ct);
        if (hasPrograms) return BadRequest(new { error = "Department is in use by programs" });

        dbContext.Departments.Remove(row);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "Department deleted successfully" });
    }
}
