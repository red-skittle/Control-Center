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
    "Click any day to inspect activity"
  );

  // Apple Blue Luminance Spectrum
  const colors = [
    "bg-white/10", // 0 None
    "bg-[#003870]", // 1 Low
    "bg-[#0055A5]", // 2 Mid
    "bg-[#0077E6]", // 3 High
    "bg-[#0A84FF]", // 4 Peak Apple Blue
  ];

  const todayIso = new Date().toISOString().slice(0, 10);
  const codingStreak = calculateCodingStreak(
    codingProblems.map((cp) => cp.dateSolved),
    todayIso
  );

  // Generate 84 days grid (12 weeks x 7 days)
  const totalDays = 84;
  const today = new Date();

  const cells = Array.from({ length: totalDays }).map((_, idx) => {
    // Days counting backwards: cell 83 is today (day -0), cell 0 is day -83
    const dayOffset = totalDays - 1 - idx;
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    const dateStr = date.toISOString().slice(0, 10);

    // Real activity counts for this day
    const habitsCount = habitCompletions.filter((h) => h.completionDate === dateStr).length;
    const workoutsCount = workouts.filter((w) => w.startedAt?.startsWith(dateStr) || w.completedAt?.startsWith(dateStr)).length;
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

  const totalActiveDays = cells.filter((c) => c.totalActions > 0).length;
  const consistencyPct = Math.round((totalActiveDays / totalDays) * 100);

  const handleCellClick = (cell: (typeof cells)[0]) => {
    if (cell.totalActions === 0) {
      setSelectedDayInfo(`${cell.dateStr}: No sessions recorded`);
    } else {
      setSelectedDayInfo(
        `${cell.dateStr}: ${cell.codingCount} Problem(s), ${cell.workoutsCount} Workout(s)`
      );
    }
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
          <span>{totalActiveDays} Active Days</span>
        </div>
      </div>

      {/* Real Streak Summary Counters */}
      <div className="grid grid-cols-3 gap-2 py-0.5">
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[10px] text-neutral-400 block uppercase">Code Streak</span>
          <span className="text-sm font-mono font-bold text-white mt-0.5">
            {codingStreak.currentStreak} <span className="text-[10px] font-normal text-neutral-400">days</span>
          </span>
        </div>
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[10px] text-neutral-400 block uppercase">Solves Total</span>
          <span className="text-sm font-mono font-bold text-amber-400 mt-0.5">
            {codingProblems.length} <span className="text-[10px] font-normal text-neutral-400">problems</span>
          </span>
        </div>
        <div className="apple-glass-card p-2.5 text-center">
          <span className="text-[10px] text-neutral-400 block uppercase">Workouts Logged</span>
          <span className="text-sm font-mono font-bold text-apple-green mt-0.5">
            {workouts.length} <span className="text-[10px] font-normal text-neutral-400">sessions</span>
          </span>
        </div>
      </div>

      {/* 7x12 Heatmap Grid */}
      <div className="flex flex-col gap-1 overflow-x-auto pb-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
          <span>12 WEEKS AGO</span>
          <span>4 WEEKS AGO</span>
          <span>TODAY</span>
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 w-max self-center my-1.5">
          {cells.map((cell, idx) => (
            <div
              key={idx}
              onClick={() => handleCellClick(cell)}
              className={`w-2.5 h-2.5 rounded-[3px] ${colors[cell.level]} cursor-pointer transition-transform hover:scale-150`}
              title={`${cell.dateStr}: ${cell.totalActions} logged actions`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 px-1">
          <span className="truncate max-w-[200px] text-[10px] font-mono text-apple-blue">
            {selectedDayInfo}
          </span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-neutral-500">Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#003870]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0055A5]" />
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0A84FF]" />
            <span className="text-neutral-500">More</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-neutral-400">
        <span>
          Max Code Streak:{" "}
          <strong className="text-white font-semibold font-mono">{codingStreak.longestStreak} Days</strong>
        </span>
        <span>
          Active Ratio:{" "}
          <strong className="text-apple-blue font-semibold font-mono">{consistencyPct}%</strong>
        </span>
      </div>
    </section>
  );
}
