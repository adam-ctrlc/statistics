using BoardExam.Api.Domain.Entities;

namespace BoardExam.Api.Application.Common;

public static class ApiShapeMapper
{
    public static object ToUserResponse(User user)
        => new
        {
            _id = user.Id,
            last_name = user.LastName,
            first_name = user.FirstName,
            middle_name = user.MiddleName,
            username = user.Username,
            gender = user.Gender,
            modify_access = user.ModifyAccess,
            status = user.Status,
            school_id = user.School is null ? user.SchoolId : ToSchoolResponse(user.School),
            program_id = user.Program is null ? user.ProgramId : ToProgramResponse(user.Program),
            role_id = user.Role is null ? user.RoleId : ToRoleResponse(user.Role),
            created_at = user.CreatedAt,
            updated_at = user.UpdatedAt
        };

    public static object ToDepartmentResponse(Department entity)
        => new
        {
            _id = entity.Id,
            name = entity.Name,
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };

    public static object ToRegionResponse(Region entity)
        => new
        {
            _id = entity.Id,
            name = entity.Name,
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };

    public static object ToRoleResponse(RoleStatus entity)
        => new
        {
            _id = entity.Id,
            role = entity.Role,
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };

    public static object ToProgramResponse(ProgramEntity entity)
        => new
        {
            _id = entity.Id,
            program = entity.Program,
            department_id = entity.Department is null ? entity.DepartmentId : ToDepartmentResponse(entity.Department),
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };

    public static object ToSchoolResponse(School entity)
        => new
        {
            _id = entity.Id,
            school = entity.SchoolName,
            is_phinma = entity.IsPhinma,
            region_id = entity.Region is null ? entity.RegionId : ToRegionResponse(entity.Region),
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };

    public static object ToNationalPassingRateResponse(NationalPassingRate entity)
        => new
        {
            _id = entity.Id,
            month = entity.Month,
            year = entity.Year,
            passing_rate = entity.PassingRate,
            program_id = entity.Program is null ? entity.ProgramId : ToProgramResponse(entity.Program),
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };

    public static object ToStatisticsResponse(StatisticsData entity)
        => new
        {
            _id = entity.Id,
            last_name = entity.LastName,
            first_name = entity.FirstName,
            middle_name = entity.MiddleName,
            school_id = entity.School is null ? entity.SchoolId : ToSchoolResponse(entity.School),
            gender = entity.Gender,
            program_id = entity.Program is null ? entity.ProgramId : ToProgramResponse(entity.Program),
            took_board_exam = entity.TookBoardExam,
            exam_month_taken = entity.ExamMonthTaken,
            exam_year_taken = entity.ExamYearTaken,
            status = entity.Status,
            retake = entity.Retake,
            retake_times = entity.RetakeTimes,
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };

    public static object ToLookupOptionResponse(LookupOption entity)
        => new
        {
            _id = entity.Id,
            category = entity.Category,
            value = entity.Value,
            is_system = entity.IsSystem,
            created_at = entity.CreatedAt,
            updated_at = entity.UpdatedAt
        };
}
