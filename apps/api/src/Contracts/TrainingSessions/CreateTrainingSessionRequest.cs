namespace Contracts.TrainingSessions;

public record CreateTrainingSessionRequest(
    DateTime ScheduledAt,
    int DurationMinutes,
    SessionType Type,
    string? Notes
);
