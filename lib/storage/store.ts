"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabase/client";

export interface UserProfile {
  displayName: string;
  avatarInitials: string;
  heightCm: number;
  currentBodyweightKg: number;
  weightUpdatedAt: string;
  preferredUnits: "metric" | "imperial";
  age?: number;
  biologicalSex?: "male" | "female" | "other" | "unspecified";
  bodyFatPct?: number;
  restingHr?: number;
  trainingExperience: "beginner" | "intermediate" | "advanced" | "custom";
  weeklyWorkoutTarget: number;
  weeklyRunningTargetKm: number;
  timezone: string;
  weekStartDay: number;
  xp: number;
  level: number;
  disciplineTitle: string;
  synchronyMultiplier: number;
  disciplineRatio: number;
  notes?: string;
  leetcodeUsername?: string;
  codeforcesUsername?: string;
}

export interface BodyweightEntry {
  id: string;
  weightKg: number;
  recordedDate: string; // YYYY-MM-DD
  notes?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  dueDate?: string;
  scheduledTime?: string;
  isCompleted: boolean;
  xpReward: number;
  subtasks: { id: string; title: string; completed: boolean }[];
}

export interface PomodoroSession {
  id: string;
  durationSeconds: number;
  elapsedSeconds: number;
  mode: "focus" | "short" | "long";
  subject: string;
  subtopic: string;
  completed: boolean;
  startedAt: string;
  endedAt: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: string;
  targetType: "binary" | "numeric";
  targetValue: number;
  unit?: string;
  scheduledDays: number[]; // 0=Sun..6=Sat
  isArchived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completionDate: string; // YYYY-MM-DD
  value: number;
}

export interface WorkoutSetItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
  rpe?: number;
}

export interface WorkoutSession {
  id: string;
  name: string;
  startedAt: string;
  completedAt?: string;
  notes?: string;
  totalVolumeKg: number;
  sets: WorkoutSetItem[];
}

export interface RunningLogEntry {
  id: string;
  title: string;
  distanceKm: number;
  durationSeconds: number;
  paceSecondsPerKm: number;
  speedKmh: number;
  heartRateAvg?: number;
  runType: "easy" | "tempo" | "interval" | "long_run" | "race";
  notes?: string;
  runDate: string; // YYYY-MM-DD
}

export interface CodingProblemEntry {
  id: string;
  platform: "leetcode" | "codeforces" | "other";
  problemId: string;
  title: string;
  url?: string;
  difficulty: string;
  rating?: number;
  topicTags: string[];
  dateSolved: string; // YYYY-MM-DD
  language: string;
  notes?: string;
  approach?: string;
  status: "independent" | "hints_used" | "solution_assisted";
  reviewDate?: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  eventType: "deadline" | "exam" | "contest" | "workout" | "personal" | "milestone";
  startTime: string; // ISO
  endTime?: string;
  isAllDay: boolean;
  isCompleted: boolean;
}

export interface GoalItem {
  id: string;
  title: string;
  category: "coding" | "fitness" | "running" | "focus" | "habits" | "academic";
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate?: string;
  isCompleted: boolean;
}

// ==============================================================================
// REAL DATA DEFAULTS - PURGED OF ALL SYNTHETIC FAKE ENTRIES
// ==============================================================================
const DEFAULT_PROFILE: UserProfile = {
  displayName: "Lakshya",
  avatarInitials: "LJ",
  heightCm: 178,
  currentBodyweightKg: 75.0,
  weightUpdatedAt: new Date().toISOString().slice(0, 10),
  preferredUnits: "metric",
  age: 21,
  biologicalSex: "male",
  bodyFatPct: 14.0,
  restingHr: 58,
  trainingExperience: "intermediate",
  weeklyWorkoutTarget: 4,
  weeklyRunningTargetKm: 15,
  timezone: "UTC",
  weekStartDay: 1,
  xp: 0,
  level: 1,
  disciplineTitle: "Operative",
  synchronyMultiplier: 1.0,
  disciplineRatio: 100,
  notes: "Genuine telemetry stream active.",
  leetcodeUsername: "",
  codeforcesUsername: "",
};

// All arrays initialize purely empty - only real data created by user will appear
const DEFAULT_BODYWEIGHT_LOGS: BodyweightEntry[] = [];
const DEFAULT_TASKS: TaskItem[] = [];
const DEFAULT_HABITS: HabitItem[] = [];
const DEFAULT_HABIT_COMPLETIONS: HabitCompletion[] = [];
const DEFAULT_WORKOUTS: WorkoutSession[] = [];
const DEFAULT_RUNS: RunningLogEntry[] = [];
const DEFAULT_CODING_PROBLEMS: CodingProblemEntry[] = [];
const DEFAULT_CALENDAR_EVENTS: CalendarEventItem[] = [];
const DEFAULT_GOALS: GoalItem[] = [];

// Storage prefix dedicated to real telemetry store
const STORAGE_PREFIX = "control_center_real_v2_";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Failed to read ${key} from localStorage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to write ${key} to localStorage:`, err);
  }
}

/**
 * Universal Reactive Store Hook
 */
export function useControlCenterStore() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    loadFromStorage("profile", DEFAULT_PROFILE)
  );
  const [bodyweightLogs, setBodyweightLogs] = useState<BodyweightEntry[]>(() =>
    loadFromStorage("bodyweight_logs", DEFAULT_BODYWEIGHT_LOGS)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadFromStorage("tasks", DEFAULT_TASKS)
  );
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    loadFromStorage("habits", DEFAULT_HABITS)
  );
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>(() =>
    loadFromStorage("habit_completions", DEFAULT_HABIT_COMPLETIONS)
  );
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() =>
    loadFromStorage("workouts", DEFAULT_WORKOUTS)
  );
  const [runs, setRuns] = useState<RunningLogEntry[]>(() =>
    loadFromStorage("runs", DEFAULT_RUNS)
  );
  const [codingProblems, setCodingProblems] = useState<CodingProblemEntry[]>(() =>
    loadFromStorage("coding_problems", DEFAULT_CODING_PROBLEMS)
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(() =>
    loadFromStorage("calendar_events", DEFAULT_CALENDAR_EVENTS)
  );
  const [goals, setGoals] = useState<GoalItem[]>(() =>
    loadFromStorage("goals", DEFAULT_GOALS)
  );

  // Synchronize state changes to localStorage
  useEffect(() => saveToStorage("profile", profile), [profile]);
  useEffect(() => saveToStorage("bodyweight_logs", bodyweightLogs), [bodyweightLogs]);
  useEffect(() => saveToStorage("tasks", tasks), [tasks]);
  useEffect(() => saveToStorage("habits", habits), [habits]);
  useEffect(() => saveToStorage("habit_completions", habitCompletions), [habitCompletions]);
  useEffect(() => saveToStorage("workouts", workouts), [workouts]);
  useEffect(() => saveToStorage("runs", runs), [runs]);
  useEffect(() => saveToStorage("coding_problems", codingProblems), [codingProblems]);
  useEffect(() => saveToStorage("calendar_events", calendarEvents), [calendarEvents]);
  useEffect(() => saveToStorage("goals", goals), [goals]);

  // Actions
  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  };

  const addBodyweightLog = (weightKg: number, recordedDate: string, notes?: string) => {
    const newEntry: BodyweightEntry = {
      id: "bw-" + Date.now(),
      weightKg,
      recordedDate,
      notes,
    };
    setBodyweightLogs((prev) => [newEntry, ...prev]);
    updateProfile({
      currentBodyweightKg: weightKg,
      weightUpdatedAt: recordedDate,
    });
  };

  const deleteBodyweightLog = (id: string) => {
    setBodyweightLogs((prev) => prev.filter((b) => b.id !== id));
  };

  const addTask = (title: string, priority: "low" | "medium" | "high" = "medium", category = "GENERAL") => {
    const newTask: TaskItem = {
      id: "task-" + Date.now(),
      title,
      priority,
      category,
      isCompleted: false,
      xpReward: 60,
      subtasks: [],
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.isCompleted;
          if (nextState) {
            setProfile((p) => {
              const newXp = p.xp + t.xpReward;
              const newLevel = Math.floor(newXp / 350) + 1;
              return { ...p, xp: newXp, level: newLevel };
            });
          }
          return { ...t, isCompleted: nextState };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addRun = (run: Omit<RunningLogEntry, "id">) => {
    const newRun: RunningLogEntry = {
      ...run,
      id: "run-" + Date.now(),
    };
    setRuns((prev) => [newRun, ...prev]);
    setProfile((p) => {
      const newXp = p.xp + 100;
      const newLevel = Math.floor(newXp / 350) + 1;
      return { ...p, xp: newXp, level: newLevel };
    });
  };

  const addWorkout = (workout: Omit<WorkoutSession, "id">) => {
    const newWorkout: WorkoutSession = {
      ...workout,
      id: "w-" + Date.now(),
    };
    setWorkouts((prev) => [newWorkout, ...prev]);
    setProfile((p) => {
      const newXp = p.xp + 150;
      const newLevel = Math.floor(newXp / 350) + 1;
      return { ...p, xp: newXp, level: newLevel };
    });
  };

  const deleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const addCodingProblem = (problem: Omit<CodingProblemEntry, "id">) => {
    const newProb: CodingProblemEntry = {
      ...problem,
      id: "cp-" + Date.now(),
    };
    setCodingProblems((prev) => [newProb, ...prev]);
    setProfile((p) => {
      const gain = problem.difficulty === "Hard" ? 150 : problem.difficulty === "Medium" ? 100 : 50;
      const newXp = p.xp + gain;
      const newLevel = Math.floor(newXp / 350) + 1;
      return { ...p, xp: newXp, level: newLevel };
    });
  };

  const deleteCodingProblem = (id: string) => {
    setCodingProblems((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleHabitToday = (habitId: string, todayIso: string) => {
    setHabitCompletions((prev) => {
      const exists = prev.some((c) => c.habitId === habitId && c.completionDate === todayIso);
      if (exists) {
        return prev.filter((c) => !(c.habitId === habitId && c.completionDate === todayIso));
      } else {
        setProfile((p) => ({ ...p, xp: p.xp + 50 }));
        return [
          ...prev,
          {
            id: "hc-" + Date.now(),
            habitId,
            completionDate: todayIso,
            value: 1,
          },
        ];
      }
    });
  };

  const clearAllUserData = () => {
    setProfile(DEFAULT_PROFILE);
    setBodyweightLogs([]);
    setTasks([]);
    setHabits([]);
    setHabitCompletions([]);
    setWorkouts([]);
    setRuns([]);
    setCodingProblems([]);
    setCalendarEvents([]);
    setGoals([]);
    if (typeof window !== "undefined") {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    }
  };

  return {
    profile,
    updateProfile,
    bodyweightLogs,
    addBodyweightLog,
    deleteBodyweightLog,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    habits,
    habitCompletions,
    toggleHabitToday,
    workouts,
    addWorkout,
    deleteWorkout,
    runs,
    addRun,
    codingProblems,
    addCodingProblem,
    deleteCodingProblem,
    calendarEvents,
    goals,
    clearAllUserData,
  };
}
