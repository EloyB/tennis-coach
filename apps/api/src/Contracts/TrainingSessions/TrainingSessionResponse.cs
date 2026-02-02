namespace Contracts.TrainingSessions;

public record TrainingSessionResponse(
    Guid Id,
    DateTime ScheduledAt,
    int DurationMinutes,
    SessionType Type,
    SessionStatus Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
