"use client";

import { useState } from "react";
import { HabitCompletion, WorkoutSession, CodingProblemEntry } from "../lib/storage/store";
import { calculateCodingStreak } from "../lib/fitness-calc";

interface ActivityHeatmapProps {
  habitCompletions: HabitCompletion[];
  workouts: WorkoutSession[];
  codingProblems: CodingProblemEntry[];
}

export function ActivityHeatmap({
  habitCompletions,
  workouts,
  codingProblems,
}: ActivityHeatmapProps) {
  const [selectedDayInfo, setSelectedDayInfo] = useState<string>(
    "Select a node to inspect logs"
  );

  // Apple Blue Luminance Spectrum
  const colors = [
    "bg-white/10", // 0 None
    "bg-[#003870]", // 1 Low
    "bg-[#0055A5]", // 2 Mid
    "bg-[#0077E6]", // 3 High
    "bg-[#0A84FF]", // 4 Peak Apple Blue
  ];

  const codingStreak = calculateCodingStreak(
    codingProblems.map((cp) => cp.dateSolved),
    "2026-10-21"
  );

  // Generate 84 days grid (12 weeks x 7 days)
  const totalDays = 84;
  const today = new Date("2026-10-21T12:00:00Z");

  const cells = Array.from({ length: totalDays }).map((_, idx) => {
    // Days counting backwards: cell 83 is today (day -0), cell 0 is day -83
    const dayOffset = totalDays - 1 - idx;
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - dayOffset);
    const dateStr = date.toISOString().slice(0, 10);

    // Count completions for this day
    const habitsCount = habitCompletions.filter((h) => h.completionDate === dateStr).length;
    const workoutsCount = workouts.filter((w) => w.startedAt.startsWith(dateStr)).length;
    const codingCount = codingProblems.filter((c) => c.dateSolved === dateStr).length;

    const totalActions = habitsCount + workoutsCount * 2 + codingCount * 2;
    let level = 0;
    if (totalActions >= 5) level = 4;
    else if (totalActions >= 3) level = 3;
    else if (totalActions >= 2) level = 2;
    else if (totalActions >= 1) level = 1;

    return {
      dayOffset,
      dateStr,
      level,
      habitsCount,
      workoutsCount,
      codingCount,
      totalActions,
    };
  });

  const handleCellClick = (cell: (typeof cells)[0]) => {
    setSelectedDayInfo(
      `${cell.dateStr}: ${cell.codingCount} LC/CF, ${cell.workoutsCount} workout, ${cell.habitsCount} habits logged.`
    );
  };

  return (
    <section className="apple-glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
            Consistency Telemetry
          </span>
          <span className="text-sm font-semibold text-white">
            84-Day Activity Heatmap
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs text-apple-blue font-semibold bg-apple-blue/10 px-2 py-0.5 rounded-full border border-apple-blue/20">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          <span>94% Ratio</span>
        </div>
      </div>

      {/* Streak Summary Counters */}
      <div className="grid grid-cols-3 gap-2 py-0.5">
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[11px] text-apple-labelTertiary block">Code Streak</span>
          <span className="text-xs font-mono font-semibold text-white">
            {codingStreak.currentStreak} Days
          </span>
        </div>
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[11px] text-apple-labelTertiary block">Habits</span>
          <span className="text-xs font-mono font-semibold text-apple-orange">
            18 Days
          </span>
        </div>
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[11px] text-apple-labelTertiary block">Workout</span>
          <span className="text-xs font-mono font-semibold text-apple-green">
            4 d/wk
          </span>
        </div>
      </div>

      {/* 7x12 Heatmap Grid */}
      <div className="flex flex-col gap-1 overflow-x-auto pb-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-apple-labelTertiary px-1">
          <span>AUG</span>
          <span>SEP</span>
          <span>OCT (CURRENT)</span>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max self-center my-1">
          {cells.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleCellClick(cell)}
              className={`w-2.5 h-2.5 rounded-[3px] ${colors[cell.level]} cursor-pointer transition-transform hover:scale-150`}
              title={`${cell.dateStr}: Level ${cell.level}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-apple-labelSecondary pt-1 px-1">
          <span className="truncate max-w-[200px] text-[10px] font-mono text-apple-blue">
            {selectedDayInfo}
          </span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-apple-labelTertiary">Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-white/10"></span>
            <span className="w-2.5 h-2.5 rounded-sm bg-[#003870]"></span>
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0055A5]"></span>
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0A84FF]"></span>
            <span className="text-apple-labelTertiary">More</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-apple-labelSecondary">
        <span>
          Max Streak:{" "}
          <strong className="text-white font-semibold font-mono">64 Days</strong>
        </span>
        <span>
          Active Disciplines:{" "}
          <strong className="text-apple-blue font-semibold font-mono">4 / 4</strong>
        </span>
      </div>
    </section>
  );
}
