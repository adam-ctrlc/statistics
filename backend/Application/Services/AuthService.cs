using BoardExam.Api.Application.Contracts;
using BoardExam.Api.Application.Common;
using BoardExam.Api.Domain.Entities;
using BoardExam.Api.Infrastructure.Data;
using BoardExam.Api.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace BoardExam.Api.Application.Services;

public interface IAuthService
{
    Task<(bool Success, string? Error, User? User)> LoginAsync(LoginRequest request, CancellationToken ct);
    Task<User?> GetProfileAsync(string userId, CancellationToken ct);
    Task<(bool Success, string? Error, User? User)> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken ct);
    Task<(bool Success, string? Error)> VerifyPasswordAsync(string userId, VerifyPasswordRequest request, CancellationToken ct);
}

public class AuthService(AppDbContext dbContext, IPasswordHasher passwordHasher) : IAuthService
{
    public async Task<(bool Success, string? Error, User? User)> LoginAsync(LoginRequest request, CancellationToken ct)
    {
        var user = await dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Username == request.Username, ct);

        if (user is null)
        {
            return (false, "Invalid credentials", null);
        }

        if (!passwordHasher.Verify(request.Password, user.PasswordHashed))
        {
            return (false, "Invalid credentials", null);
        }

        if (!string.Equals(user.Status, "active", StringComparison.OrdinalIgnoreCase))
        {
            return (false, "Account is inactive", null);
        }

        return (true, null, user);
    }

    public Task<User?> GetProfileAsync(string userId, CancellationToken ct)
        => dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId, ct);

    public async Task<(bool Success, string? Error, User? User)> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken ct)
    {
        var user = await dbContext.Users
            .Include(x => x.School)!.ThenInclude(x => x!.Region)
            .Include(x => x.Program)!.ThenInclude(x => x!.Department)
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == userId, ct);

        if (user is null)
        {
            return (false, "User not found", null);
        }

        user.FirstName = request.First_Name;
        user.LastName = request.Last_Name;
        user.MiddleName = request.Middle_Name;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHashed = passwordHasher.Hash(request.Password);
        }

        await dbContext.SaveChangesAsync(ct);
        return (true, null, user);
    }

    public async Task<(bool Success, string? Error)> VerifyPasswordAsync(string userId, VerifyPasswordRequest request, CancellationToken ct)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (user is null)
        {
            return (false, "User not found");
        }

        if (!string.Equals(user.Username, request.Username, StringComparison.Ordinal))
        {
            return (false, "Username does not match current user");
        }

        var isValid = passwordHasher.Verify(request.Password, user.PasswordHashed);
        return isValid ? (true, null) : (false, "Incorrect current password");
    }
}
