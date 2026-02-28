namespace BoardExam.Api.Application.Contracts;

public record StatisticsUpsertRequest(
    string Last_Name,
    string First_Name,
    string? Middle_Name,
    string School_Id,
    string Gender,
    string Program_Id,
    bool Took_Board_Exam,
    string? Exam_Month_Taken,
    string? Exam_Year_Taken,
    string? Status,
    bool Retake,
    int Retake_Times);

public record StatisticsBulkDeleteRequest(List<string> Ids);
