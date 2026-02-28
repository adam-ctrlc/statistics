namespace BoardExam.Api.Domain.Entities;

public abstract class SoftDeletableEntity : TimestampedEntity
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}
