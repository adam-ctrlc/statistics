namespace BoardExam.Api.Domain.Entities;

public class Region : SoftDeletableEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<School> Schools { get; set; } = new List<School>();
}
