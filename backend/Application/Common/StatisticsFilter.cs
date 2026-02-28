namespace BoardExam.Api.Application.Common;

public class StatisticsFilter
{
    public List<string>? ProgramId { get; set; }
    public List<string>? SchoolId { get; set; }
    public List<string>? Year { get; set; }
    public string? GenderFilter { get; set; }
    public string? ExamStatusFilter { get; set; }
    public string? RetakeFilter { get; set; }
    public string? TookExamFilter { get; set; }
    public string? GlobalFilter { get; set; }
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
}
