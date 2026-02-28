namespace BoardExam.Api.Domain.Entities;

public class User : SoftDeletableEntity
{
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string SchoolId { get; set; } = string.Empty;
    public School? School { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHashed { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string ProgramId { get; set; } = string.Empty;
    public ProgramEntity? Program { get; set; }
    public bool ModifyAccess { get; set; }
    public string RoleId { get; set; } = string.Empty;
    public RoleStatus? Role { get; set; }
    public string Status { get; set; } = "inactive";
}
