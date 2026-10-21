"use client";

import { useState } from "react";
import Link from "next/link";
import { useControlCenterStore, WorkoutSetItem } from "../../lib/storage/store";
import { TopHeader } from "../../components/TopHeader";
import { VisionDock } from "../../components/VisionDock";
import { LoginPage } from "../../components/LoginPage";
import { REAL_EXERCISES_DATABASE, ExerciseItem } from "../../lib/exercises";
import {
  calculateE1RM,
  calculateRelativeStrength,
} from "../../lib/fitness-calc";

export default function FitnessPage() {
  const { currentUser, loginUser, logoutUser, profile, workouts, addWorkout } =
    useControlCenterStore();

  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutName, setWorkoutName] = useState("Hypertrophy Session");
  const [activeSets, setActiveSets] = useState<WorkoutSetItem[]>([]);

  // Exercise selection & search state
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem>(
    REAL_EXERCISES_DATABASE[0]
  );
  const [inputWeight, setInputWeight] = useState("80");
  const [inputReps, setInputReps] = useState("5");

  // Calculator state
  const [calcWeight, setCalcWeight] = useState(80);
  const [calcReps, setCalcReps] = useState(5);
  const calculatedE1rm = calculateE1RM(calcWeight, calcReps);
  const calculatedRatio = calculateRelativeStrength(
    calculatedE1rm,
    profile.currentBodyweightKg
  );

  if (!currentUser) {
    return <LoginPage onLoginSuccess={loginUser} />;
  }

  const filteredExercises = REAL_EXERCISES_DATABASE.filter((ex) => {
    if (muscleFilter !== "all" && ex.primaryMuscle !== muscleFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscle.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddSetToActive = () => {
    const newSet: WorkoutSetItem = {
      id: "set-" + Date.now(),
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      setNumber: activeSets.length + 1,
      reps: parseInt(inputReps) || 5,
      weightKg: parseFloat(inputWeight) || 0,
      completed: true,
    };
    setActiveSets((prev) => [...prev, newSet]);
  };

  const handleFinishWorkout = () => {
    const completedSets = activeSets.filter((s) => s.completed);
    if (completedSets.length === 0) {
      alert("No completed sets logged. Complete at least one set to record workout.");
      return;
    }

    const volume = completedSets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);

    addWorkout({
      name: workoutName,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      notes: "Logged via Control Center fitness engine.",
      totalVolumeKg: volume,
      sets: completedSets,
    });

    setActiveSets([]);
    setIsWorkoutActive(false);
    alert(`Workout '${workoutName}' saved! Volume: ${volume.toLocaleString()} kg.`);
  };

  const handleCancelWorkout = () => {
    if (confirm("Discard this unfinished workout? Incomplete sets will not be saved.")) {
      setActiveSets([]);
      setIsWorkoutActive(false);
    }
  };

  return (
    <>
      <TopHeader profile={profile} onLogout={logoutUser} />

      <main className="flex-col relative w-full pt-16 pb-28 bg-[#000000]">
        <div className="flex flex-col w-full max-w-lg mx-auto text-white px-4 pt-3 pb-8 gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/"
                className="text-[11px] font-semibold uppercase tracking-wider text-apple-blue flex items-center gap-1 mb-1"
              >
                <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                Dashboard
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Strength &amp; Workout Engine
              </h1>
            </div>
            {!isWorkoutActive ? (
              <button
                onClick={() => setIsWorkoutActive(true)}
                className="px-3 py-1.5 rounded-full bg-apple-green text-black font-semibold text-xs apple-spring-press flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                Start Workout
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-apple-blue/20 text-apple-blue text-xs font-mono font-semibold animate-pulse border border-apple-blue/30">
                LIVE SESSION
              </span>
            )}
          </div>

          {/* ACTIVE WORKOUT LOGGING PANEL */}
          {isWorkoutActive && (
            <section className="apple-glass-panel p-4 flex flex-col gap-3.5 border-apple-blue/50 animate-in fade-in">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-white border-b border-white/20 pb-0.5 focus:outline-none focus:border-apple-blue w-2/3"
                />
                <span className="text-[11px] font-mono text-apple-green font-medium">
                  {activeSets.filter((s) => s.completed).length} Logged
                </span>
              </div>

              {/* Real Exercise Search & Select */}
              <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
                <span className="text-[10px] font-mono uppercase text-apple-labelSecondary">
                  Select From 60+ Real Exercises:
                </span>

                <div className="apple-glass-card px-3 py-1.5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-apple-labelTertiary">
                    search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search exercise by name or muscle..."
                    className="bg-transparent text-xs text-white outline-none w-full"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-apple-labelTertiary hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Muscle Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                  {[
                    { id: "all", label: "All" },
                    { id: "chest", label: "Chest" },
                    { id: "back", label: "Back" },
                    { id: "shoulders", label: "Shoulders" },
                    { id: "biceps", label: "Biceps" },
                    { id: "triceps", label: "Triceps" },
                    { id: "quadriceps", label: "Legs" },
                    { id: "core", label: "Core" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setMuscleFilter(f.id)}
                      className={`flex-shrink-0 px-2 py-0.5 rounded-full transition-all ${
                        muscleFilter === f.id
                          ? "bg-white/20 text-white font-semibold"
                          : "text-apple-labelSecondary hover:text-white bg-white/5"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Exercises Dropdown List */}
                <div className="apple-glass-card max-h-32 overflow-y-auto flex flex-col divide-y divide-white/5">
                  {filteredExercises.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => {
                        setSelectedExercise(ex);
                        setInputWeight(ex.defaultWeight.toString());
                      }}
                      className={`p-2 text-left flex items-center justify-between text-xs transition-colors ${
                        selectedExercise.id === ex.id
                          ? "bg-apple-blue/20 text-white font-semibold"
                          : "hover:bg-white/5 text-apple-labelSecondary"
                      }`}
                    >
                      <span className="truncate">{ex.name}</span>
                      <span className="text-[10px] font-mono text-apple-labelTertiary uppercase flex-shrink-0">
                        {ex.equipment}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Set logging input */}
              <div className="apple-glass-card p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white truncate max-w-[200px]">
                    {selectedExercise.name}
                  </span>
                  <span className="text-[10px] text-apple-labelTertiary font-mono uppercase">
                    {selectedExercise.primaryMuscle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-apple-labelSecondary uppercase block mb-0.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white text-center focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[9px] text-apple-labelSecondary uppercase block mb-0.5">
                      Reps
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={inputReps}
                      onChange={(e) => setInputReps(e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white text-center focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddSetToActive}
                    className="self-end px-3 py-1.5 rounded-xl bg-apple-blue text-white text-xs font-semibold apple-spring-press h-8"
                  >
                    + Log Set
                  </button>
                </div>
              </div>

              {/* Logged Sets in current session */}
              {activeSets.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono uppercase text-apple-labelTertiary">
                    Logged Sets ({activeSets.length})
                  </span>
                  {activeSets.map((s, idx) => {
                    const e1rm = calculateE1RM(s.weightKg, s.reps);
                    const ratio = calculateRelativeStrength(
                      e1rm,
                      profile.currentBodyweightKg
                    );
                    return (
                      <div
                        key={s.id}
                        className="apple-glass-card p-2 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="min-w-0">
                          <p className="text-white truncate">
                            {idx + 1}. {s.exerciseName}
                          </p>
                          <span className="text-[10px] text-apple-labelSecondary">
                            {s.weightKg}kg × {s.reps} reps • e1RM: {e1rm}kg ({ratio}x BW)
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            setActiveSets((prev) => prev.filter((item) => item.id !== s.id))
                          }
                          className="text-apple-labelTertiary hover:text-apple-red p-1"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <button
                  onClick={handleFinishWorkout}
                  disabled={activeSets.length === 0}
                  className="flex-1 py-2 rounded-xl bg-apple-green text-black font-semibold text-xs apple-spring-press disabled:opacity-50"
                >
                  Finish &amp; Save Workout
                </button>
                <button
                  onClick={handleCancelWorkout}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-apple-red/20 hover:text-apple-red text-apple-labelSecondary text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </section>
          )}

          {/* SCIENTIFIC E1RM & RELATIVE STRENGTH CALCULATOR */}
          <section className="apple-glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary">
                Scientific e1RM &amp; Relative Strength
              </span>
              <span className="text-[10px] font-mono text-apple-labelTertiary">
                Epley Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Lift Weight (kg)
                </label>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                  Repetitions (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={calcReps}
                  onChange={(e) => setCalcReps(parseInt(e.target.value) || 1)}
                  className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="apple-glass-card p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-apple-labelTertiary block uppercase">
                  Estimated 1RM
                </span>
                <span className="text-xl font-mono font-bold text-white">
                  {calculatedE1rm}{" "}
                  <span className="text-xs font-normal text-apple-labelSecondary">kg</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-apple-labelTertiary block uppercase">
                  Relative Ratio
                </span>
                <span className="text-xl font-mono font-bold text-apple-blue">
                  {calculatedRatio}x{" "}
                  <span className="text-xs font-normal text-apple-labelSecondary">BW</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] text-apple-labelTertiary leading-relaxed">
              * Based on user current bodyweight of {profile.currentBodyweightKg} kg. Formula:
              weight × (1 + reps / 30).
            </span>
          </section>

          {/* HISTORICAL WORKOUT SESSIONS */}
          <section className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary px-0.5">
              Historical Workouts ({workouts.length})
            </span>

            {workouts.length === 0 ? (
              <div className="apple-glass-card p-6 text-center text-apple-labelTertiary text-xs flex flex-col items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px]">
                  fitness_center
                </span>
                <span>No workouts logged yet. Click &quot;Start Workout&quot; to log your real sets.</span>
              </div>
            ) : (
              workouts.map((w) => (
                <div key={w.id} className="apple-glass-panel p-3.5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{w.name}</h3>
                      <span className="text-[10px] font-mono text-apple-labelTertiary">
                        {w.startedAt.slice(0, 10)} • Vol:{" "}
                        {w.totalVolumeKg ? w.totalVolumeKg.toLocaleString() : 0} kg
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-apple-green/15 text-apple-green text-[10px] font-mono font-semibold">
                      {w.sets.length} Sets
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 mt-1 border-t border-white/10 pt-2">
                    {w.sets.map((set, sIdx) => (
                      <div
                        key={set.id || sIdx}
                        className="flex items-center justify-between text-xs text-apple-labelSecondary font-mono"
                      >
                        <span className="text-white truncate max-w-[200px]">
                          {set.exerciseName}
                        </span>
                        <span>
                          {set.weightKg}kg × {set.reps} reps
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      <VisionDock />
    </>
  );
}
