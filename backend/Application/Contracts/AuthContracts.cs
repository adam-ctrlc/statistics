namespace BoardExam.Api.Application.Contracts;

public record LoginRequest(string Username, string Password, string? TurnstileToken);
public record UpdateProfileRequest(string First_Name, string Last_Name, string? Middle_Name, string? Password);
public record VerifyPasswordRequest(string Username, string Password);
public record UpdateStatusRequest(string Status);
