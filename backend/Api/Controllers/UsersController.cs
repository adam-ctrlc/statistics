using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using BoardExam.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController(
    AppDbContext dbContext,
    IPasswordHasher passwordHasher,
    ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var users = await dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(ct);

        return Ok(users.Select(ApiShapeMapper.ToUserResponse));
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct)
    {
        var user = await dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        return Ok(ApiShapeMapper.ToUserResponse(user));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request, CancellationToken ct)
    {
        var lookupOptions = dbContext.Set<LookupOption>();

        if (string.IsNullOrWhiteSpace(request.Last_Name)
            || string.IsNullOrWhiteSpace(request.First_Name)
            || string.IsNullOrWhiteSpace(request.School_Id)
            || string.IsNullOrWhiteSpace(request.Password)
            || string.IsNullOrWhiteSpace(request.Gender)
            || string.IsNullOrWhiteSpace(request.Program_Id)
            || string.IsNullOrWhiteSpace(request.Role_Id)
            || string.IsNullOrWhiteSpace(request.Status))
        {
            return BadRequest(new { error = "Missing required fields" });
        }

        var username = string.IsNullOrWhiteSpace(request.Username)
            ? await GenerateUniqueUsernameAsync(request.First_Name, request.Last_Name, request.Middle_Name, ct)
            : request.Username.Trim().ToLowerInvariant();

        if (await dbContext.Users.AnyAsync(x => x.Username == username, ct))
        {
            return BadRequest(new { error = "Username already exists" });
        }

        var normalizedStatus = request.Status.Trim().ToLowerInvariant();
        var hasStatus = await lookupOptions.AnyAsync(x => x.Category == "user_status" && x.Value == normalizedStatus, ct);
        if (!hasStatus)
        {
            return BadRequest(new { error = "Invalid status" });
        }

        var normalizedGender = request.Gender.Trim().ToLowerInvariant();
        var genderLookup = await lookupOptions.FirstOrDefaultAsync(x => x.Category == "gender" && x.Value.ToLower() == normalizedGender, ct);
        if (genderLookup is null)
        {
            return BadRequest(new { error = "Invalid gender" });
        }

        var schoolExists = await dbContext.Schools.AnyAsync(x => x.Id == request.School_Id, ct);
        var programExists = await dbContext.Programs.AnyAsync(x => x.Id == request.Program_Id, ct);
        var role = await dbContext.RoleStatuses.FirstOrDefaultAsync(x => x.Id == request.Role_Id, ct);
        if (!schoolExists || !programExists || role is null)
        {
            return NotFound(new { error = "Related school/program/role not found" });
        }

        if (string.Equals(role.Role, "admin", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "Creating additional admin users is not allowed" });
        }

        var user = new User
        {
            LastName = request.Last_Name,
            FirstName = request.First_Name,
            MiddleName = request.Middle_Name,
            SchoolId = request.School_Id,
            Username = username,
            PasswordHashed = passwordHasher.Hash(request.Password),
            Gender = genderLookup.Value,
            ProgramId = request.Program_Id,
            ModifyAccess = false,
            RoleId = request.Role_Id,
            Status = normalizedStatus
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(ct);

        var created = await dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .FirstAsync(x => x.Id == user.Id, ct);

        return StatusCode(StatusCodes.Status201Created, ApiShapeMapper.ToUserResponse(created));
    }

    [HttpPatch("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        var lookupOptions = dbContext.Set<LookupOption>();

        var user = await dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        var isAdmin = string.Equals(currentUser.Role, "admin", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && currentUser.UserId != id)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Not authorized" });
        }

        if (!string.IsNullOrWhiteSpace(request.Username)
            && !string.Equals(request.Username, user.Username, StringComparison.Ordinal)
            && await dbContext.Users.AnyAsync(x => x.Username == request.Username && x.Id != id, ct))
        {
            return BadRequest(new { error = "Username already exists" });
        }

        if (!string.IsNullOrWhiteSpace(request.Last_Name)) user.LastName = request.Last_Name;
        if (!string.IsNullOrWhiteSpace(request.First_Name)) user.FirstName = request.First_Name;
        if (request.Middle_Name is not null) user.MiddleName = request.Middle_Name;
        if (!string.IsNullOrWhiteSpace(request.School_Id)) user.SchoolId = request.School_Id;
        if (!string.IsNullOrWhiteSpace(request.Username)) user.Username = request.Username;
        if (!string.IsNullOrWhiteSpace(request.Password)) user.PasswordHashed = passwordHasher.Hash(request.Password);
        if (!string.IsNullOrWhiteSpace(request.Gender))
        {
            var normalizedUpdateGender = request.Gender.Trim().ToLowerInvariant();
            var updateGenderLookup = await lookupOptions.FirstOrDefaultAsync(x => x.Category == "gender" && x.Value.ToLower() == normalizedUpdateGender, ct);
            if (updateGenderLookup is null)
            {
                return BadRequest(new { error = "Invalid gender" });
            }

            user.Gender = updateGenderLookup.Value;
        }
        if (!string.IsNullOrWhiteSpace(request.Program_Id)) user.ProgramId = request.Program_Id;
        if (request.Modify_Access.HasValue) user.ModifyAccess = request.Modify_Access.Value;
        if (!string.IsNullOrWhiteSpace(request.Role_Id))
        {
            var nextRole = await dbContext.RoleStatuses.FirstOrDefaultAsync(x => x.Id == request.Role_Id, ct);
            if (nextRole is null)
            {
                return NotFound(new { error = "Role not found" });
            }

            var currentRoleIsAdmin = string.Equals(user.Role?.Role, "admin", StringComparison.OrdinalIgnoreCase);
            var nextRoleIsAdmin = string.Equals(nextRole.Role, "admin", StringComparison.OrdinalIgnoreCase);

            if (currentRoleIsAdmin && user.RoleId != request.Role_Id)
            {
                return BadRequest(new { error = "Admin user role cannot be changed" });
            }

            if (!currentRoleIsAdmin && nextRoleIsAdmin)
            {
                return BadRequest(new { error = "Promoting users to admin is not allowed" });
            }

            user.RoleId = request.Role_Id;
        }
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var normalizedUpdateStatus = request.Status.Trim().ToLowerInvariant();
            var hasStatusUpdate = await lookupOptions.AnyAsync(x => x.Category == "user_status" && x.Value == normalizedUpdateStatus, ct);
            if (!hasStatusUpdate)
            {
                return BadRequest(new { error = "Invalid status" });
            }

            user.Status = normalizedUpdateStatus;
        }

        await dbContext.SaveChangesAsync(ct);
        return Ok(ApiShapeMapper.ToUserResponse(user));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync(ct);
        return Ok(new { message = "User deleted successfully" });
    }

    [HttpPatch("{id}/password")]
    [Authorize]
    public async Task<IActionResult> UpdatePassword(string id, [FromBody] UpdatePasswordRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Password is required" });
        }

        var isAdmin = string.Equals(currentUser.Role, "admin", StringComparison.OrdinalIgnoreCase);
        if (!isAdmin && currentUser.UserId != id)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = "Not authorized" });
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        user.PasswordHashed = passwordHasher.Hash(request.Password);
        await dbContext.SaveChangesAsync(ct);

        return Ok(new { success = true });
    }

    [HttpGet("check-username")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckUsername([FromQuery] string username, [FromQuery] string? excludeId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return BadRequest(new { error = "username query parameter is required" });
        }

        var query = dbContext.Users.Where(x => x.Username == username);
        if (!string.IsNullOrWhiteSpace(excludeId))
        {
            query = query.Where(x => x.Id != excludeId);
        }

        var exists = await query.AnyAsync(ct);
        return Ok(new { exists });
    }

    private async Task<string> GenerateUniqueUsernameAsync(string firstName, string lastName, string? middleName, CancellationToken ct)
    {
        static string Sanitize(string raw)
        {
            var normalized = raw.Trim().ToLowerInvariant();
            var sb = new StringBuilder(normalized.Length);
            foreach (var ch in normalized)
            {
                if (char.IsLetterOrDigit(ch))
                {
                    sb.Append(ch);
                }
            }

            return sb.ToString();
        }

        var first = Sanitize(firstName);
        var last = Sanitize(lastName);
        var middleSanitized = string.IsNullOrWhiteSpace(middleName) ? string.Empty : Sanitize(middleName);
        var middle = string.IsNullOrWhiteSpace(middleSanitized) ? string.Empty : middleSanitized[..1];

        var baseUsername = string.Join('.', new[] { first, middle, last }.Where(x => !string.IsNullOrWhiteSpace(x)));
        if (string.IsNullOrWhiteSpace(baseUsername))
        {
            baseUsername = "user";
        }

        var candidate = baseUsername;
        var suffix = 1;
        while (await dbContext.Users.AnyAsync(x => x.Username == candidate, ct))
        {
            suffix++;
            candidate = $"{baseUsername}{suffix}";
        }

        return candidate;
    }
}
