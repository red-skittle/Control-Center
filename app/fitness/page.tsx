"use client";

import { useState } from "react";
import Link from "next/link";
import { useControlCenterStore, WorkoutSession, WorkoutSetItem } from "../../lib/storage/store";
import { TopHeader } from "../../components/TopHeader";
import { VisionDock } from "../../components/VisionDock";
import {
  calculateE1RM,
  calculateRelativeStrength,
  PUBLISHED_BENCHMARKS,
} from "../../lib/fitness-calc";

const STANDARD_EXERCISES = [
  { id: "bench_press", name: "Barbell Bench Press", defaultWeight: 100 },
  { id: "squat", name: "Barbell Back Squat", defaultWeight: 140 },
  { id: "deadlift", name: "Conventional Deadlift", defaultWeight: 180 },
  { id: "overhead_press", name: "Standing Overhead Press", defaultWeight: 65 },
  { id: "weighted_pullup", name: "Weighted Pull-up", defaultWeight: 20 },
  { id: "barbell_row", name: "Barbell Bent-Over Row", defaultWeight: 80 },
  { id: "barbell_curl", name: "Barbell Biceps Curl", defaultWeight: 40 },
  { id: "tricep_pushdown", name: "Cable Tricep Pushdown", defaultWeight: 35 },
  { id: "romanian_deadlift", name: "Romanian Deadlift (RDL)", defaultWeight: 120 },
  { id: "hanging_leg_raise", name: "Hanging Leg Raise (Bodyweight)", defaultWeight: 0 },
];

export default function FitnessPage() {
  const { profile, workouts, addWorkout } = useControlCenterStore();

  // Active workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutName, setWorkoutName] = useState("Upper Power Progression");
  const [activeSets, setActiveSets] = useState<WorkoutSetItem[]>([
    {
      id: "set-1",
      exerciseId: "bench_press",
      exerciseName: "Barbell Bench Press",
      setNumber: 1,
      reps: 5,
      weightKg: 100,
      completed: true,
    },
    {
      id: "set-2",
      exerciseId: "bench_press",
      exerciseName: "Barbell Bench Press",
      setNumber: 2,
      reps: 5,
      weightKg: 105,
      completed: true,
    },
    {
      id: "set-3",
      exerciseId: "weighted_pullup",
      exerciseName: "Weighted Pull-up",
      setNumber: 1,
      reps: 6,
      weightKg: 20,
      completed: false,
    },
  ]);

  // Selected exercise to add
  const [selectedExerciseId, setSelectedExerciseId] = useState("bench_press");
  const [inputWeight, setInputWeight] = useState("100");
  const [inputReps, setInputReps] = useState("5");

  // Calculator widget state
  const [calcWeight, setCalcWeight] = useState(100);
  const [calcReps, setCalcReps] = useState(5);
  const calculatedE1rm = calculateE1RM(calcWeight, calcReps);
  const calculatedRatio = calculateRelativeStrength(calculatedE1rm, profile.currentBodyweightKg);

  const handleAddSetToActive = () => {
    const ex = STANDARD_EXERCISES.find((e) => e.id === selectedExerciseId);
    if (!ex) return;

    const newSet: WorkoutSetItem = {
      id: "set-" + Date.now(),
      exerciseId: ex.id,
      exerciseName: ex.name,
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
      notes: "Logged via mobile control center fitness module.",
      totalVolumeKg: volume,
      sets: completedSets,
    });

    setIsWorkoutActive(false);
    alert(`Workout '${workoutName}' saved! Volume: ${volume.toLocaleString()} kg.`);
  };

  const handleCancelWorkout = () => {
    if (confirm("Discard this unfinished workout? Incomplete sets will not be saved.")) {
      setIsWorkoutActive(false);
    }
  };

  return (
    <>
      <TopHeader profile={profile} />

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
                Strength & Workout Engine
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
            <section className="apple-glass-panel p-4 flex flex-col gap-3.5 border-apple-blue/50">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-white border-b border-white/20 pb-0.5 focus:outline-none focus:border-apple-blue w-2/3"
                />
                <span className="text-[11px] font-mono text-apple-green font-medium">
                  {activeSets.filter((s) => s.completed).length} Done
                </span>
              </div>

              {/* Set logging items */}
              <div className="flex flex-col gap-2">
                {activeSets.map((s, idx) => {
                  const setE1rm = calculateE1RM(s.weightKg, s.reps);
                  const setRatio = calculateRelativeStrength(setE1rm, profile.currentBodyweightKg);

                  return (
                    <div
                      key={s.id}
                      className="apple-glass-card p-2.5 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => {
                            setActiveSets((prev) =>
                              prev.map((item) =>
                                item.id === s.id ? { ...item, completed: !item.completed } : item
                              )
                            );
                          }}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs apple-spring-press ${
                            s.completed
                              ? "bg-apple-green text-black font-bold"
                              : "border border-white/30 text-transparent"
                          }`}
                        >
                          ✓
                        </button>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {idx + 1}. {s.exerciseName}
                          </p>
                          <span className="text-[10px] text-apple-labelSecondary font-mono">
                            {s.weightKg} kg × {s.reps} reps • e1RM: {setE1rm} kg ({setRatio}x BW)
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveSets((prev) => prev.filter((item) => item.id !== s.id))}
                        className="text-apple-labelTertiary hover:text-apple-red text-xs px-1"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add New Set Row */}
              <div className="flex gap-2 items-center pt-2 border-t border-white/10">
                <select
                  value={selectedExerciseId}
                  onChange={(e) => {
                    setSelectedExerciseId(e.target.value);
                    const found = STANDARD_EXERCISES.find((ex) => ex.id === e.target.value);
                    if (found) setInputWeight(found.defaultWeight.toString());
                  }}
                  className="flex-1 bg-white/[0.08] border border-white/15 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  {STANDARD_EXERCISES.map((ex) => (
                    <option key={ex.id} value={ex.id} className="bg-black">
                      {ex.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="kg"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-16 bg-white/[0.08] border border-white/15 rounded-xl px-2 py-1.5 text-xs font-mono text-white text-center focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="reps"
                  value={inputReps}
                  onChange={(e) => setInputReps(e.target.value)}
                  className="w-14 bg-white/[0.08] border border-white/15 rounded-xl px-2 py-1.5 text-xs font-mono text-white text-center focus:outline-none"
                />
                <button
                  onClick={handleAddSetToActive}
                  className="px-2.5 py-1.5 rounded-xl bg-apple-blue text-white text-xs font-semibold apple-spring-press"
                >
                  + Set
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleFinishWorkout}
                  className="flex-1 py-2 rounded-xl bg-apple-green text-black font-semibold text-xs apple-spring-press"
                >
                  Finish & Save Workout
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
                Relative Strength e1RM Calculator
              </span>
              <span className="text-[10px] font-mono text-apple-labelTertiary">Epley Formula</span>
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
                <span className="text-[10px] text-apple-labelTertiary block uppercase">Estimated 1RM</span>
                <span className="text-xl font-mono font-bold text-white">
                  {calculatedE1rm} <span className="text-xs font-normal text-apple-labelSecondary">kg</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-apple-labelTertiary block uppercase">Relative to BW</span>
                <span className="text-xl font-mono font-bold text-apple-blue">
                  {calculatedRatio}x <span className="text-xs font-normal text-apple-labelSecondary">BW</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] text-apple-labelTertiary leading-relaxed">
              * Based on user current bodyweight of {profile.currentBodyweightKg} kg. Formula: weight × (1 + reps / 30).
            </span>
          </section>

          {/* HISTORICAL WORKOUT SESSIONS */}
          <section className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-apple-labelSecondary px-0.5">
              Historical Workouts ({workouts.length})
            </span>

            {workouts.map((w) => (
              <div key={w.id} className="apple-glass-panel p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{w.name}</h3>
                    <span className="text-[10px] font-mono text-apple-labelTertiary">
                      {w.startedAt.slice(0, 10)} • Total Vol: {w.totalVolumeKg.toLocaleString()} kg
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
                      <span className="text-white truncate max-w-[200px]">{set.exerciseName}</span>
                      <span>
                        {set.weightKg}kg × {set.reps} reps
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>

      <VisionDock />
    </>
  );
}
