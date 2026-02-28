namespace BoardExam.Api.Domain.Entities;

public class Department : SoftDeletableEntity
{
    public string Name { get; set; } = string.Empty;
    public ICollection<ProgramEntity> Programs { get; set; } = new List<ProgramEntity>();
}
