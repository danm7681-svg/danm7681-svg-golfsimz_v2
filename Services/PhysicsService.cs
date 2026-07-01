using System;
using System.Collections.Generic;
using golfsimz_v2.Models;

namespace golfsimz_v2.Services;

public class PhysicsService : IPhysicsService
{
    private const float G = 9.81f;
    private const float Mass = 0.04593f;
    private const float Radius = 0.021335f;
    private const float Rho = 1.225f;
    private const float Mu = 1.81e-5f;
    private const float CdLow = 0.215f;
    private const float CdHigh = 0.45f;
    private const float ClGain = 0.275f;
    private const float ClExp = 0.55f;
    private const float ClMax = 0.42f;
    private const float SpinDecayBase = 0.0205f;
    private const float SpinDecayFactor = 0.0011f;

    public SimulationResult Simulate(ShotInput input)
    {
        // Convert inputs
        float speedMs = input.BallSpeedMph * 0.44704f;
        float launchRad = input.LaunchAngleDeg * MathF.PI / 180f;
        float sideRad = input.SideAngleDeg * MathF.PI / 180f;

        float vx = speedMs * MathF.Cos(launchRad) * MathF.Sin(sideRad);
        float vy = speedMs * MathF.Sin(launchRad);
        float vz = speedMs * MathF.Cos(launchRad) * MathF.Cos(sideRad);
        float omega = (input.BackspinRpm * 2f * MathF.PI) / 60f;

        State state = new State { x = 0, y = 0.01f, z = 0, vx = vx, vy = vy, vz = vz, omega = omega };
        float dt = 0.001f; // 1ms time step
        float time = 0f;
        List<TrajectoryPoint> trajectory = new List<TrajectoryPoint>();
        float maxHeight = 0f;

        while (time < 15f && state.y >= 0f)
        {
            state = RK4Step(state, dt);
            time += dt;

            // Record points every 30ms for smooth trajectory
            if (time % 0.03f < 0.001f)
            {
                trajectory.Add(new TrajectoryPoint
                {
                    Time = time,
                    DownrangeYards = state.z * 1.09361f,
                    AltitudeFeet = state.y * 3.28084f,
                    OfflineYards = state.x * 1.09361f
                });
            }

            if (state.y > maxHeight) maxHeight = state.y;
        }

        // Calculate landing angle
        float landAngle = MathF.Atan2(MathF.Abs(state.vy), MathF.Abs(state.vz)) * 180f / MathF.PI;

        // Simple roll calculation (placeholder – can be improved)
        float rollYards = 0f;
        if (landAngle < 30f) rollYards = state.z * 0.12f * 1.09361f;
        else if (landAngle < 45f) rollYards = 4f;
        else rollYards = -1f;

        return new SimulationResult
        {
            CarryYards = state.z * 1.09361f,
            TotalYards = state.z * 1.09361f + rollYards,
            ApexFeet = maxHeight * 3.28084f,
            HangTimeSeconds = time,
            OfflineYards = state.x * 1.09361f,
            LandingAngleDeg = landAngle,
            Trajectory = trajectory
        };
    }

    private State Dynamics(State s)
    {
        float V = MathF.Sqrt(s.vx * s.vx + s.vy * s.vy + s.vz * s.vz);
        if (V < 0.001f) return new State();

        float Re = (Rho * V * 2 * Radius) / Mu;
        float Sr = (Radius * MathF.Abs(s.omega)) / V;

        // Drag coefficient with Reynolds transition
        float trans = 1f / (1f + MathF.Exp((Re - 80000f) / 15000f));
        float Cd = (CdHigh * trans + CdLow * (1f - trans)) + 0.11f * Sr;

        // Lift coefficient with spin scaling
        float Cl = ClGain * MathF.Pow(Sr, ClExp);
        Cl = MathF.Min(Cl, ClMax) * MathF.Sign(s.omega);

        float qA = 0.5f * Rho * V * V * MathF.PI * Radius * Radius;
        float Fd = qA * Cd;
        float Fl = qA * Cl;

        float cosPhi = s.vx / V;
        float sinPhi = s.vy / V;

        float ax = (-Fd * cosPhi - Fl * sinPhi) / Mass;
        float ay = (-G * Mass - Fd * sinPhi + Fl * cosPhi) / Mass;
        float az = 0f;

        float decay = SpinDecayBase * (1f + SpinDecayFactor * MathF.Abs(s.omega));
        float domega = -decay * s.omega;

        return new State
        {
            x = s.vx, y = s.vy, z = s.vz,
            vx = ax, vy = ay, vz = az,
            omega = domega
        };
    }

    private State RK4Step(State s, float dt)
    {
        State k1 = Dynamics(s);
        State k2 = Dynamics(s + k1 * (dt * 0.5f));
        State k3 = Dynamics(s + k2 * (dt * 0.5f));
        State k4 = Dynamics(s + k3 * dt);

        return s + (dt / 6f) * (k1 + 2f * k2 + 2f * k3 + k4);
    }

    private struct State
    {
        public float x, y, z;
        public float vx, vy, vz;
        public float omega;

        public static State operator +(State a, State b) => new State
        {
            x = a.x + b.x, y = a.y + b.y, z = a.z + b.z,
            vx = a.vx + b.vx, vy = a.vy + b.vy, vz = a.vz + b.vz,
            omega = a.omega + b.omega
        };

        public static State operator *(State a, float b) => new State
        {
            x = a.x * b, y = a.y * b, z = a.z * b,
            vx = a.vx * b, vy = a.vy * b, vz = a.vz * b,
            omega = a.omega * b
        };

        public static State operator *(float b, State a) => a * b;
    }
}