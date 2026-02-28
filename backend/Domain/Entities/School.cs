namespace BoardExam.Api.Domain.Entities;

public class School : SoftDeletableEntity
{
    public string SchoolName { get; set; } = string.Empty;
    public string RegionId { get; set; } = string.Empty;
    public Region? Region { get; set; }
    public bool IsPhinma { get; set; }
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<StatisticsData> StatisticsDataRecords { get; set; } = new List<StatisticsData>();
}
