namespace golfsimz_v2.Models;

public class ShotInput
{
    public float BallSpeedMph { get; set; } = 150f;
    public float LaunchAngleDeg { get; set; } = 12f;
    public float SideAngleDeg { get; set; } = 0f;
    public float BackspinRpm { get; set; } = 2500f;
}
