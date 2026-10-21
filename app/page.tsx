"use client";

import { useState } from "react";
import { useControlCenterStore } from "../lib/storage/store";
import { LoginPage } from "../components/LoginPage";
import { TopHeader } from "../components/TopHeader";
import { ExecutiveHeader } from "../components/ExecutiveHeader";
import { ActivityHeatmap } from "../components/ActivityHeatmap";
import { PhysiqueRadar } from "../components/PhysiqueRadar";
import { LeetCodeWidget } from "../components/LeetCodeWidget";
import { CodeforcesWidget } from "../components/CodeforcesWidget";
import { VisionDock } from "../components/VisionDock";
import { ExerciseLoggerModal } from "../components/ExerciseLoggerModal";

export default function HomePage() {
  const {
    currentUser,
    loginUser,
    logoutUser,
    profile,
    workouts,
    addWorkout,
    bodyweightLogs,
    codingProblems,
    addCodingProblem,
    deleteCodingProblem,
    habitCompletions,
  } = useControlCenterStore();

  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  // If not logged in, present the Login page first
  if (!currentUser) {
    return <LoginPage onLoginSuccess={loginUser} />;
  }

  const handleSaveWorkout = (name: string, sets: any[]) => {
    const totalVolume = sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);
    addWorkout({
      name,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      notes: "Logged via mobile control center",
      totalVolumeKg: totalVolume,
      sets,
    });
  };

  return (
    <>
      <TopHeader
        profile={profile}
        onQuickAdd={() => setIsExerciseModalOpen(true)}
        onLogout={logoutUser}
        onOpenCommandMenu={() => setIsExerciseModalOpen(true)}
      />

      <main className="flex-col relative w-full pt-14 pb-28 bg-[#000000]">
        <div className="flex flex-col w-full max-w-lg mx-auto text-white px-4 pt-3 pb-8 gap-5">
          {/* 1. Top Progress Bar & Level Telemetry */}
          <ExecutiveHeader profile={profile} />

          {/* Quick Action: Log Exercise Button */}
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
              Active Telemetry
            </span>
            <button
              onClick={() => setIsExerciseModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-apple-blue/15 hover:bg-apple-blue/25 text-apple-blue text-xs font-semibold border border-apple-blue/30 flex items-center gap-1.5 apple-spring-press shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">fitness_center</span>
              <span>Search &amp; Log Exercise</span>
            </button>
          </div>

          {/* 2. 84-Day Activity Heatmap */}
          <ActivityHeatmap
            habitCompletions={habitCompletions}
            workouts={workouts}
            codingProblems={codingProblems}
          />

          {/* 3. Physique RPG Matrix */}
          <PhysiqueRadar
            workouts={workouts}
            bodyweightLogs={bodyweightLogs}
            currentBodyweightKg={profile.currentBodyweightKg}
          />

          {/* 4. LeetCode Progress Widget */}
          <LeetCodeWidget
            problems={codingProblems}
            onAddProblem={addCodingProblem}
            onDeleteProblem={deleteCodingProblem}
          />

          {/* 5. Codeforces Progress Widget */}
          <CodeforcesWidget
            problems={codingProblems}
            onAddProblem={addCodingProblem}
            onDeleteProblem={deleteCodingProblem}
          />
        </div>
      </main>

      {/* Real Exercise Search & Logging Modal */}
      <ExerciseLoggerModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        userBodyweightKg={profile.currentBodyweightKg}
        onSaveWorkout={handleSaveWorkout}
      />

      {/* VisionOS Floating Dock */}
      <VisionDock />
    </>
  );
}
