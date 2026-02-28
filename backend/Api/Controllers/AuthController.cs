using BoardExam.Api.Application.Common;
using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Application.Services;
using BoardExam.Api.Infrastructure.Data;
using BoardExam.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(
    IAuthService authService,
    IJwtTokenService jwtTokenService,
    ICurrentUserService currentUser,
    AppDbContext dbContext,
    IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Username and password are required" });
        }

        var bypassTurnstile = environment.IsDevelopment();
        if (!bypassTurnstile && string.IsNullOrWhiteSpace(request.TurnstileToken))
        {
            return BadRequest(new { error = "Missing turnstileToken" });
        }

        var result = await authService.LoginAsync(request, ct);
        if (!result.Success || result.User is null)
        {
            return Unauthorized(new { error = result.Error ?? "Login failed" });
        }

        var token = jwtTokenService.Generate(result.User);
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            SameSite = SameSiteMode.Lax,
            Secure = false,
            Expires = DateTimeOffset.UtcNow.AddHours(24)
        });

        return Ok(ApiShapeMapper.ToUserResponse(result.User));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt");
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        if (currentUser.UserId is null)
        {
            return Unauthorized(new { error = "Not authorized" });
        }

        var profile = await authService.GetProfileAsync(currentUser.UserId, ct);
        if (profile is null)
        {
            return Unauthorized(new { error = "Not authorized" });
        }

        return Ok(ApiShapeMapper.ToUserResponse(profile));
    }

    [HttpPatch("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        if (currentUser.UserId is null)
        {
            return Unauthorized(new { error = "Not authorized" });
        }

        if (string.IsNullOrWhiteSpace(request.First_Name) || string.IsNullOrWhiteSpace(request.Last_Name))
        {
            return BadRequest(new { error = "first_name and last_name are required" });
        }

        var result = await authService.UpdateProfileAsync(currentUser.UserId, request, ct);
        if (!result.Success || result.User is null)
        {
            return NotFound(new { error = result.Error ?? "User not found" });
        }

        return Ok(ApiShapeMapper.ToUserResponse(result.User));
    }

    [HttpPatch("status/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusRequest request, CancellationToken ct)
    {
        var normalized = request.Status?.Trim().ToLowerInvariant();
        var isValidStatus = !string.IsNullOrWhiteSpace(normalized) && await dbContext.LookupOptions
            .AnyAsync(x => x.Category == "user_status" && x.Value == normalized, ct);
        if (!isValidStatus)
        {
            return BadRequest(new { error = "Invalid status" });
        }

        var user = await dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        user.Status = normalized!;
        await dbContext.SaveChangesAsync(ct);
        return Ok(ApiShapeMapper.ToUserResponse(user));
    }

    [HttpGet("status/{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> GetStatus(string id, CancellationToken ct)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user is null)
        {
            return NotFound(new { error = "User not found" });
        }

        return Ok(new { _id = user.Id, status = user.Status });
    }

    [HttpPost("verify-password")]
    [Authorize]
    public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordRequest request, CancellationToken ct)
    {
        if (currentUser.UserId is null)
        {
            return Unauthorized(new { error = "Not authorized" });
        }

        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Username and password are required" });
        }

        var result = await authService.VerifyPasswordAsync(currentUser.UserId, request, ct);
        if (!result.Success)
        {
            return Unauthorized(new { error = result.Error ?? "Incorrect current password" });
        }

        return Ok(new { success = true });
    }
}
