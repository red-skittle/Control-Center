import { describe, it, expect } from "vitest";
import {
  calculateE1RM,
  calculateRelativeStrength,
  calculateEffectiveSetLoad,
  mapRatioToBenchmarkScore,
  PUBLISHED_BENCHMARKS,
  calculateOctagonMuscleScores,
  calculateEnduranceMetrics,
  calculateHabitStreak,
  calculateCodingStreak,
  calculatePomodoroRemaining,
  ExercisePerformanceLog,
} from "../lib/fitness-calc";

describe("Fitness Calculation Engine", () => {
  describe("e1RM Epley calculation", () => {
    it("returns tested weight for 1 rep", () => {
      expect(calculateE1RM(100, 1)).toBe(100);
    });

    it("calculates Epley formula accurately for 5 reps", () => {
      // 100 * (1 + 5/30) = 100 * (1 + 0.16667) = 116.7
      expect(calculateE1RM(100, 5)).toBe(116.7);
    });

    it("handles zero or negative weights and reps safely", () => {
      expect(calculateE1RM(0, 5)).toBe(0);
      expect(calculateE1RM(100, 0)).toBe(0);
      expect(calculateE1RM(-50, 5)).toBe(0);
    });

    it("caps rep contribution at 12 to prevent absurd overestimation", () => {
      const e1rm12 = calculateE1RM(100, 12);
      const e1rm25 = calculateE1RM(100, 25);
      expect(e1rm25).toBe(e1rm12);
    });
  });

  describe("Relative strength ratio", () => {
    it("computes ratio correctly: 60kg e1RM at 60kg BW gives 1.0", () => {
      expect(calculateRelativeStrength(60, 60)).toBe(1.0);
    });

    it("computes ratio for 140kg e1RM at 70kg BW gives 2.0", () => {
      expect(calculateRelativeStrength(140, 70)).toBe(2.0);
    });

    it("handles zero bodyweight safely", () => {
      expect(calculateRelativeStrength(100, 0)).toBe(0);
    });
  });

  describe("Effective load across exercise types", () => {
    it("computes barbell load directly", () => {
      const set = { reps: 8, weightKg: 80, completed: true };
      expect(calculateEffectiveSetLoad(set, "barbell", 75)).toBe(80);
    });

    it("doubles per-hand load for bilateral dumbbell exercises", () => {
      const set = { reps: 10, weightKg: 24, completed: true };
      expect(calculateEffectiveSetLoad(set, "dumbbell", 75, true)).toBe(48);
    });

    it("computes bodyweight load as user bodyweight", () => {
      const set = { reps: 12, weightKg: 0, completed: true };
      expect(calculateEffectiveSetLoad(set, "bodyweight", 75)).toBe(75);
    });

    it("computes weighted bodyweight as bodyweight + added load", () => {
      const set = { reps: 6, weightKg: 20, completed: true };
      expect(calculateEffectiveSetLoad(set, "weighted_bodyweight", 75)).toBe(95);
    });

    it("computes assisted exercise as bodyweight - assistance load", () => {
      const set = { reps: 8, weightKg: 15, completed: true };
      expect(calculateEffectiveSetLoad(set, "assisted", 75)).toBe(60);
    });
  });

  describe("Benchmark score mapping", () => {
    const benchStandard = PUBLISHED_BENCHMARKS.bench_press;

    it("maps untrained ratio to ~20", () => {
      const score = mapRatioToBenchmarkScore(benchStandard.untrained, benchStandard);
      expect(score).toBe(20);
    });

    it("maps intermediate ratio to ~60", () => {
      const score = mapRatioToBenchmarkScore(benchStandard.intermediate, benchStandard);
      expect(score).toBe(60);
    });

    it("maps advanced ratio to ~80", () => {
      const score = mapRatioToBenchmarkScore(benchStandard.advanced, benchStandard);
      expect(score).toBe(80);
    });

    it("maps elite ratio to ~95", () => {
      const score = mapRatioToBenchmarkScore(benchStandard.elite, benchStandard);
      expect(score).toBe(95);
    });

    it("clamps at 100 for exceptional loads", () => {
      const score = mapRatioToBenchmarkScore(3.0, benchStandard);
      expect(score).toBe(100);
    });
  });

  describe("8-Axis Muscle Octagon scoring and missing data", () => {
    it("returns score: null and confidence: 'none' when no logs exist", () => {
      const result = calculateOctagonMuscleScores([], 75);
      expect(result.chest.score).toBeNull();
      expect(result.chest.confidence).toBe("none");
      expect(result.chest.explanation).toContain("Not enough data");
    });

    it("calculates real scores when logs exist", () => {
      const logs: ExercisePerformanceLog[] = [
        {
          exerciseId: "bench_press",
          exercise: {
            id: "bench_press",
            name: "Barbell Bench Press",
            type: "barbell",
            primaryMuscle: "chest",
            secondaryMuscles: ["triceps", "shoulders"],
          },
          date: "2026-10-20",
          userBodyweightKg: 75,
          sets: [
            { reps: 5, weightKg: 90, completed: true },
            { reps: 5, weightKg: 90, completed: true },
            { reps: 5, weightKg: 90, completed: true },
          ],
        },
      ];

      const result = calculateOctagonMuscleScores(logs, 75);
      expect(result.chest.score).toBeGreaterThan(40);
      expect(result.chest.confidence).toBe("medium");
      expect(result.chest.primaryExercise).toBe("Barbell Bench Press");
      expect(result.quadriceps.score).toBeNull(); // No quad logs
    });
  });

  describe("Endurance and running pace calculations", () => {
    it("calculates pace and speed for 5 km in 25 minutes", () => {
      // 5km in 1500s -> 300s/km -> 05:00 min/km, 12 km/h
      const metrics = calculateEnduranceMetrics(5, 1500);
      expect(metrics.paceMinPerKm).toBe("05:00");
      expect(metrics.speedKmh).toBe(12);
      expect(metrics.isValid).toBe(true);
    });

    it("handles zero distance or duration safely without crashing or returning NaN", () => {
      const zeroDist = calculateEnduranceMetrics(0, 1500);
      expect(zeroDist.isValid).toBe(false);
      expect(zeroDist.paceMinPerKm).toBe("--:--");
      expect(zeroDist.speedKmh).toBe(0);

      const zeroDur = calculateEnduranceMetrics(5, 0);
      expect(zeroDur.isValid).toBe(false);
      expect(zeroDur.speedKmh).toBe(0);
    });
  });

  describe("Habit streaks respecting scheduled days", () => {
    it("does not break streak on an unscheduled day", () => {
      // Habit scheduled Mon (1), Wed (3), Fri (5)
      // Mon Oct 19 2026, Wed Oct 21 2026
      // Tuesday Oct 20 was unscheduled.
      const scheduledDays = [1, 3, 5];
      const completions = ["2026-10-19", "2026-10-21"];
      const streak = calculateHabitStreak(scheduledDays, completions, "2026-10-21");
      expect(streak.currentStreak).toBe(2);
    });

    it("breaks streak when a scheduled day was missed", () => {
      // Daily habit scheduled every day [0..6]
      const scheduledDaily = [0, 1, 2, 3, 4, 5, 6];
      // Completed yesterday Oct 20, but missed Oct 19
      const completions = ["2026-10-20", "2026-10-21"];
      const streak = calculateHabitStreak(scheduledDaily, completions, "2026-10-21");
      expect(streak.currentStreak).toBe(2);
    });
  });

  describe("Coding streak calculation", () => {
    it("calculates continuous streak from solved dates", () => {
      const dates = ["2026-10-19", "2026-10-20", "2026-10-21"];
      const streak = calculateCodingStreak(dates, "2026-10-21");
      expect(streak.currentStreak).toBe(3);
      expect(streak.longestStreak).toBe(3);
    });
  });

  describe("Pomodoro elapsed time calculation", () => {
    it("accurately computes remaining time using timestamps", () => {
      const startMs = 100000;
      const durationSeconds = 1500; // 25 mins
      const nowMs = 100000 + 300000; // 5 mins elapsed
      const pausedMs = 0;

      const result = calculatePomodoroRemaining(startMs, durationSeconds, nowMs, pausedMs);
      expect(result.remainingSeconds).toBe(1200); // 20 mins remaining
      expect(result.elapsedSeconds).toBe(300);
      expect(result.isCompleted).toBe(false);
    });

    it("accounts for paused duration", () => {
      const startMs = 100000;
      const durationSeconds = 1500;
      const nowMs = 100000 + 300000; // 5 mins wall clock
      const pausedMs = 60000; // 1 min spent paused

      const result = calculatePomodoroRemaining(startMs, durationSeconds, nowMs, pausedMs);
      expect(result.elapsedSeconds).toBe(240); // 4 mins actual focus
      expect(result.remainingSeconds).toBe(1260); // 21 mins remaining
    });
  });
});
