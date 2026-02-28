namespace BoardExam.Api.Domain.Entities;

public class NationalPassingRate : SoftDeletableEntity
{
    public string Month { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public decimal PassingRate { get; set; }
    public string ProgramId { get; set; } = string.Empty;
    public ProgramEntity? Program { get; set; }
}
