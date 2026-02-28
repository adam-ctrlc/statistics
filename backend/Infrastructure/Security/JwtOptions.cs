namespace BoardExam.Api.Infrastructure.Security;

public class JwtOptions
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = "BoardExam.Api";
    public string Audience { get; set; } = "BoardExam.Client";
    public string Key { get; set; } = string.Empty;
    public int ExpiryHours { get; set; } = 24;
}
