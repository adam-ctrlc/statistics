using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/role-status")]
[Authorize]
public class RoleStatusController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var rows = await dbContext.RoleStatuses.OrderBy(x => x.Role).ToListAsync(ct);
        return Ok(rows.Select(ApiShapeMapper.ToRoleResponse));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var row = await dbContext.RoleStatuses.FirstOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? NotFound(new { error = "Role not found" }) : Ok(ApiShapeMapper.ToRoleResponse(row));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] RoleStatusUpsertRequest request, CancellationToken ct)
    {
        var lookupOptions = dbContext.Set<LookupOption>();

        if (string.IsNullOrWhiteSpace(request.Role)) return BadRequest(new { error = "role is required" });
        var normalizedRole = request.Role.Trim().ToLowerInvariant();
        if (await dbContext.RoleStatuses.AnyAsync(x => x.Role == normalizedRole, ct)) return BadRequest(new { error = "Role already exists" });

        var row = new RoleStatus { Role = normalizedRole };
        dbContext.RoleStatuses.Add(row);

        var lookup = await lookupOptions.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Category == "role" && x.Value == normalizedRole, ct);
        if (lookup is null)
        {
            lookupOptions.Add(new LookupOption
            {
                Category = "role",
                Value = normalizedRole,
                IsSystem = false
            });
        }
        else if (lookup.IsDeleted)
        {
            lookup.IsDeleted = false;
            lookup.DeletedAt = null;
        }

        await dbContext.SaveChangesAsync(ct);
        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToRoleResponse(row));
    }

    [HttpPatch("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(string id, [FromBody] RoleStatusUpsertRequest request, CancellationToken ct)
    {
        var lookupOptions = dbContext.Set<LookupOption>();

        var row = await dbContext.RoleStatuses.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Role not found" });
        if (string.Equals(row.Role, "admin", StringComparison.OrdinalIgnoreCase)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Admin role cannot be updated" });
        if (string.IsNullOrWhiteSpace(request.Role)) return BadRequest(new { error = "role is required" });
        var normalizedRole = request.Role.Trim().ToLowerInvariant();
        if (await dbContext.RoleStatuses.AnyAsync(x => x.Role == normalizedRole && x.Id != id, ct)) return BadRequest(new { error = "Role already exists" });

        var previousRole = row.Role;
        row.Role = normalizedRole;

        var previousLookup = await lookupOptions.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Category == "role" && x.Value == previousRole, ct);
        if (previousLookup is not null && !previousLookup.IsSystem)
        {
            previousLookup.Value = normalizedRole;
            if (previousLookup.IsDeleted)
            {
                previousLookup.IsDeleted = false;
                previousLookup.DeletedAt = null;
            }
        }
        else
        {
            var currentLookup = await lookupOptions.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Category == "role" && x.Value == normalizedRole, ct);
            if (currentLookup is null)
            {
                lookupOptions.Add(new LookupOption
                {
                    Category = "role",
                    Value = normalizedRole,
                    IsSystem = false
                });
            }
            else if (currentLookup.IsDeleted)
            {
                currentLookup.IsDeleted = false;
                currentLookup.DeletedAt = null;
            }
        }

        await dbContext.SaveChangesAsync(ct);
        return Ok(ApiShapeMapper.ToRoleResponse(row));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var lookupOptions = dbContext.Set<LookupOption>();

        var row = await dbContext.RoleStatuses.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound(new { error = "Role not found" });
        if (string.Equals(row.Role, "admin", StringComparison.OrdinalIgnoreCase)) return StatusCode(StatusCodes.Status403Forbidden, new { error = "Admin role cannot be deleted" });
        var inUse = await dbContext.Users.AnyAsync(x => x.RoleId == id, ct);
        if (inUse) return BadRequest(new { error = "Role is in use by users" });

        var lookup = await lookupOptions.FirstOrDefaultAsync(x => x.Category == "role" && x.Value == row.Role, ct);
        if (lookup is not null && !lookup.IsSystem)
        {
            lookupOptions.Remove(lookup);
        }

        dbContext.RoleStatuses.Remove(row);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "Role deleted successfully" });
    }
}
