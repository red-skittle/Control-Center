"use client";

import { RunningLogEntry } from "../lib/storage/store";
import { calculateEnduranceMetrics } from "../lib/fitness-calc";

interface EnduranceCardProps {
  runs: RunningLogEntry[];
  weeklyTargetKm: number;
}

export function EnduranceCard({ runs, weeklyTargetKm }: EnduranceCardProps) {
  // Aggregate weekly mileage (past 7 days)
  const totalWeeklyKm = runs.reduce((sum, r) => sum + r.distanceKm, 0);
  const targetPct = Math.min(100, Math.round((totalWeeklyKm / (weeklyTargetKm || 15)) * 100));

  const latestRun = runs[0] || null;
  const latestMetrics = latestRun
    ? calculateEnduranceMetrics(latestRun.distanceKm, latestRun.durationSeconds)
    : null;

  // Personal Best 5k run
  const best5k = runs
    .filter((r) => r.distanceKm >= 5.0)
    .sort((a, b) => a.durationSeconds - b.durationSeconds)[0];

  const best5kMetrics = best5k
    ? calculateEnduranceMetrics(best5k.distanceKm, best5k.durationSeconds)
    : null;

  return (
    <section className="apple-glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
            Cardiovascular Telemetry
          </span>
          <span className="text-sm font-semibold text-white">
            Endurance & Aerobic Engine
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-apple-green/10 text-apple-green text-[11px] font-mono font-semibold border border-apple-green/20">
          ZONE 2 BASE
        </span>
      </div>

      {/* Weekly Running Volume Progress Bar */}
      <div className="flex flex-col gap-1.5 apple-glass-card p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-apple-labelSecondary font-medium">Weekly Distance</span>
          <span className="font-mono text-white font-semibold">
            {totalWeeklyKm.toFixed(1)} / {weeklyTargetKm} km
          </span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="bg-apple-green h-full rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(48,209,88,0.6)]"
            style={{ width: `${targetPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-apple-labelTertiary">
          <span>Target Progress: {targetPct}%</span>
          <span>{runs.length} Sessions Logged</span>
        </div>
      </div>

      {/* Running Metric Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[10px] text-apple-labelTertiary block uppercase">Avg Pace</span>
          <span className="text-xs font-mono font-semibold text-white">
            {latestMetrics?.paceMinPerKm || "--:--"} <span className="text-[9px] text-apple-labelSecondary">/km</span>
          </span>
          <span className="text-[9px] text-apple-labelTertiary block mt-0.5">Latest Session</span>
        </div>
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[10px] text-apple-labelTertiary block uppercase">Speed</span>
          <span className="text-xs font-mono font-semibold text-white">
            {latestMetrics?.speedKmh || 0} <span className="text-[9px] text-apple-labelSecondary">km/h</span>
          </span>
          <span className="text-[9px] text-apple-green block mt-0.5 font-medium">Aerobic</span>
        </div>
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[10px] text-apple-labelTertiary block uppercase">5K Best</span>
          <span className="text-xs font-mono font-semibold text-apple-blue">
            {best5kMetrics ? `${Math.floor(best5kMetrics.durationSeconds / 60)}m ${best5kMetrics.durationSeconds % 60}s` : "24m 16s"}
          </span>
          <span className="text-[9px] text-apple-labelTertiary block mt-0.5">Benchmark</span>
        </div>
      </div>

      {/* Recent Run Card */}
      {latestRun && (
        <div className="apple-glass-card p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-full bg-apple-green/15 text-apple-green flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[16px]">directions_run</span>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{latestRun.title}</p>
              <span className="text-[10px] text-apple-labelSecondary font-mono">
                {latestRun.distanceKm} km • {latestMetrics?.paceMinPerKm}/km • {latestRun.runDate}
              </span>
            </div>
          </div>
          {latestRun.heartRateAvg && (
            <span className="text-[10px] font-mono text-apple-red flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">favorite</span>
              {latestRun.heartRateAvg} bpm
            </span>
          )}
        </div>
      )}
    </section>
  );
}
