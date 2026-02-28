namespace BoardExam.Api.Application.Common;

public class PagedResult<T>
{
    public required IReadOnlyList<T> Data { get; init; }
    public required int Total { get; init; }
    public required int Page { get; init; }
    public required int TotalPages { get; init; }
    public required int Limit { get; init; }
    public object? Summary { get; init; }
}
