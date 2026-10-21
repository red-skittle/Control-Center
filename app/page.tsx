"use client";

import { useControlCenterStore } from "../lib/storage/store";
import { TopHeader } from "../components/TopHeader";
import { ExecutiveHeader } from "../components/ExecutiveHeader";
import { KpiMatrix } from "../components/KpiMatrix";
import { CommandLaunchpad } from "../components/CommandLaunchpad";
import { PomodoroTimer } from "../components/PomodoroTimer";
import { ExecutionEngine } from "../components/ExecutionEngine";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { PhysiqueRadar } from "../components/PhysiqueRadar";
import { EnduranceCard } from "../components/EnduranceCard";
import { AlgoLog } from "../components/AlgoLog";
import { ChronologicalProtocol } from "../components/ChronologicalProtocol";
import { VisionDock } from "../components/VisionDock";

export default function HomePage() {
  const {
    profile,
    tasks,
    toggleTask,
    addTask,
    deleteTask,
    workouts,
    runs,
    codingProblems,
    habitCompletions,
    bodyweightLogs,
    calendarEvents,
  } = useControlCenterStore();

  const handleLaunchpadAction = (
    action: "pomodoro" | "task" | "workout" | "code" | "note"
  ) => {
    if (action === "task") {
      const input = document.getElementById("quick-task-input");
      if (input) input.focus();
    } else if (action === "workout") {
      addTask("Logged Hypertrophy Strength Session", "high", "FITNESS");
    } else if (action === "code") {
      addTask("LC Daily 15-Minute Problem Solve", "high", "ALGO");
    } else if (action === "note") {
      addTask("Consolidate daily engineering learnings", "medium", "HABIT");
    }
  };

  return (
    <>
      <TopHeader
        profile={profile}
        onQuickAdd={() => {
          const input = document.getElementById("quick-task-input");
          if (input) input.focus();
        }}
        onOpenCommandMenu={() => {
          alert(
            "Command Palette:\n⌘1: Focus\n⌘2: Quick Task\n⌘3: Workout\n⌘4: Solve LC\n⌘5: Daily Note"
          );
        }}
      />

      <main className="flex-col relative w-full pt-14 pb-28 bg-[#000000]">
        <div className="flex flex-col w-full max-w-lg mx-auto text-white px-4 pt-3 pb-8 gap-5">
          {/* Executive Header & XP Telemetry */}
          <ExecutiveHeader profile={profile} />

          {/* KPI Metric Matrix */}
          <KpiMatrix
            tasks={tasks}
            workouts={workouts}
            codingProblems={codingProblems}
            habitStreakDays={18}
          />

          {/* Command Launchpad */}
          <CommandLaunchpad onTriggerAction={handleLaunchpadAction} />

          {/* Neural Focus Engine */}
          <PomodoroTimer />

          {/* Execution Engine */}
          <ExecutionEngine
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={(title) => addTask(title)}
            onDeleteTask={deleteTask}
          />

          {/* 84-Day Activity Heatmap */}
          <ActivityHeatmap
            habitCompletions={habitCompletions}
            workouts={workouts}
            codingProblems={codingProblems}
          />

          {/* Physique RPG Radar Chart */}
          <PhysiqueRadar
            workouts={workouts}
            bodyweightLogs={bodyweightLogs}
            currentBodyweightKg={profile.currentBodyweightKg}
          />

          {/* Separate Cardiovascular & Aerobic Endurance */}
          <EnduranceCard
            runs={runs}
            weeklyTargetKm={profile.weeklyRunningTargetKm}
          />

          {/* Algorithmic Log & Competitive Telemetry */}
          <AlgoLog problems={codingProblems} />

          {/* Chronological Protocol Schedule */}
          <ChronologicalProtocol events={calendarEvents} />
        </div>
      </main>

      {/* VisionOS Floating Dock */}
      <VisionDock />
    </>
  );
}
