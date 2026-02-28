namespace BoardExam.Api.Application.Contracts;

public record CreateUserRequest(
    string Last_Name,
    string First_Name,
    string? Middle_Name,
    string School_Id,
    string? Username,
    string Password,
    string Gender,
    string Program_Id,
    bool Modify_Access,
    string Role_Id,
    string Status);

public record UpdateUserRequest(
    string? Last_Name,
    string? First_Name,
    string? Middle_Name,
    string? School_Id,
    string? Username,
    string? Password,
    string? Gender,
    string? Program_Id,
    bool? Modify_Access,
    string? Role_Id,
    string? Status);

public record UpdatePasswordRequest(string Password);
