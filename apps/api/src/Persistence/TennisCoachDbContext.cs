using Microsoft.EntityFrameworkCore;
using Persistence.Entities;

namespace Persistence;

public class TennisCoachDbContext : DbContext
{
    public TennisCoachDbContext(DbContextOptions<TennisCoachDbContext> options)
        : base(options)
    {
    }

    public DbSet<Coach> Coaches => Set<Coach>();
    public DbSet<TrainingSession> TrainingSessions => Set<TrainingSession>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Coach>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        modelBuilder.Entity<TrainingSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CoachId).IsRequired();
            entity.Property(e => e.ScheduledAt).IsRequired();
            entity.Property(e => e.DurationMinutes).IsRequired();
            entity.Property(e => e.Type).IsRequired();
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.Notes).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).IsRequired();

            entity.HasOne(e => e.Coach)
                  .WithMany(c => c.TrainingSessions)
                  .HasForeignKey(e => e.CoachId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
