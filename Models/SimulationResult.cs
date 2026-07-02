namespace golfsimz_v2.Models;

public class SimulationResult
{
    public float CarryYards { get; set; }
    public float TotalYards { get; set; }
    public float ApexFeet { get; set; }
    public float HangTimeSeconds { get; set; }
    public float OfflineYards { get; set; }
    public float LandingAngleDeg { get; set; }
    public List<TrajectoryPoint> Trajectory { get; set; } = new();
}
