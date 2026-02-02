namespace Contracts.Auth;

public record AuthResponse(
    string Token,
    CoachInfo Coach
);

public record CoachInfo(
    Guid Id,
    string Email,
    string Name
);
