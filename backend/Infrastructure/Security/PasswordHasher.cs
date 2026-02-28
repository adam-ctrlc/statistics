namespace BoardExam.Api.Infrastructure.Security;

public interface IPasswordHasher
{
    string Hash(string value);
    bool Verify(string value, string hash);
}

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string value) => BCrypt.Net.BCrypt.HashPassword(value);

    public bool Verify(string value, string hash) => BCrypt.Net.BCrypt.Verify(value, hash);
}
