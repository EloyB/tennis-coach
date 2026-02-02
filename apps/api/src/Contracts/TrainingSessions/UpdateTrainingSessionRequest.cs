namespace Contracts.TrainingSessions;

public record UpdateTrainingSessionRequest(
    DateTime ScheduledAt,
    int DurationMinutes,
    SessionType Type,
    string? Notes
);
