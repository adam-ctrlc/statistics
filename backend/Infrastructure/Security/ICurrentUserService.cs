using System.Security.Claims;

namespace BoardExam.Api.Infrastructure.Security;

public interface ICurrentUserService
{
    ClaimsPrincipal Principal { get; }
    string? UserId { get; }
    string? Username { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}
