namespace BoardExam.Api.Application.Contracts;

public record DepartmentUpsertRequest(string Name);
public record RegionUpsertRequest(string Name);
public record RoleStatusUpsertRequest(string Role);
public record ProgramUpsertRequest(string Program, string Department_Id);
public record SchoolUpsertRequest(string School, string Region_Id, bool Is_Phinma);
public record NationalPassingRateUpsertRequest(string Month, string Year, decimal Passing_Rate, string Program_Id);
public record LookupOptionUpsertRequest(string Category, string Value, bool Is_System);
