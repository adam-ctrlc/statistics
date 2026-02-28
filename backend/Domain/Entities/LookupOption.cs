namespace BoardExam.Api.Domain.Entities;

public class LookupOption : SoftDeletableEntity
{
    public string Category { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public bool IsSystem { get; set; }
}
