"use client";

import { useControlCenterStore } from "../lib/storage/store";
import { TopHeader } from "../components/TopHeader";
import { ExecutiveHeader } from "../components/ExecutiveHeader";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { PhysiqueRadar } from "../components/PhysiqueRadar";
import { LeetCodeWidget } from "../components/LeetCodeWidget";
import { CodeforcesWidget } from "../components/CodeforcesWidget";
import { VisionDock } from "../components/VisionDock";
import { AuthBarrier } from "../components/AuthBarrier";

export default function HomePage() {
  const {
    profile,
    updateProfile,
    workouts,
    codingProblems,
    addCodingProblem,
    habitCompletions,
    bodyweightLogs,
  } = useControlCenterStore();

  return (
    <AuthBarrier>
      {/* Top Header & Account Actions */}
      <TopHeader profile={profile} />

      <main className="flex-col relative w-full pt-16 pb-28 bg-[#000000]">
        <div className="flex flex-col w-full max-w-lg mx-auto text-white px-4 pt-3 pb-8 gap-5">
          {/* 1. Top Progress Bar & Identity Telemetry */}
          <ExecutiveHeader profile={profile} />

          {/* 2. 84-Day Activity Heatmap */}
          <ActivityHeatmap
            habitCompletions={habitCompletions}
            workouts={workouts}
            codingProblems={codingProblems}
          />

          {/* 3. Physique Matrix (8-Axis Radar Chart) */}
          <PhysiqueRadar
            workouts={workouts}
            bodyweightLogs={bodyweightLogs}
            currentBodyweightKg={profile.currentBodyweightKg}
          />

          {/* 4. LeetCode Progress & Telemetry Widget */}
          <LeetCodeWidget
            problems={codingProblems}
            onAddProblem={addCodingProblem}
            savedUsername={profile.leetcodeUsername}
            onUpdateUsername={(username) => updateProfile({ leetcodeUsername: username })}
          />

          {/* 5. Codeforces Rating & Telemetry Widget */}
          <CodeforcesWidget
            problems={codingProblems}
            onAddProblem={addCodingProblem}
            savedHandle={profile.codeforcesUsername}
            onUpdateHandle={(handle) => updateProfile({ codeforcesUsername: handle })}
          />
        </div>
      </main>

      {/* Floating Navigation Dock */}
      <VisionDock />
    </AuthBarrier>
  );
}
