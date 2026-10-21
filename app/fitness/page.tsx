"use client";

import { useState } from "react";
import Link from "next/link";
import { useControlCenterStore, WorkoutSetItem } from "../../lib/storage/store";
import { TopHeader } from "../../components/TopHeader";
import { VisionDock } from "../../components/VisionDock";
import { AuthBarrier } from "../../components/AuthBarrier";
import {
  calculateE1RM,
  calculateRelativeStrength,
} from "../../lib/fitness-calc";
import {
  REAL_EXERCISES,
  MUSCLE_CATEGORIES,
  searchExercises,
  ExerciseLibraryItem,
} from "../../lib/exercises-data";
import {
  Search,
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  Dumbbell,
  ArrowLeft,
  Info,
  Layers,
} from "lucide-react";

export default function FitnessPage() {
  const { profile, workouts, addWorkout, deleteWorkout } = useControlCenterStore();

  // Active workout state
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [workoutName, setWorkoutName] = useState("Hypertrophy Strength Protocol");
  const [activeSets, setActiveSets] = useState<WorkoutSetItem[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Exercise selection state
  const [selectedExercise, setSelectedExercise] = useState<ExerciseLibraryItem>(REAL_EXERCISES[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [inputWeight, setInputWeight] = useState(REAL_EXERCISES[0].defaultWeight.toString());
  const [inputReps, setInputReps] = useState(REAL_EXERCISES[0].defaultReps.toString());
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  // Filtered exercises for dropdown/search
  const filteredExercises = searchExercises(searchQuery, activeCategory);

  const handleSelectExercise = (ex: ExerciseLibraryItem) => {
    setSelectedExercise(ex);
    setInputWeight(ex.defaultWeight.toString());
    setInputReps(ex.defaultReps.toString());
    setShowCatalogModal(false);
  };

  const handleAddSetToActive = () => {
    const weight = parseFloat(inputWeight) || 0;
    const reps = parseInt(inputReps) || 0;
    if (reps <= 0) return;

    const newSet: WorkoutSetItem = {
      id: "set-" + Date.now(),
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      setNumber: activeSets.filter((s) => s.exerciseId === selectedExercise.id).length + 1,
      reps,
      weightKg: weight,
      completed: true,
    };
    setActiveSets((prev) => [...prev, newSet]);
  };

  const handleRemoveSet = (setId: string) => {
    setActiveSets((prev) => prev.filter((s) => s.id !== setId));
  };

  const handleToggleSetCompleted = (setId: string) => {
    setActiveSets((prev) =>
      prev.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleFinishWorkout = () => {
    const completedSets = activeSets.filter((s) => s.completed);
    if (completedSets.length === 0) {
      setSaveSuccessMsg("Please log at least one completed set before saving.");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      return;
    }

    const volume = completedSets.reduce((sum, s) => sum + s.reps * s.weightKg, 0);

    addWorkout({
      name: workoutName,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      notes: "Logged via Control Center real strength catalog.",
      totalVolumeKg: volume,
      sets: completedSets,
    });

    setIsWorkoutActive(false);
    setActiveSets([]);
    setSaveSuccessMsg(`Workout saved! ${volume.toLocaleString()} kg total volume recorded.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleCancelWorkout = () => {
    setIsWorkoutActive(false);
    setActiveSets([]);
  };

  // Quick 1RM calculation for the selected exercise input
  const previewE1rm = calculateE1RM(parseFloat(inputWeight) || 0, parseInt(inputReps) || 0);
  const previewRatio = calculateRelativeStrength(previewE1rm, profile.currentBodyweightKg);

  return (
    <AuthBarrier>
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
                <ArrowLeft className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Strength & Workout Engine
              </h1>
            </div>
            {!isWorkoutActive ? (
              <button
                onClick={() => {
                  setIsWorkoutActive(true);
                  setActiveSets([]);
                }}
                className="px-3 py-1.5 rounded-full bg-apple-green text-black font-semibold text-xs apple-spring-press flex items-center gap-1 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                Start Workout
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-apple-blue/20 text-apple-blue text-xs font-mono font-semibold border border-apple-blue/30">
                LIVE SESSION
              </span>
            )}
          </div>

          {saveSuccessMsg && (
            <div className="apple-glass-card p-3 border-apple-blue/50 bg-apple-blue/10 text-white text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-apple-green shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* ACTIVE WORKOUT LOGGING PANEL */}
          {isWorkoutActive && (
            <section className="apple-glass-panel p-4 flex flex-col gap-4 border border-apple-blue/40 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <input
                  type="text"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-white border-b border-white/20 pb-0.5 focus:outline-none focus:border-apple-blue w-2/3"
                  placeholder="Workout Name"
                />
                <span className="text-[11px] font-mono text-apple-green font-medium">
                  {activeSets.filter((s) => s.completed).length} Sets Done
                </span>
              </div>

              {/* Set logging items */}
              <div className="flex flex-col gap-2">
                {activeSets.length === 0 ? (
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                    <p className="text-xs text-neutral-400">
                      No sets logged yet. Select an exercise below to add sets.
                    </p>
                  </div>
                ) : (
                  activeSets.map((s, idx) => {
                    const setE1rm = calculateE1RM(s.weightKg, s.reps);
                    const setRatio = calculateRelativeStrength(setE1rm, profile.currentBodyweightKg);

                    return (
                      <div
                        key={s.id}
                        className="apple-glass-card p-2.5 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            onClick={() => handleToggleSetCompleted(s.id)}
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
                              Set {s.setNumber}: {s.exerciseName}
                            </p>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {s.weightKg} kg × {s.reps} reps · e1RM: {setE1rm}kg ({setRatio}x BW)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveSet(s.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add New Set Form with 120+ Real Exercises */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                    Add Exercise Set
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCatalogModal(true)}
                    className="text-xs text-apple-blue hover:underline flex items-center gap-1 font-medium"
                  >
                    <Layers className="w-3 h-3" />
                    Browse Catalog (120+)
                  </button>
                </div>

                {/* Selected Exercise Badge */}
                <div
                  onClick={() => setShowCatalogModal(true)}
                  className="apple-glass-card p-2.5 flex items-center justify-between cursor-pointer hover:border-apple-blue/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-apple-blue/10 border border-apple-blue/20 flex items-center justify-center text-apple-blue shrink-0">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-white truncate block">
                        {selectedExercise.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {selectedExercise.category} · {selectedExercise.equipment}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-apple-blue font-medium shrink-0">Change</span>
                </div>

                {/* Weight & Reps Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-medium block mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={inputWeight}
                      onChange={(e) => setInputWeight(e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-apple-blue"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 uppercase font-medium block mb-1">
                      Reps
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={inputReps}
                      onChange={(e) => setInputReps(e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-apple-blue"
                    />
                  </div>
                </div>

                {/* 1RM Preview */}
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono px-1">
                  <span>Projected e1RM: <strong className="text-white">{previewE1rm} kg</strong></span>
                  <span>Ratio: <strong className="text-apple-blue">{previewRatio}x BW</strong></span>
                </div>

                <button
                  type="button"
                  onClick={handleAddSetToActive}
                  className="w-full py-2.5 rounded-xl bg-apple-blue text-white font-semibold text-xs apple-spring-press flex items-center justify-center gap-1.5 hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Completed Set
                </button>
              </div>

              {/* Finish or Discard Session */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelWorkout}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs font-medium"
                >
                  Discard Session
                </button>
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  disabled={activeSets.filter((s) => s.completed).length === 0}
                  className="px-5 py-2.5 rounded-xl bg-apple-green text-black font-semibold text-xs apple-spring-press hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  Save Workout to Vault
                </button>
              </div>
            </section>
          )}

          {/* REAL EXERCISE LIBRARY BROWSER */}
          <section className="apple-glass-panel p-4 flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary block">
                  Verified Movement Database
                </span>
                <span className="text-sm font-semibold text-white">
                  120+ Real Exercises Catalog
                </span>
              </div>
              <span className="text-xs font-mono text-apple-blue font-semibold px-2 py-0.5 rounded-full bg-apple-blue/10 border border-apple-blue/20">
                {REAL_EXERCISES.length} Total
              </span>
            </div>

            {/* Instant Search Bar */}
            <div className="apple-glass-card px-3 py-2 flex items-center gap-2">
              <Search className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                type="text"
                placeholder="Search exercises by name, equipment, or muscle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Segmented Controls */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MUSCLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? "bg-apple-blue text-white"
                      : "bg-white/[0.05] text-neutral-400 hover:text-white"
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>

            {/* Exercises Grid List */}
            <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredExercises.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-400">
                  No exercises matching &quot;{searchQuery}&quot; found.
                </div>
              ) : (
                filteredExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleSelectExercise(ex)}
                    className={`apple-glass-card p-2.5 flex items-center justify-between cursor-pointer hover:border-white/30 transition-all ${
                      selectedExercise.id === ex.id ? "border-apple-blue/60 bg-apple-blue/[0.06]" : ""
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">
                          {ex.name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          · {ex.equipment}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                        {ex.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-apple-green font-medium">
                        {ex.defaultWeight}kg × {ex.defaultReps}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectExercise(ex);
                          if (!isWorkoutActive) setIsWorkoutActive(true);
                        }}
                        className="px-2 py-1 rounded-md bg-white/10 hover:bg-apple-blue hover:text-white text-[10px] font-medium transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* VERIFIED WORKOUT LOG HISTORY */}
          <section className="apple-glass-panel p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary block">
                  Vault History
                </span>
                <span className="text-sm font-semibold text-white">
                  Completed Workouts ({workouts.length})
                </span>
              </div>
            </div>

            {workouts.length === 0 ? (
              <div className="p-5 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                <Dumbbell className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-400">No workouts recorded yet.</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Start your first workout above to log sets with verified weights.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {workouts.map((w) => (
                  <div key={w.id} className="apple-glass-card p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-white">{w.name}</h3>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(w.startedAt).toLocaleDateString()} · {w.sets.length} Sets
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-apple-green">
                          {w.totalVolumeKg?.toLocaleString()} kg
                        </span>
                        <button
                          onClick={() => deleteWorkout(w.id)}
                          className="text-neutral-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                      {w.sets.map((s, idx) => (
                        <span
                          key={s.id || idx}
                          className="text-[10px] font-mono text-neutral-300 bg-white/5 px-2 py-0.5 rounded"
                        >
                          {s.exerciseName}: {s.weightKg}kg × {s.reps}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Exercise Catalog Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="apple-glass-panel max-w-lg w-full p-5 border border-white/20 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-apple-blue" />
                <h3 className="text-sm font-bold text-white">Select Exercise (120+ Library)</h3>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-neutral-400 hover:text-white text-xs px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Search */}
            <div className="my-3">
              <div className="apple-glass-card px-3 py-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Filter exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none w-full"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className="apple-glass-card p-2.5 flex items-center justify-between hover:border-apple-blue/50 cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-semibold text-white block truncate">{ex.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {ex.category} · {ex.equipment}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectExercise(ex)}
                    className="px-2.5 py-1 rounded bg-apple-blue text-white text-[10px] font-medium shrink-0"
                  >
                    Choose
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <VisionDock />
    </AuthBarrier>
  );
}
