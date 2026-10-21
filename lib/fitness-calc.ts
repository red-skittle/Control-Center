/**
 * Fitness Calculation Engine
 * 
 * Implements rigorous, documented calculations for:
 * 1. Estimated 1-Repetition Maximum (e1RM) using Epley Formula for 1-10 reps
 * 2. Relative Strength = e1RM / Bodyweight
 * 3. Exercise type handling (Barbell, Dumbbell, Bodyweight, Weighted Bodyweight, Assisted)
 * 4. Transparent 0-100 Benchmark Mapping based on published strength standards
 * 5. 8-Axis Muscle Group Scoring (Physique Octagon) with data coverage & confidence
 * 6. Running Endurance Metrics (Pace min/km, Speed km/h, distance/time validation)
 */

export type ExerciseType =
  | "barbell"
  | "dumbbell" // Recorded as per-dumbbell load
  | "bodyweight"
  | "weighted_bodyweight" // bodyweight + added weight
  | "assisted" // bodyweight - assistance weight
  | "cable_machine"
  | "isometric"
  | "cardio";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "hamstrings_glutes"
  | "core";

export interface ExerciseSet {
  reps: number;
  weightKg: number; // For bodyweight, 0; for weighted, the added load; for dumbbell, load per hand
  completed: boolean;
  rpe?: number;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  type: ExerciseType;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  // If true, for dumbbells total load is 2x per-hand weight
  isPerHandDumbbell?: boolean;
}

export interface ExercisePerformanceLog {
  exerciseId: string;
  exercise: ExerciseDefinition;
  date: string; // ISO date
  sets: ExerciseSet[];
  userBodyweightKg: number;
}

export interface BenchmarkThresholds {
  untrained: number;   // ~score 20
  novice: number;      // ~score 40
  intermediate: number;// ~score 60
  advanced: number;    // ~score 80
  elite: number;       // ~score 95+
  source: string;
}

/**
 * Standard published strength standards (ratio of e1RM to bodyweight)
 * Sources: ExRx.net & Kilgore/Rippetoe adult male strength standards
 */
export const PUBLISHED_BENCHMARKS: Record<string, BenchmarkThresholds> = {
  bench_press: {
    untrained: 0.60,
    novice: 0.85,
    intermediate: 1.15,
    advanced: 1.50,
    elite: 1.85,
    source: "ExRx.net / Kilgore Standards (Adult Male, normalized)",
  },
  squat: {
    untrained: 0.75,
    novice: 1.15,
    intermediate: 1.50,
    advanced: 2.00,
    elite: 2.45,
    source: "ExRx.net / Kilgore Standards (Back Squat, Adult Male)",
  },
  deadlift: {
    untrained: 0.90,
    novice: 1.35,
    intermediate: 1.75,
    advanced: 2.30,
    elite: 2.80,
    source: "ExRx.net / Kilgore Standards (Conventional Deadlift)",
  },
  overhead_press: {
    untrained: 0.40,
    novice: 0.60,
    intermediate: 0.80,
    advanced: 1.05,
    elite: 1.30,
    source: "ExRx.net / Kilgore Standards (Standing Overhead Press)",
  },
  weighted_pullup: {
    // Total system load (BW + Added) / BW
    untrained: 0.80, // Assisted or cannot do full bodyweight
    novice: 1.00,    // Bodyweight only (1 rep)
    intermediate: 1.25, // BW + 25% added
    advanced: 1.50,  // BW + 50% added
    elite: 1.75,     // BW + 75% added
    source: "Relative Total System Load standards",
  },
  barbell_curl: {
    untrained: 0.25,
    novice: 0.40,
    intermediate: 0.55,
    advanced: 0.75,
    elite: 0.95,
    source: "Strength Level composite benchmarks",
  },
  tricep_extension: {
    untrained: 0.20,
    novice: 0.35,
    intermediate: 0.50,
    advanced: 0.70,
    elite: 0.90,
    source: "Strength Level composite benchmarks",
  },
  romanian_deadlift: {
    untrained: 0.70,
    novice: 1.00,
    intermediate: 1.35,
    advanced: 1.75,
    elite: 2.15,
    source: "RDL standard relative to conventional deadlift (~75%)",
  },
};

/**
 * Calculate Estimated 1RM using Epley formula.
 * Formula: e1RM = Weight * (1 + Reps / 30)
 * 
 * Safety & validity constraints:
 * - Applicable primarily for 1 to 10 repetitions.
 * - For reps > 12, validity degrades significantly; we cap rep contribution at 12 to avoid absurd overestimations.
 * - Reps <= 0 or Weight <= 0 returns 0.
 * - Single rep (reps = 1) returns exactly the tested weight.
 */
export function calculateE1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  
  // Constrain valid rep range for Epley estimate
  const effectiveReps = Math.min(reps, 12);
  const e1rm = weightKg * (1 + effectiveReps / 30);
  return Math.round(e1rm * 10) / 10;
}

/**
 * Calculates effective load for a set based on exercise type and bodyweight.
 */
export function calculateEffectiveSetLoad(
  set: ExerciseSet,
  exerciseType: ExerciseType,
  bodyweightKg: number,
  isPerHandDumbbell = false
): number {
  if (!set.completed || set.reps <= 0) return 0;

  switch (exerciseType) {
    case "barbell":
    case "cable_machine":
      return set.weightKg;

    case "dumbbell":
      // If recorded as load per hand, total load is 2x
      return isPerHandDumbbell ? set.weightKg * 2 : set.weightKg;

    case "bodyweight":
      // External load is 0, full system load is user's current bodyweight
      return bodyweightKg > 0 ? bodyweightKg : 0;

    case "weighted_bodyweight":
      // Total system load = user's bodyweight + external added load
      return (bodyweightKg > 0 ? bodyweightKg : 0) + Math.max(0, set.weightKg);

    case "assisted":
      // Net load = bodyweight - assistance load
      return Math.max(0, (bodyweightKg > 0 ? bodyweightKg : 0) - Math.max(0, set.weightKg));

    default:
      return set.weightKg;
  }
}

/**
 * Relative Strength = e1RM / Bodyweight
 */
export function calculateRelativeStrength(e1rm: number, bodyweightKg: number): number {
  if (bodyweightKg <= 0 || e1rm <= 0) return 0;
  return Math.round((e1rm / bodyweightKg) * 1000) / 1000;
}

/**
 * Piecewise-linear benchmark mapper: maps a relative strength ratio to a 0-100 scale
 * using published standards (Untrained=20, Novice=40, Intermediate=60, Advanced=80, Elite=95).
 */
export function mapRatioToBenchmarkScore(
  ratio: number,
  thresholds: BenchmarkThresholds
): number {
  if (ratio <= 0) return 0;

  const points = [
    { ratio: 0, score: 0 },
    { ratio: thresholds.untrained, score: 20 },
    { ratio: thresholds.novice, score: 40 },
    { ratio: thresholds.intermediate, score: 60 },
    { ratio: thresholds.advanced, score: 80 },
    { ratio: thresholds.elite, score: 95 },
    { ratio: thresholds.elite * 1.25, score: 100 },
  ];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (ratio >= p1.ratio && ratio <= p2.ratio) {
      const t = (ratio - p1.ratio) / (p2.ratio - p1.ratio);
      const score = p1.score + t * (p2.score - p1.score);
      return Math.min(100, Math.max(0, Math.round(score)));
    }
  }

  return ratio > thresholds.elite * 1.25 ? 100 : 0;
}

export interface MuscleScoreResult {
  muscle: MuscleGroup;
  name: string;
  score: number | null;
  confidence: "high" | "medium" | "low" | "none";
  explanation: string;
  benchmarkSource: string | null;
  primaryExercise: string | null;
  relativeStrengthRatio: number | null;
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  quadriceps: "Quadriceps",
  hamstrings_glutes: "Hamstrings & Glutes",
  core: "Core",
};

/**
 * Evaluates the 8-axis Musculoskeletal Index from user workout logs.
 * When data is missing or insufficient, explicitly flags confidence as 'none' and score as null.
 */
export function calculateOctagonMuscleScores(
  history: ExercisePerformanceLog[],
  currentBodyweightKg: number
): Record<MuscleGroup, MuscleScoreResult> {
  const muscleGroups: MuscleGroup[] = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "quadriceps",
    "hamstrings_glutes",
    "core",
  ];

  const results: Partial<Record<MuscleGroup, MuscleScoreResult>> = {};

  for (const muscle of muscleGroups) {
    // Find all relevant logs targeting this muscle (primary weight: 1.0, secondary weight: 0.5)
    const matchingLogs = history.filter(
      (log) =>
        log.exercise.primaryMuscle === muscle ||
        log.exercise.secondaryMuscles?.includes(muscle)
    );

    if (matchingLogs.length === 0 || currentBodyweightKg <= 0) {
      results[muscle] = {
        muscle,
        name: MUSCLE_GROUP_LABELS[muscle],
        score: null,
        confidence: "none",
        explanation: "Not enough data. Log sets for this muscle group to generate an index score.",
        benchmarkSource: null,
        primaryExercise: null,
        relativeStrengthRatio: null,
      };
      continue;
    }

    // Identify the best lift for this muscle group
    let bestRatio = 0;
    let bestExerciseName = "";
    let bestBenchmark: BenchmarkThresholds | null = null;
    let completedSetsCount = 0;

    for (const log of matchingLogs) {
      const isPrimary = log.exercise.primaryMuscle === muscle;
      const weightFactor = isPrimary ? 1.0 : 0.7;

      for (const set of log.sets) {
        if (!set.completed || set.reps <= 0) continue;
        completedSetsCount++;

        let effectiveLoad = set.weightKg;
        if (log.exercise.type === "dumbbell" && log.exercise.isPerHandDumbbell) {
          effectiveLoad = set.weightKg * 2;
        } else if (log.exercise.type === "weighted_bodyweight") {
          effectiveLoad = currentBodyweightKg + set.weightKg;
        } else if (log.exercise.type === "bodyweight") {
          effectiveLoad = currentBodyweightKg;
        }

        const e1rm = calculateE1RM(effectiveLoad, set.reps);
        const ratio = calculateRelativeStrength(e1rm, currentBodyweightKg) * weightFactor;

        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestExerciseName = log.exercise.name;
          bestBenchmark = PUBLISHED_BENCHMARKS[log.exercise.id] || null;
        }
      }
    }

    if (completedSetsCount === 0 || bestRatio === 0) {
      results[muscle] = {
        muscle,
        name: MUSCLE_GROUP_LABELS[muscle],
        score: null,
        confidence: "none",
        explanation: "No completed sets recorded with valid weight and repetitions.",
        benchmarkSource: null,
        primaryExercise: null,
        relativeStrengthRatio: null,
      };
      continue;
    }

    // Default general benchmark if exercise-specific benchmark not found
    const benchmark = bestBenchmark || {
      untrained: 0.60,
      novice: 0.90,
      intermediate: 1.25,
      advanced: 1.65,
      elite: 2.10,
      source: "General Compound Strength Standard (estimated)",
    };

    const calculatedScore = mapRatioToBenchmarkScore(bestRatio, benchmark);
    const confidence: "high" | "medium" | "low" =
      completedSetsCount >= 6 ? "high" : completedSetsCount >= 3 ? "medium" : "low";

    results[muscle] = {
      muscle,
      name: MUSCLE_GROUP_LABELS[muscle],
      score: calculatedScore,
      confidence,
      explanation: `Calculated from ${bestExerciseName} with e1RM ratio of ${bestRatio.toFixed(2)}x bodyweight (${currentBodyweightKg}kg).`,
      benchmarkSource: benchmark.source,
      primaryExercise: bestExerciseName,
      relativeStrengthRatio: Math.round(bestRatio * 100) / 100,
    };
  }

  return results as Record<MuscleGroup, MuscleScoreResult>;
}

/**
 * Running and Endurance Calculations
 */
export interface EnduranceMetrics {
  distanceKm: number;
  durationSeconds: number;
  paceMinPerKm: string; // "MM:SS"
  paceSecondsPerKm: number;
  speedKmh: number;
  isValid: boolean;
}

export function calculateEnduranceMetrics(
  distanceKm: number,
  durationSeconds: number
): EnduranceMetrics {
  if (distanceKm <= 0 || durationSeconds <= 0 || !isFinite(distanceKm) || !isFinite(durationSeconds)) {
    return {
      distanceKm: Math.max(0, distanceKm || 0),
      durationSeconds: Math.max(0, durationSeconds || 0),
      paceMinPerKm: "--:--",
      paceSecondsPerKm: 0,
      speedKmh: 0,
      isValid: false,
    };
  }

  // Pace: seconds per kilometer
  const paceSecondsPerKm = durationSeconds / distanceKm;
  const paceMinutes = Math.floor(paceSecondsPerKm / 60);
  const paceRemainderSeconds = Math.round(paceSecondsPerKm % 60);

  const formattedPace = `${paceMinutes.toString().padStart(2, "0")}:${paceRemainderSeconds
    .toString()
    .padStart(2, "0")}`;

  // Speed: km per hour
  const durationHours = durationSeconds / 3600;
  const speedKmh = Math.round((distanceKm / durationHours) * 10) / 10;

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    durationSeconds: Math.round(durationSeconds),
    paceMinPerKm: formattedPace,
    paceSecondsPerKm: Math.round(paceSecondsPerKm),
    speedKmh,
    isValid: true,
  };
}

/**
 * Habit streak calculator that strictly respects scheduled days:
 * An unscheduled day does NOT break a streak.
 * Only scheduled days where completion is missed break the streak.
 */
export function calculateHabitStreak(
  scheduledDaysOfWeek: number[], // 0 for Sunday, 1 for Monday, etc.
  completions: string[], // Array of ISO date strings "YYYY-MM-DD"
  todayIsoDate: string
): { currentStreak: number; longestStreak: number } {
  if (!scheduledDaysOfWeek || scheduledDaysOfWeek.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const completionSet = new Set(completions);
  const today = new Date(todayIsoDate + "T12:00:00Z");

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Iterate backwards from today up to 365 days
  let streakStillActive = true;

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setUTCDate(today.getUTCDate() - i);
    const dateStr = checkDate.toISOString().slice(0, 10);
    const dayOfWeek = checkDate.getUTCDay();

    const isScheduled = scheduledDaysOfWeek.includes(dayOfWeek);

    if (isScheduled) {
      const isCompleted = completionSet.has(dateStr);
      if (isCompleted) {
        tempStreak++;
        if (streakStillActive) {
          currentStreak++;
        }
      } else {
        // If today is scheduled and not yet completed, don't break the streak immediately
        // if user is still in the middle of today (i = 0)
        if (i === 0) {
          // Today's scheduled task pending - do not kill previous streak
          continue;
        }
        streakStillActive = false;
        tempStreak = 0;
      }
    } else {
      // Unscheduled day: passes through without breaking streak!
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

/**
 * Calculates continuous coding streak from solved problem timestamps
 */
export function calculateCodingStreak(
  solvedDates: string[], // Array of "YYYY-MM-DD"
  todayIsoDate: string
): { currentStreak: number; longestStreak: number } {
  const dateSet = new Set(solvedDates);
  const today = new Date(todayIsoDate + "T12:00:00Z");

  let currentStreak = 0;
  let streakActive = true;

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setUTCDate(today.getUTCDate() - i);
    const dateStr = checkDate.toISOString().slice(0, 10);

    if (dateSet.has(dateStr)) {
      if (streakActive) currentStreak++;
    } else {
      if (i === 0) {
        // If today has no solve yet, streak can still be valid from yesterday
        continue;
      }
      streakActive = false;
      break;
    }
  }

  // Calculate longest historical streak
  const sortedDates = Array.from(dateSet).sort();
  let longestStreak = 0;
  let running = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const currDate = new Date(dStr + "T12:00:00Z");
    if (!prevDate) {
      running = 1;
    } else {
      const diffMs = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        running++;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    prevDate = currDate;
    if (running > longestStreak) longestStreak = running;
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

/**
 * Pomodoro elapsed time calculation using absolute timestamps
 */
export function calculatePomodoroRemaining(
  startTimestampMs: number,
  durationSeconds: number,
  nowTimestampMs: number,
  accumulatedPausedMs: number
): { remainingSeconds: number; isCompleted: boolean; elapsedSeconds: number } {
  const effectiveElapsedMs = Math.max(0, nowTimestampMs - startTimestampMs - accumulatedPausedMs);
  const elapsedSeconds = Math.floor(effectiveElapsedMs / 1000);
  const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

  return {
    remainingSeconds,
    isCompleted: remainingSeconds <= 0,
    elapsedSeconds,
  };
}
