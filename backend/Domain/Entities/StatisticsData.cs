namespace BoardExam.Api.Domain.Entities;

public class StatisticsData : SoftDeletableEntity
{
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string SchoolId { get; set; } = string.Empty;
    public School? School { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string ProgramId { get; set; } = string.Empty;
    public ProgramEntity? Program { get; set; }
    public bool TookBoardExam { get; set; }
    public string? ExamMonthTaken { get; set; }
    public string? ExamYearTaken { get; set; }
    public string Status { get; set; } = "Pending";
    public bool Retake { get; set; }
    public int RetakeTimes { get; set; }
}
