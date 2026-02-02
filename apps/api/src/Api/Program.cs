using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Contracts.Auth;
using Contracts.TrainingSessions;
using Infrastructure.Auth;
using Infrastructure.FeatureFlags;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Persistence;
using Persistence.Entities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TennisCoach";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TennisCoachApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddSingleton<IFeatureFlagService, FeatureFlagService>();
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<TennisCoachDbContext>(options =>
    options.UseNpgsql(connectionString));

var app = builder.Build();

// Apply migrations automatically in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<TennisCoachDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Helper to get current coach ID from JWT
static Guid? GetCoachId(ClaimsPrincipal user)
{
    var sub = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
           ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    return Guid.TryParse(sub, out var id) ? id : null;
}

// Auth endpoints
var authApi = app.MapGroup("/api/auth");

authApi.MapPost("/register", async (RegisterRequest request, TennisCoachDbContext db, IPasswordHasher hasher, IJwtService jwt) =>
{
    // Validate input
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Name))
        return Results.BadRequest(new { error = "Email, password, and name are required" });

    if (request.Password.Length < 8)
        return Results.BadRequest(new { error = "Password must be at least 8 characters" });

    // Check if email already exists
    var existingCoach = await db.Coaches.FirstOrDefaultAsync(c => c.Email == request.Email.ToLowerInvariant());
    if (existingCoach is not null)
        return Results.BadRequest(new { error = "Email already registered" });

    // Create coach
    var coach = new Coach
    {
        Id = Guid.NewGuid(),
        Email = request.Email.ToLowerInvariant(),
        PasswordHash = hasher.Hash(request.Password),
        Name = request.Name,
        CreatedAt = DateTime.UtcNow
    };

    db.Coaches.Add(coach);
    await db.SaveChangesAsync();

    // Generate token
    var token = jwt.GenerateToken(coach.Id, coach.Email, coach.Name);

    return Results.Ok(new { data = new AuthResponse(token, new CoachInfo(coach.Id, coach.Email, coach.Name)) });
})
.WithName("Register")
.WithOpenApi();

authApi.MapPost("/login", async (LoginRequest request, TennisCoachDbContext db, IPasswordHasher hasher, IJwtService jwt) =>
{
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest(new { error = "Email and password are required" });

    var coach = await db.Coaches.FirstOrDefaultAsync(c => c.Email == request.Email.ToLowerInvariant());
    if (coach is null || !hasher.Verify(request.Password, coach.PasswordHash))
        return Results.Unauthorized();

    var token = jwt.GenerateToken(coach.Id, coach.Email, coach.Name);

    return Results.Ok(new { data = new AuthResponse(token, new CoachInfo(coach.Id, coach.Email, coach.Name)) });
})
.WithName("Login")
.WithOpenApi();

authApi.MapGet("/me", async (ClaimsPrincipal user, TennisCoachDbContext db) =>
{
    var coachId = GetCoachId(user);
    if (coachId is null)
        return Results.Unauthorized();

    var coach = await db.Coaches.FindAsync(coachId.Value);
    if (coach is null)
        return Results.Unauthorized();

    return Results.Ok(new { data = new CoachInfo(coach.Id, coach.Email, coach.Name) });
})
.RequireAuthorization()
.WithName("GetCurrentCoach")
.WithOpenApi();

// Training Sessions endpoints (behind feature flag, requires auth)
var sessionsApi = app.MapGroup("/api/training-sessions")
    .RequireAuthorization();

sessionsApi.MapGet("/", async (ClaimsPrincipal user, TennisCoachDbContext db, IFeatureFlagService flags) =>
{
    if (!flags.IsEnabled(FeatureFlags.TrainingSessionManagement))
        return Results.NotFound();

    var coachId = GetCoachId(user);
    if (coachId is null)
        return Results.Unauthorized();

    var sessions = await db.TrainingSessions
        .Where(s => s.CoachId == coachId.Value)
        .OrderByDescending(s => s.ScheduledAt)
        .Select(s => new TrainingSessionResponse(
            s.Id,
            s.ScheduledAt,
            s.DurationMinutes,
            s.Type,
            s.Status,
            s.Notes,
            s.CreatedAt,
            s.UpdatedAt))
        .ToListAsync();

    return Results.Ok(new { data = sessions });
})
.WithName("GetTrainingSessions")
.WithOpenApi();

sessionsApi.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal user, TennisCoachDbContext db, IFeatureFlagService flags) =>
{
    if (!flags.IsEnabled(FeatureFlags.TrainingSessionManagement))
        return Results.NotFound();

    var coachId = GetCoachId(user);
    if (coachId is null)
        return Results.Unauthorized();

    var session = await db.TrainingSessions.FirstOrDefaultAsync(s => s.Id == id && s.CoachId == coachId.Value);
    if (session is null)
        return Results.NotFound();

    var response = new TrainingSessionResponse(
        session.Id,
        session.ScheduledAt,
        session.DurationMinutes,
        session.Type,
        session.Status,
        session.Notes,
        session.CreatedAt,
        session.UpdatedAt);

    return Results.Ok(new { data = response });
})
.WithName("GetTrainingSession")
.WithOpenApi();

sessionsApi.MapPost("/", async (CreateTrainingSessionRequest request, ClaimsPrincipal user, TennisCoachDbContext db, IFeatureFlagService flags) =>
{
    if (!flags.IsEnabled(FeatureFlags.TrainingSessionManagement))
        return Results.NotFound();

    var coachId = GetCoachId(user);
    if (coachId is null)
        return Results.Unauthorized();

    var session = new TrainingSession
    {
        Id = Guid.NewGuid(),
        CoachId = coachId.Value,
        ScheduledAt = request.ScheduledAt,
        DurationMinutes = request.DurationMinutes,
        Type = request.Type,
        Status = SessionStatus.Scheduled,
        Notes = request.Notes,
        CreatedAt = DateTime.UtcNow
    };

    db.TrainingSessions.Add(session);
    await db.SaveChangesAsync();

    var response = new TrainingSessionResponse(
        session.Id,
        session.ScheduledAt,
        session.DurationMinutes,
        session.Type,
        session.Status,
        session.Notes,
        session.CreatedAt,
        session.UpdatedAt);

    return Results.Created($"/api/training-sessions/{session.Id}", new { data = response });
})
.WithName("CreateTrainingSession")
.WithOpenApi();

sessionsApi.MapPut("/{id:guid}", async (Guid id, UpdateTrainingSessionRequest request, ClaimsPrincipal user, TennisCoachDbContext db, IFeatureFlagService flags) =>
{
    if (!flags.IsEnabled(FeatureFlags.TrainingSessionManagement))
        return Results.NotFound();

    var coachId = GetCoachId(user);
    if (coachId is null)
        return Results.Unauthorized();

    var session = await db.TrainingSessions.FirstOrDefaultAsync(s => s.Id == id && s.CoachId == coachId.Value);
    if (session is null)
        return Results.NotFound();

    if (session.Status == SessionStatus.Cancelled)
        return Results.BadRequest(new { error = "Cannot update a cancelled session" });

    session.ScheduledAt = request.ScheduledAt;
    session.DurationMinutes = request.DurationMinutes;
    session.Type = request.Type;
    session.Notes = request.Notes;
    session.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    var response = new TrainingSessionResponse(
        session.Id,
        session.ScheduledAt,
        session.DurationMinutes,
        session.Type,
        session.Status,
        session.Notes,
        session.CreatedAt,
        session.UpdatedAt);

    return Results.Ok(new { data = response });
})
.WithName("UpdateTrainingSession")
.WithOpenApi();

sessionsApi.MapPost("/{id:guid}/cancel", async (Guid id, ClaimsPrincipal user, TennisCoachDbContext db, IFeatureFlagService flags) =>
{
    if (!flags.IsEnabled(FeatureFlags.TrainingSessionManagement))
        return Results.NotFound();

    var coachId = GetCoachId(user);
    if (coachId is null)
        return Results.Unauthorized();

    var session = await db.TrainingSessions.FirstOrDefaultAsync(s => s.Id == id && s.CoachId == coachId.Value);
    if (session is null)
        return Results.NotFound();

    if (session.Status == SessionStatus.Cancelled)
        return Results.BadRequest(new { error = "Session is already cancelled" });

    session.Status = SessionStatus.Cancelled;
    session.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    var response = new TrainingSessionResponse(
        session.Id,
        session.ScheduledAt,
        session.DurationMinutes,
        session.Type,
        session.Status,
        session.Notes,
        session.CreatedAt,
        session.UpdatedAt);

    return Results.Ok(new { data = response });
})
.WithName("CancelTrainingSession")
.WithOpenApi();

sessionsApi.MapPost("/{id:guid}/complete", async (Guid id, ClaimsPrincipal user, TennisCoachDbContext db, IFeatureFlagService flags) =>
{
    if (!flags.IsEnabled(FeatureFlags.TrainingSessionManagement))
        return Results.NotFound();

    var coachId = GetCoachId(user);
    if (coachId is null)
        return Results.Unauthorized();

    var session = await db.TrainingSessions.FirstOrDefaultAsync(s => s.Id == id && s.CoachId == coachId.Value);
    if (session is null)
        return Results.NotFound();

    if (session.Status != SessionStatus.Scheduled)
        return Results.BadRequest(new { error = "Only scheduled sessions can be marked as completed" });

    session.Status = SessionStatus.Completed;
    session.UpdatedAt = DateTime.UtcNow;

    await db.SaveChangesAsync();

    var response = new TrainingSessionResponse(
        session.Id,
        session.ScheduledAt,
        session.DurationMinutes,
        session.Type,
        session.Status,
        session.Notes,
        session.CreatedAt,
        session.UpdatedAt);

    return Results.Ok(new { data = response });
})
.WithName("CompleteTrainingSession")
.WithOpenApi();

app.Run();
