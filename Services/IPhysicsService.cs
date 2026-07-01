using golfsimz_v2.Models;

namespace golfsimz_v2.Services;

public interface IPhysicsService
{
    SimulationResult Simulate(ShotInput input);
}