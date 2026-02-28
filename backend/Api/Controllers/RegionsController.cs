using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/regions")]
[Authorize]
public class RegionsController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var rows = await dbContext.Regions.OrderBy(x => x.Name).ToListAsync(ct);
        return Ok(rows.Select(ApiShapeMapper.ToRegionResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var row = await dbContext.Regions.FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? NotFound(new { error = "Region not found" }) : Ok(ApiShapeMapper.ToRegionResponse(row));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] RegionUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest(new { error = "name is required" });
        if (await dbContext.Regions.AnyAsync(x => x.Name == request.Name, ct)) return BadRequest(new { error = "Region already exists" });

        var row = new Region { Name = request.Name.Trim() };
        dbContext.Regions.Add(row);
        await dbContext.SaveChangesAsync(ct);
        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToRegionResponse(row));
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] RegionUpsertRequest request, CancellationToken ct)
    {
        var row = await dbContext.Regions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Region not found" });
        if (string.IsNullOrWhiteSpace(request.Name)) return BadRequest(new { error = "name is required" });
        if (await dbContext.Regions.AnyAsync(x => x.Name == request.Name && x.Id != id, ct)) return BadRequest(new { error = "Region already exists" });

        row.Name = request.Name.Trim();
        await dbContext.SaveChangesAsync(ct);
        return Ok(ApiShapeMapper.ToRegionResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var row = await dbContext.Regions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Region not found" });
        var inUse = await dbContext.Schools.AnyAsync(x => x.RegionId == id, ct);
        if (inUse) return BadRequest(new { error = "Region is in use by schools" });

        dbContext.Regions.Remove(row);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "Region deleted successfully" });
    }
}
