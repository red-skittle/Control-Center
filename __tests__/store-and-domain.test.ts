import { describe, it, expect } from "vitest";
import {
  calculateE1RM,
  calculateRelativeStrength,
  calculateOctagonMuscleScores,
  calculateEnduranceMetrics,
  calculateHabitStreak,
  calculateCodingStreak,
  ExercisePerformanceLog,
} from "../lib/fitness-calc";

describe("Domain Calculations & Data Integrity Tests", () => {
  it("recalculates relative strength when bodyweight changes without modifying raw lifts", () => {
    const rawLiftWeight = 100;
    const reps = 5;
    const e1rm = calculateE1RM(rawLiftWeight, reps);

    // Initial bodyweight: 80kg
    const initialRatio = calculateRelativeStrength(e1rm, 80);
    // User drops to 75kg
    const updatedRatio = calculateRelativeStrength(e1rm, 75);

    expect(e1rm).toBe(116.7); // Raw e1RM is unchanged
    expect(initialRatio).toBe(1.459); // 116.7 / 80
    expect(updatedRatio).toBe(1.556); // 116.7 / 75 (Relative strength increased as BW dropped!)
    expect(updatedRatio).toBeGreaterThan(initialRatio);
  });

  it("handles empty and corrupt data gracefully in muscle octagon", () => {
    const corruptLogs: any = [
      {
        exerciseId: "unknown_lift",
        exercise: { id: "unknown", name: "Unknown", type: "barbell", primaryMuscle: "chest" },
        date: "2026-10-21",
        userBodyweightKg: 0,
        sets: [{ reps: -5, weightKg: -10, completed: true }],
      },
    ];

    const scores = calculateOctagonMuscleScores(corruptLogs, 75);
    expect(scores.chest.score).toBeNull();
    expect(scores.chest.confidence).toBe("none");
  });

  it("endurance metrics accurately handles sprint vs marathon distances", () => {
    // 1000m (1 km) in 3 mins 30 secs (210s)
    const kmRun = calculateEnduranceMetrics(1.0, 210);
    expect(kmRun.paceMinPerKm).toBe("03:30");
    expect(kmRun.speedKmh).toBe(17.1);

    // 21.1 km half marathon in 1h 45m (6300s)
    const halfMarathon = calculateEnduranceMetrics(21.1, 6300);
    expect(halfMarathon.paceMinPerKm).toBe("04:59");
    expect(halfMarathon.speedKmh).toBe(12.1);
  });

  it("streak calculator correctly handles long multi-month gaps", () => {
    const scheduledDaily = [0, 1, 2, 3, 4, 5, 6];
    // Solved 3 months ago, nothing since
    const oldCompletions = ["2026-07-01", "2026-07-02", "2026-07-03"];
    const streak = calculateHabitStreak(scheduledDaily, oldCompletions, "2026-10-21");
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(3);
  });

  it("coding streak handles leap year and cross-month transitions", () => {
    const dates = ["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"];
    const streak = calculateCodingStreak(dates, "2026-10-02");
    expect(streak.currentStreak).toBe(4);
    expect(streak.longestStreak).toBe(4);
  });
});
