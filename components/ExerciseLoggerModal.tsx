"use client";

import { useState } from "react";
import { REAL_EXERCISES_DATABASE, ExerciseItem } from "../lib/exercises";
import { calculateE1RM, calculateRelativeStrength } from "../lib/fitness-calc";
import { WorkoutSetItem } from "../lib/storage/store";

interface ExerciseLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBodyweightKg: number;
  onSaveWorkout: (name: string, sets: WorkoutSetItem[]) => void;
}

export function ExerciseLoggerModal({
  isOpen,
  onClose,
  userBodyweightKg,
  onSaveWorkout,
}: ExerciseLoggerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  // Set inputs
  const [weightKg, setWeightKg] = useState<number>(80);
  const [reps, setReps] = useState<number>(5);
  const [loggedSets, setLoggedSets] = useState<WorkoutSetItem[]>([]);
  const [workoutTitle, setWorkoutTitle] = useState("Hypertrophy Session");

  if (!isOpen) return null;

  const filteredExercises = REAL_EXERCISES_DATABASE.filter((ex) => {
    if (selectedMuscleFilter !== "all" && ex.primaryMuscle !== selectedMuscleFilter) {
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

  const liveE1rm = calculateE1RM(weightKg, reps);
  const liveRatio = calculateRelativeStrength(liveE1rm, userBodyweightKg);

  const handleSelectExercise = (ex: ExerciseItem) => {
    setSelectedExercise(ex);
    setWeightKg(ex.defaultWeight);
    setReps(5);
  };

  const handleLogSet = () => {
    if (!selectedExercise) return;
    const newSet: WorkoutSetItem = {
      id: "set-" + Date.now(),
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      setNumber: loggedSets.length + 1,
      reps: Number(reps) || 5,
      weightKg: Number(weightKg) || 0,
      completed: true,
    };
    setLoggedSets((prev) => [...prev, newSet]);
  };

  const handleFinish = () => {
    if (loggedSets.length === 0) {
      alert("Please log at least one set before saving.");
      return;
    }
    onSaveWorkout(workoutTitle, loggedSets);
    setLoggedSets([]);
    setSelectedExercise(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="apple-glass-panel max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border-apple-blue/50">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-apple-green shadow-[0_0_8px_rgba(48,209,88,0.8)]"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Exercise Library &amp; Set Logger
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-apple-labelSecondary hover:text-white text-sm p-1"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 flex flex-col gap-3 overflow-y-auto">
          {/* Workout Title */}
          <div>
            <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
              Session Title
            </label>
            <input
              type="text"
              value={workoutTitle}
              onChange={(e) => setWorkoutTitle(e.target.value)}
              className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-apple-blue font-medium"
            />
          </div>

          {/* Search Bar */}
          <div className="apple-glass-card px-3 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[17px] text-apple-labelTertiary">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearchQuerySafe(e.target.value)}
              placeholder="Search 60+ exercises (e.g. Bench, Squat, Lat Pulldown)..."
              className="bg-transparent text-xs text-white outline-none w-full placeholder-apple-labelTertiary"
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

          {/* Muscle Group Quick Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
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
                onClick={() => setSelectedMuscleFilter(f.id)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-full transition-all ${
                  selectedMuscleFilter === f.id
                    ? "bg-white/20 text-white font-semibold shadow-sm"
                    : "text-apple-labelSecondary hover:text-white bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Exercise Selection List (if none selected or selecting another) */}
          <div className="apple-glass-card max-h-36 overflow-y-auto flex flex-col divide-y divide-white/5">
            {filteredExercises.map((ex) => {
              const isSelected = selectedExercise?.id === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className={`p-2.5 text-left flex items-center justify-between transition-colors ${
                    isSelected ? "bg-apple-blue/20" : "hover:bg-white/5"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{ex.name}</p>
                    <span className="text-[10px] text-apple-labelSecondary capitalize">
                      {ex.primaryMuscle.replace("_", " & ")} • {ex.equipment}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-apple-blue">
                    {isSelected ? "Selected" : "Select"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Set Logger Panel */}
          {selectedExercise && (
            <div className="apple-glass-panel p-3 flex flex-col gap-2.5 border-apple-blue/40 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-apple-blue font-semibold">
                    Logging Exercise:
                  </span>
                  <h3 className="text-sm font-semibold text-white">
                    {selectedExercise.name}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-apple-labelSecondary uppercase">
                  {selectedExercise.equipment}
                </span>
              </div>

              {/* Reps and Weights Input Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                    Load Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-apple-blue"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-apple-labelSecondary uppercase block mb-1">
                    Reps (1-12)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={reps}
                    onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-apple-blue"
                  />
                </div>
              </div>

              {/* Dynamic Telemetry Calculation */}
              <div className="flex items-center justify-between text-xs bg-white/5 p-2 rounded-xl">
                <span className="text-[11px] text-apple-labelSecondary">
                  e1RM: <strong className="text-white font-mono">{liveE1rm} kg</strong>
                </span>
                <span className="text-[11px] text-apple-labelSecondary">
                  Ratio: <strong className="text-apple-blue font-mono">{liveRatio}x BW</strong>
                </span>
              </div>

              <button
                onClick={handleLogSet}
                className="w-full py-2 rounded-xl bg-apple-blue text-white font-semibold text-xs apple-spring-press shadow-sm"
              >
                + Log Set #{loggedSets.length + 1}
              </button>
            </div>
          )}

          {/* Logged Sets in current session */}
          {loggedSets.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[10px] uppercase font-mono text-apple-labelSecondary">
                Sets In This Session ({loggedSets.length})
              </span>
              {loggedSets.map((s, idx) => (
                <div
                  key={s.id}
                  className="apple-glass-card p-2 flex items-center justify-between text-xs font-mono"
                >
                  <span className="text-white truncate max-w-[200px]">
                    {idx + 1}. {s.exerciseName}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-apple-green font-semibold">
                      {s.weightKg}kg × {s.reps} reps
                    </span>
                    <button
                      onClick={() => setLoggedSets((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-apple-labelTertiary hover:text-apple-red"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex items-center gap-2 bg-black/40">
          <button
            onClick={handleFinish}
            disabled={loggedSets.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-apple-green text-black font-semibold text-xs apple-spring-press disabled:opacity-50"
          >
            Finish &amp; Save Workout ({loggedSets.length} Sets)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-white/10 text-apple-labelSecondary hover:text-white text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  function setSearchQuerySafe(val: string) {
    setSearch(val);
  }
}
