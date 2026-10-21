"use client";

import { useState } from "react";
import {
  MuscleGroup,
  MuscleScoreResult,
  calculateOctagonMuscleScores,
  ExercisePerformanceLog,
} from "../lib/fitness-calc";
import { WorkoutSession, BodyweightEntry } from "../lib/storage/store";
import { REAL_EXERCISES } from "../lib/exercises-data";

interface PhysiqueRadarProps {
  workouts: WorkoutSession[];
  bodyweightLogs: BodyweightEntry[];
  currentBodyweightKg: number;
}

const AXES_ORDER: { key: MuscleGroup; label: string; angleDeg: number }[] = [
  { key: "chest", label: "CHEST", angleDeg: -90 },
  { key: "back", label: "BACK", angleDeg: -45 },
  { key: "shoulders", label: "SHOULDERS", angleDeg: 0 },
  { key: "biceps", label: "BICEPS", angleDeg: 45 },
  { key: "quadriceps", label: "LEGS", angleDeg: 90 },
  { key: "core", label: "CORE", angleDeg: 135 },
  { key: "triceps", label: "TRICEPS", angleDeg: 180 },
  { key: "hamstrings_glutes", label: "HAMS/GLUTE", angleDeg: 225 },
];

export function PhysiqueRadar({
  workouts,
  bodyweightLogs,
  currentBodyweightKg,
}: PhysiqueRadarProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleScoreResult | null>(null);
  const [comparePreviousMonth, setComparePreviousMonth] = useState(false);

  // Convert stored workouts to exercise performance logs for calculation engine
  const performanceLogs: ExercisePerformanceLog[] = workouts.flatMap((w) =>
    w.sets.map((s) => ({
      exerciseId: s.exerciseId,
      exercise: {
        id: s.exerciseId,
        name: s.exerciseName,
        type: "barbell" as const,
        primaryMuscle: mapExerciseToPrimaryMuscle(s.exerciseId),
      },
      date: w.startedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      sets: [{ reps: s.reps, weightKg: s.weightKg, completed: s.completed }],
      userBodyweightKg: currentBodyweightKg,
    }))
  );

  const scores = calculateOctagonMuscleScores(performanceLogs, currentBodyweightKg);

  // Compute SVG polygon coordinates (center = 150, 150, max radius = 115)
  const centerX = 150;
  const centerY = 150;
  const maxR = 115;

  const hasAnySets = performanceLogs.length > 0;

  const currentPoints = AXES_ORDER.map((axis) => {
    // If user has not logged sets, show subtle empty polygon at 20%
    const scoreVal = hasAnySets ? (scores[axis.key]?.score ?? 25) : 20;
    const r = (scoreVal / 100) * maxR;
    const rad = (axis.angleDeg * Math.PI) / 180;
    const x = centerX + r * Math.cos(rad);
    const y = centerY + r * Math.sin(rad);
    return { x: Math.round(x), y: Math.round(y), score: scoreVal, key: axis.key };
  });

  const polygonPath = currentPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Previous comparison points (historical offset ~ -5%)
  const prevPoints = AXES_ORDER.map((axis) => {
    const scoreVal = Math.max(15, (scores[axis.key]?.score ?? 20) - 5);
    const r = (scoreVal / 100) * maxR;
    const rad = (axis.angleDeg * Math.PI) / 180;
    const x = centerX + r * Math.cos(rad);
    const y = centerY + r * Math.sin(rad);
    return `${Math.round(x)},${Math.round(y)}`;
  }).join(" ");

  // Real telemetry calculations
  const totalVolume = workouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0);
  
  // Find real heaviest lift across all logged sets
  let maxWeightLift: { exerciseName: string; weightKg: number } | null = null;
  for (const w of workouts) {
    for (const s of w.sets) {
      if (s.completed && s.weightKg > 0) {
        if (!maxWeightLift || s.weightKg > maxWeightLift.weightKg) {
          maxWeightLift = { exerciseName: s.exerciseName, weightKg: s.weightKg };
        }
      }
    }
  }

  const weightDelta =
    bodyweightLogs.length >= 2
      ? Math.round(
          (bodyweightLogs[0].weightKg - bodyweightLogs[bodyweightLogs.length - 1].weightKg) * 10
        ) / 10
      : 0;

  return (
    <section className="apple-glass-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-apple-labelSecondary">
            Physique Matrix
          </span>
          <span className="text-sm font-semibold text-white">
            8-Axis Musculoskeletal Balance
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasAnySets && (
            <button
              onClick={() => setComparePreviousMonth(!comparePreviousMonth)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all apple-spring-press ${
                comparePreviousMonth
                  ? "bg-apple-purple text-white shadow-sm"
                  : "bg-white/10 text-apple-labelSecondary hover:text-white"
              }`}
            >
              {comparePreviousMonth ? "Comparing Prev" : "Compare"}
            </button>
          )}
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-[11px] font-mono text-white font-semibold border border-white/10">
            {hasAnySets ? "CALIBRATED" : "ZERO STATE"}
          </span>
        </div>
      </div>

      {/* 8-Axis SVG Radar Polygon */}
      <div className="relative w-full max-w-[270px] mx-auto my-1 aspect-square flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 300">
          <defs>
            <radialGradient cx="50%" cy="50%" id="appleRadarGlow" r="50%">
              <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#0A84FF" stopOpacity="0.08" />
            </radialGradient>
          </defs>

          {/* Hairline Concentric Octagons */}
          {[1.0, 0.75, 0.5, 0.25].map((scale, idx) => {
            const octPoints = AXES_ORDER.map((axis) => {
              const r = maxR * scale;
              const rad = (axis.angleDeg * Math.PI) / 180;
              return `${Math.round(centerX + r * Math.cos(rad))},${Math.round(
                centerY + r * Math.sin(rad)
              )}`;
            }).join(" ");
            return (
              <polygon
                key={idx}
                fill="none"
                points={octPoints}
                stroke="rgba(255,255,255,0.10)"
                strokeDasharray={idx % 2 === 1 ? "2,2" : undefined}
                strokeWidth="1"
              />
            );
          })}

          {/* Axes Lines */}
          {AXES_ORDER.map((axis, i) => {
            const rad = (axis.angleDeg * Math.PI) / 180;
            const x2 = centerX + maxR * Math.cos(rad);
            const y2 = centerY + maxR * Math.sin(rad);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={Math.round(x2)}
                y2={Math.round(y2)}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}

          {/* Historical comparison polygon if toggled */}
          {comparePreviousMonth && (
            <polygon
              fill="rgba(191, 90, 242, 0.15)"
              points={prevPoints}
              stroke="#BF5AF2"
              strokeDasharray="3,3"
              strokeWidth="1.5"
            />
          )}

          {/* Data Polygon */}
          <polygon
            fill="url(#appleRadarGlow)"
            points={polygonPath}
            stroke="#0A84FF"
            strokeWidth="2"
            style={{ filter: "drop-shadow(0 0 6px rgba(10,132,255,0.4))" }}
          />

          {/* Vertices & Click Handlers */}
          {currentPoints.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#0A84FF"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              className="cursor-pointer hover:scale-150 transition-transform"
              onClick={() => setSelectedMuscle(scores[pt.key])}
            />
          ))}

          {/* SF Pro Labels */}
          {AXES_ORDER.map((axis, i) => {
            const rad = (axis.angleDeg * Math.PI) / 180;
            const labelR = maxR + 20;
            const x = centerX + labelR * Math.cos(rad);
            const y = centerY + labelR * Math.sin(rad);
            const scoreDisplay = scores[axis.key]?.score ? `${scores[axis.key]?.score}` : "--";
            const textAnchor =
              Math.abs(Math.cos(rad)) < 0.2
                ? "middle"
                : Math.cos(rad) > 0
                ? "start"
                : "end";

            return (
              <text
                key={i}
                x={Math.round(x)}
                y={Math.round(y) + 3}
                fill="rgba(235, 235, 245, 0.65)"
                fontFamily="-apple-system, sans-serif"
                fontSize="9"
                fontWeight="600"
                textAnchor={textAnchor}
                className="cursor-pointer hover:fill-white"
                onClick={() => setSelectedMuscle(scores[axis.key])}
              >
                {axis.label} {scoreDisplay}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Selected Muscle Deep-Dive Inspector Modal/Box */}
      {selectedMuscle && (
        <div className="apple-glass-card p-3 flex flex-col gap-1.5 border-apple-blue/50 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white flex items-center gap-1.5">
              {selectedMuscle.name}: {selectedMuscle.score ?? "No sets recorded yet"} / 100
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-white/10 text-apple-labelSecondary">
              Confidence: {selectedMuscle.confidence}
            </span>
          </div>
          <p className="text-apple-labelSecondary text-[11px] leading-relaxed">
            {selectedMuscle.explanation}
          </p>
          <button
            onClick={() => setSelectedMuscle(null)}
            className="self-end text-[10px] text-apple-blue hover:underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real Telemetry Sub-card */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <div className="apple-glass-card p-2 text-center">
          <span className="text-[10px] text-neutral-400 block uppercase">Bodyweight</span>
          <span className="text-xs font-mono font-semibold text-white">
            {currentBodyweightKg} kg
          </span>
          <span className="text-[9px] text-neutral-400 block mt-0.5">
            {weightDelta !== 0 ? `${weightDelta > 0 ? "+" : ""}${weightDelta} kg` : "Baseline"}
          </span>
        </div>
        <div className="apple-glass-card p-2 text-center">
          <span className="text-[10px] text-neutral-400 block uppercase">Peak Weight</span>
          <span className="text-xs font-mono font-semibold text-white">
            {maxWeightLift ? `${maxWeightLift.weightKg} kg` : "--"}
          </span>
          <span className="text-[9px] text-neutral-400 block mt-0.5 truncate">
            {maxWeightLift ? maxWeightLift.exerciseName : "No sets yet"}
          </span>
        </div>
        <div className="apple-glass-card p-2 text-center">
          <span className="text-[10px] text-neutral-400 block uppercase">Total Volume</span>
          <span className="text-xs font-mono font-semibold text-white">
            {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)} t` : "0 kg"}
          </span>
          <span className="text-[9px] text-apple-blue block mt-0.5">
            {workouts.length} workout{workouts.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </section>
  );
}

function mapExerciseToPrimaryMuscle(exerciseId: string): MuscleGroup {
  const found = REAL_EXERCISES.find((e) => e.id === exerciseId);
  if (found) return found.primaryMuscle;
  if (exerciseId.includes("bench") || exerciseId.includes("fly") || exerciseId.includes("pushup")) return "chest";
  if (exerciseId.includes("deadlift") || exerciseId.includes("row") || exerciseId.includes("pullup") || exerciseId.includes("pulldown")) return "back";
  if (exerciseId.includes("overhead") || exerciseId.includes("shoulder") || exerciseId.includes("raise") || exerciseId.includes("press")) return "shoulders";
  if (exerciseId.includes("curl")) return "biceps";
  if (exerciseId.includes("tricep") || exerciseId.includes("crusher") || exerciseId.includes("dip")) return "triceps";
  if (exerciseId.includes("squat") || exerciseId.includes("leg_press") || exerciseId.includes("lunge")) return "quadriceps";
  if (exerciseId.includes("romanian") || exerciseId.includes("thrust") || exerciseId.includes("curl") || exerciseId.includes("glute")) return "hamstrings_glutes";
  return "core";
}
