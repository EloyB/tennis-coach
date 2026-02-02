using Contracts.TrainingSessions;

namespace Persistence.Entities;

public class TrainingSession
{
    public Guid Id { get; set; }
    public Guid CoachId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public int DurationMinutes { get; set; }
    public SessionType Type { get; set; }
    public SessionStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Coach Coach { get; set; } = null!;
}
