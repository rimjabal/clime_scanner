using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configuration de la base de données SQLite
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseSqlite("Data Source=database.sqlite"));
builder.Services.AddCors();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});
var app = builder.Build();
app.UseCors("AllowAll");

// Servir le fichier index.html (Dashboard)
app.UseDefaultFiles();
app.UseStaticFiles();

// Créer la base de données automatiquement au démarrage
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// --- ROUTES API ---

// 1. Sauvegarder un scan (POST)
app.MapPost("/api/logs", async (LogEntry log, AppDbContext db) =>
{
    log.Timestamp = DateTime.UtcNow; // L'heure dyal l'PC
    db.Logs.Add(log);
    await db.SaveChangesAsync();
    return Results.Ok(log);
});

// 2. Récupérer les données pour le dashboard (GET avec filtre optionnel par date corrigé)
app.MapGet("/api/logs", async (string? date, AppDbContext db) =>
{
    var query = db.Logs.AsQueryable();

    if (!string.IsNullOrEmpty(date) && DateTime.TryParse(date, out var parsedDate))
    {
        // Définir le début et la fin de la journée pour éviter les problèmes de fuseau horaire (UTC)
        var startDate = parsedDate.Date;
        var endDate = startDate.AddDays(1);
        
        query = query.Where(x => x.Timestamp >= startDate && x.Timestamp < endDate);
    }

    return await query.OrderByDescending(x => x.Timestamp).ToListAsync();
});

app.Run();

// --- MODÈLES ---
class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<LogEntry> Logs => Set<LogEntry>();
}

class LogEntry
{
    public int Id { get; set; }
    public string? Room { get; set; }
    public string? OperatorId { get; set; }
    public DateTime Timestamp { get; set; }
}