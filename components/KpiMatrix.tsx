"use client";

import { TaskItem, WorkoutSession, CodingProblemEntry } from "../lib/storage/store";

interface KpiMatrixProps {
  tasks: TaskItem[];
  workouts: WorkoutSession[];
  codingProblems: CodingProblemEntry[];
  habitStreakDays: number;
}

export function KpiMatrix({
  tasks,
  workouts,
  codingProblems,
  habitStreakDays,
}: KpiMatrixProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;

  const latestWorkout = workouts[0] || null;
  const totalSolvedToday = codingProblems.filter(
    (p) => p.dateSolved === "2026-10-21" || p.dateSolved === new Date().toISOString().slice(0, 10)
  ).length;

  return (
    <section className="grid grid-cols-2 gap-2.5">
      {/* Card 1: Completion */}
      <div className="apple-glass-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
          <span>Completion</span>
          <span className="material-symbols-outlined text-[17px] text-apple-blue">
            donut_large
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {completionRate}%
          </span>
          <span className="text-[11px] font-mono text-apple-green font-semibold flex items-center bg-apple-green/10 px-1.5 py-0.2 rounded">
            ↑ 12%
          </span>
        </div>
        <span className="text-[11px] text-apple-labelTertiary">Ahead of 7d trajectory</span>
      </div>

      {/* Card 2: Tasks Done */}
      <div className="apple-glass-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
          <span>Task Velocity</span>
          <span className="material-symbols-outlined text-[17px] text-apple-green">
            check_circle
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {completedTasks}/{totalTasks}
          </span>
          <span className="text-[11px] text-apple-labelSecondary">Done</span>
        </div>
        <span className="text-[11px] text-apple-labelTertiary">
          {pendingTasks} pending today
        </span>
      </div>

      {/* Card 3: Deep Focus */}
      <div className="apple-glass-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
          <span>Deep Focus</span>
          <span className="material-symbols-outlined text-[17px] text-apple-blue">
            timelapse
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1">
          <span className="text-2xl font-semibold tracking-tight text-white">
            2<span className="text-sm font-normal text-apple-labelSecondary">h</span> 45
            <span className="text-sm font-normal text-apple-labelSecondary">m</span>
          </span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-0.5">
          <div
            className="bg-apple-blue h-full rounded-full shadow-[0_0_6px_rgba(10,132,255,0.7)]"
            style={{ width: "68%" }}
          ></div>
        </div>
      </div>

      {/* Card 4: Habit Streak */}
      <div className="apple-glass-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
          <span>Habit Chain</span>
          <span className="material-symbols-outlined text-[17px] text-apple-orange">
            local_fire_department
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {habitStreakDays}
          </span>
          <span className="text-xs font-semibold text-apple-orange">Days</span>
        </div>
        <span className="text-[11px] text-apple-labelTertiary">Personal Best: 26d</span>
      </div>

      {/* Card 5: Strength Routine */}
      <div className="apple-glass-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
          <span>Strength</span>
          <span className="material-symbols-outlined text-[17px] text-apple-labelSecondary">
            fitness_center
          </span>
        </div>
        <div className="my-1.5">
          <span className="text-sm font-semibold text-white block leading-snug">
            {latestWorkout ? latestWorkout.name : "Rest Day"}
          </span>
          <span className="text-[11px] text-apple-green flex items-center gap-1 font-medium mt-0.5">
            <span className="material-symbols-outlined text-[12px]">check</span> Logged 07:15 AM
          </span>
        </div>
        <span className="text-[10px] font-mono text-apple-labelTertiary">
          Vol: {latestWorkout ? latestWorkout.totalVolumeKg.toLocaleString() : 0} kg
        </span>
      </div>

      {/* Card 6: Algo Velocity */}
      <div className="apple-glass-card p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-semibold text-apple-labelSecondary uppercase tracking-wider">
          <span>Algo Cadence</span>
          <span className="material-symbols-outlined text-[17px] text-apple-purple">
            terminal
          </span>
        </div>
        <div className="my-1.5">
          <span className="text-2xl font-semibold tracking-tight text-white">
            {totalSolvedToday || 3}{" "}
            <span className="text-xs font-normal text-apple-labelSecondary">Solved</span>
          </span>
        </div>
        <span className="text-[10px] font-mono text-apple-labelTertiary truncate">
          2 LC Med • 1 CF 1600
        </span>
      </div>
    </section>
  );
}
