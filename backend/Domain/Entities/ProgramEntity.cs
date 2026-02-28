namespace BoardExam.Api.Domain.Entities;

public class ProgramEntity : SoftDeletableEntity
{
    public string Program { get; set; } = string.Empty;
    public string DepartmentId { get; set; } = string.Empty;
    public Department? Department { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<StatisticsData> StatisticsDataRecords { get; set; } = new List<StatisticsData>();
    public ICollection<NationalPassingRate> NationalPassingRates { get; set; } = new List<NationalPassingRate>();
}
