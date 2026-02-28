using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/lookups")]
[Authorize]
public class LookupsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public LookupsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, CancellationToken ct)
    {
        var lookupOptions = _dbContext.Set<LookupOption>();
        var query = lookupOptions.AsQueryable();
        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(x => x.Category == category.Trim().ToLowerInvariant());
        }

        var rows = await query
            .OrderBy(x => x.Category)
            .ThenBy(x => x.Value)
            .ToListAsync(ct);

        return Ok(rows.Select(ApiShapeMapper.ToLookupOptionResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var lookupOptions = _dbContext.Set<LookupOption>();
        var row = await lookupOptions.FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? NotFound(new { error = "Lookup option not found" }) : Ok(ApiShapeMapper.ToLookupOptionResponse(row));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] LookupOptionUpsertRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Category) || string.IsNullOrWhiteSpace(request.Value))
        {
            return BadRequest(new { error = "category and value are required" });
        }

        var category = request.Category.Trim().ToLowerInvariant();
        var value = request.Value.Trim();
        var lookupOptions = _dbContext.Set<LookupOption>();
        var exists = await lookupOptions.AnyAsync(x => x.Category == category && x.Value == value, ct);
        if (exists)
        {
            return BadRequest(new { error = "Lookup option already exists" });
        }

        var row = new LookupOption
        {
            Category = category,
            Value = value,
            IsSystem = request.Is_System
        };

        lookupOptions.Add(row);
        await _dbContext.SaveChangesAsync(ct);
        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToLookupOptionResponse(row));
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] LookupOptionUpsertRequest request, CancellationToken ct)
    {
        var lookupOptions = _dbContext.Set<LookupOption>();
        var row = await lookupOptions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null)
        {
            return NotFound(new { error = "Lookup option not found" });
        }

        if (row.IsSystem)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "System lookup option cannot be modified" });
        }

        if (string.IsNullOrWhiteSpace(request.Category) || string.IsNullOrWhiteSpace(request.Value))
        {
            return BadRequest(new { error = "category and value are required" });
        }

        var category = request.Category.Trim().ToLowerInvariant();
        var value = request.Value.Trim();
        var exists = await lookupOptions.AnyAsync(x => x.Id != id && x.Category == category && x.Value == value, ct);
        if (exists)
        {
            return BadRequest(new { error = "Lookup option already exists" });
        }

        row.Category = category;
        row.Value = value;
        row.IsSystem = request.Is_System;
        await _dbContext.SaveChangesAsync(ct);

        return Ok(ApiShapeMapper.ToLookupOptionResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var lookupOptions = _dbContext.Set<LookupOption>();
        var row = await lookupOptions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null)
        {
            return NotFound(new { error = "Lookup option not found" });
        }

        if (row.IsSystem)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "System lookup option cannot be deleted" });
        }

        lookupOptions.Remove(row);
        await _dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "Lookup option deleted successfully" });
    }
}
