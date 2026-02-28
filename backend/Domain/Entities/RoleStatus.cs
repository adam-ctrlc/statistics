namespace BoardExam.Api.Domain.Entities;

public class RoleStatus : SoftDeletableEntity
{
    public string Role { get; set; } = string.Empty;
    public ICollection<User> Users { get; set; } = new List<User>();
}
