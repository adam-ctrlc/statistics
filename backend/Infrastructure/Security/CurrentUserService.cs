using System.Security.Claims;

namespace BoardExam.Api.Infrastructure.Security;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public ClaimsPrincipal Principal => httpContextAccessor.HttpContext?.User ?? new ClaimsPrincipal(new ClaimsIdentity());
    public string? UserId => Principal.FindFirstValue(ClaimTypes.NameIdentifier);
    public string? Username => Principal.FindFirstValue(ClaimTypes.Name);
    public string? Role => Principal.FindFirstValue(ClaimTypes.Role);
    public bool IsAuthenticated => Principal.Identity?.IsAuthenticated == true;
}
