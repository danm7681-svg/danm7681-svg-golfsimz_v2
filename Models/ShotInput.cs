namespace golfsimz_v2.Models
{
    public class ShotInput
    {
        public string Club { get; set; } = "7 Iron";
        public int ClubNumber { get; set; } = 7;          // NEW
        public float BallSpeedMph { get; set; } = 120f;
        public float LaunchAngleDeg { get; set; } = 21f;
        public float SideAngleDeg { get; set; } = 0f;
        public float BackspinRpm { get; set; } = 7500f;
        public float SidespinRpm { get; set; } = 0f;
        public float SpinAxisDeg { get; set; } = 0f;      // NEW
    }
}