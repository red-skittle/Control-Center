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
// AUTHENTIC INITIAL SEED (Matches Stitch UI specifications)
// ==============================================================================
const DEFAULT_PROFILE: UserProfile = {
  displayName: "Alex",
  avatarInitials: "AL",
  heightCm: 180,
  currentBodyweightKg: 77.4,
  weightUpdatedAt: "2026-10-21",
  preferredUnits: "metric",
  age: 24,
  biologicalSex: "male",
  bodyFatPct: 13.5,
  restingHr: 52,
  trainingExperience: "intermediate",
  weeklyWorkoutTarget: 4,
  weeklyRunningTargetKm: 15,
  timezone: "UTC-4",
  weekStartDay: 1,
  xp: 8450,
  level: 24,
  disciplineTitle: "Discipline Architect",
  synchronyMultiplier: 1.45,
  disciplineRatio: 94.2,
  notes: "Focusing on amortized algorithms, clean bulk, and sub-22m 5k pace.",
};

const DEFAULT_BODYWEIGHT_LOGS: BodyweightEntry[] = [
  { id: "bw-1", weightKg: 78.0, recordedDate: "2026-10-01", notes: "Morning fasted" },
  { id: "bw-2", weightKg: 77.8, recordedDate: "2026-10-08", notes: "Post-refeed" },
  { id: "bw-3", weightKg: 77.6, recordedDate: "2026-10-15", notes: "Consistent calorie deficit" },
  { id: "bw-4", weightKg: 77.4, recordedDate: "2026-10-21", notes: "Current low baseline (-0.6kg)" },
];

const DEFAULT_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Complete Upper Hypertrophy Workout (Day 4)",
    description: "Focus on compound chest & shoulder progression.",
    priority: "high",
    category: "FITNESS",
    scheduledTime: "07:00 AM",
    isCompleted: true,
    xpReward: 150,
    subtasks: [
      { id: "st-1", title: "Heavy bench 3x5", completed: true },
      { id: "st-2", title: "Incline DB Press 3x10", completed: true },
      { id: "st-3", title: "Weighted Dips 3x8", completed: true },
    ],
  },
  {
    id: "task-2",
    title: "Solve LC #295: Find Median from Data Stream",
    description: "Dual heap rebalancing approach in C++20.",
    priority: "high",
    category: "ALGO",
    scheduledTime: "08:30 AM",
    isCompleted: true,
    xpReward: 120,
    subtasks: [],
  },
  {
    id: "task-3",
    title: "Hydration protocol: 2,500 mL water intake",
    description: "Electrolytes and hydration monitoring.",
    priority: "medium",
    category: "HABIT",
    scheduledTime: "Daily",
    isCompleted: true,
    xpReward: 50,
    subtasks: [],
  },
  {
    id: "task-4",
    title: "Distributed Cache Architecture Spec Doc",
    description: "Write partition consensus and replication topology.",
    priority: "urgent",
    category: "HIGH PRIORITY",
    scheduledTime: "10:00 AM",
    isCompleted: false,
    xpReward: 100,
    subtasks: [
      { id: "st-4", title: "Write replication failure modes", completed: true },
      { id: "st-5", title: "Draft benchmark evaluation matrix", completed: false },
    ],
  },
  {
    id: "task-5",
    title: "Codeforces Round #940 Div. 2 Virtual Sim",
    description: "Rated algorithmic contest simulation.",
    priority: "medium",
    category: "COMPETITIVE",
    scheduledTime: "06:00 PM",
    isCompleted: false,
    xpReward: 200,
    subtasks: [],
  },
  {
    id: "task-6",
    title: "Read 30 pgs: 'Designing Data-Intensive Apps'",
    description: "Chapter 7: Transactions & Serializability.",
    priority: "low",
    category: "HABIT",
    scheduledTime: "09:00 PM",
    isCompleted: false,
    xpReward: 75,
    subtasks: [],
  },
];

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: "h-1",
    title: "Hydration Protocol (2.5L)",
    category: "HABIT",
    targetType: "binary",
    targetValue: 1,
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    isArchived: false,
  },
  {
    id: "h-2",
    title: "Morning Strength Protocol",
    category: "FITNESS",
    targetType: "binary",
    targetValue: 1,
    scheduledDays: [1, 2, 4, 5], // Mon, Tue, Thu, Fri
    isArchived: false,
  },
  {
    id: "h-3",
    title: "Daily LeetCode Problem",
    category: "ALGO",
    targetType: "binary",
    targetValue: 1,
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    isArchived: false,
  },
  {
    id: "h-4",
    title: "Systems Reading (30m)",
    category: "STUDY",
    targetType: "binary",
    targetValue: 1,
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    isArchived: false,
  },
];

const DEFAULT_HABIT_COMPLETIONS: HabitCompletion[] = [
  { id: "hc-1", habitId: "h-1", completionDate: "2026-10-21", value: 1 },
  { id: "hc-2", habitId: "h-2", completionDate: "2026-10-21", value: 1 },
  { id: "hc-3", habitId: "h-3", completionDate: "2026-10-21", value: 1 },
  { id: "hc-4", habitId: "h-1", completionDate: "2026-10-20", value: 1 },
  { id: "hc-5", habitId: "h-2", completionDate: "2026-10-20", value: 1 },
  { id: "hc-6", habitId: "h-3", completionDate: "2026-10-20", value: 1 },
  { id: "hc-7", habitId: "h-4", completionDate: "2026-10-20", value: 1 },
];

const DEFAULT_WORKOUTS: WorkoutSession[] = [
  {
    id: "w-1",
    name: "Upper Pull A",
    startedAt: "2026-10-21T07:15:00Z",
    completedAt: "2026-10-21T08:20:00Z",
    notes: "Heavy weighted pull-ups and deadlift lockout felt solid.",
    totalVolumeKg: 14250,
    sets: [
      { id: "ws-1", exerciseId: "deadlift", exerciseName: "Conventional Deadlift", setNumber: 1, reps: 5, weightKg: 160, completed: true },
      { id: "ws-2", exerciseId: "deadlift", exerciseName: "Conventional Deadlift", setNumber: 2, reps: 3, weightKg: 175, completed: true },
      { id: "ws-3", exerciseId: "deadlift", exerciseName: "Conventional Deadlift", setNumber: 3, reps: 1, weightKg: 185, completed: true }, // PR 185kg
      { id: "ws-4", exerciseId: "weighted_pullup", exerciseName: "Weighted Pull-up", setNumber: 1, reps: 6, weightKg: 20, completed: true },
      { id: "ws-5", exerciseId: "weighted_pullup", exerciseName: "Weighted Pull-up", setNumber: 2, reps: 5, weightKg: 25, completed: true },
      { id: "ws-6", exerciseId: "barbell_row", exerciseName: "Barbell Bent-Over Row", setNumber: 1, reps: 8, weightKg: 85, completed: true },
      { id: "ws-7", exerciseId: "barbell_curl", exerciseName: "Barbell Biceps Curl", setNumber: 1, reps: 10, weightKg: 40, completed: true },
    ],
  },
  {
    id: "w-2",
    name: "Upper Push & Chest",
    startedAt: "2026-10-19T07:00:00Z",
    completedAt: "2026-10-19T08:15:00Z",
    totalVolumeKg: 12800,
    sets: [
      { id: "ws-8", exerciseId: "bench_press", exerciseName: "Barbell Bench Press", setNumber: 1, reps: 5, weightKg: 100, completed: true },
      { id: "ws-9", exerciseId: "bench_press", exerciseName: "Barbell Bench Press", setNumber: 2, reps: 5, weightKg: 105, completed: true },
      { id: "ws-10", exerciseId: "overhead_press", exerciseName: "Standing Overhead Press", setNumber: 1, reps: 5, weightKg: 65, completed: true },
      { id: "ws-11", exerciseId: "tricep_pushdown", exerciseName: "Cable Tricep Pushdown", setNumber: 1, reps: 12, weightKg: 35, completed: true },
    ],
  },
  {
    id: "w-3",
    name: "Lower Body Heavy",
    startedAt: "2026-10-17T07:30:00Z",
    completedAt: "2026-10-17T08:45:00Z",
    totalVolumeKg: 15100,
    sets: [
      { id: "ws-12", exerciseId: "squat", exerciseName: "Barbell Back Squat", setNumber: 1, reps: 5, weightKg: 135, completed: true },
      { id: "ws-13", exerciseId: "squat", exerciseName: "Barbell Back Squat", setNumber: 2, reps: 5, weightKg: 140, completed: true },
      { id: "ws-14", exerciseId: "romanian_deadlift", exerciseName: "Romanian Deadlift (RDL)", setNumber: 1, reps: 8, weightKg: 120, completed: true },
      { id: "ws-15", exerciseId: "hanging_leg_raise", exerciseName: "Hanging Leg Raise", setNumber: 1, reps: 15, weightKg: 0, completed: true },
    ],
  },
];

const DEFAULT_RUNS: RunningLogEntry[] = [
  {
    id: "r-1",
    title: "Morning Aerobic Base",
    distanceKm: 5.2,
    durationSeconds: 1456, // ~24:16 -> 4:40 min/km
    paceSecondsPerKm: 280,
    speedKmh: 12.9,
    heartRateAvg: 148,
    runType: "easy",
    notes: "Comfortable nasal breathing throughout.",
    runDate: "2026-10-20",
  },
  {
    id: "r-2",
    title: "Tempo Threshold Interval",
    distanceKm: 6.0,
    durationSeconds: 1590, // ~26:30 -> 4:25 min/km
    paceSecondsPerKm: 265,
    speedKmh: 13.6,
    heartRateAvg: 165,
    runType: "tempo",
    notes: "Controlled negative split in final 2km.",
    runDate: "2026-10-16",
  },
];

const DEFAULT_CODING_PROBLEMS: CodingProblemEntry[] = [
  {
    id: "cp-1",
    platform: "leetcode",
    problemId: "295",
    title: "Median from Data Stream",
    url: "https://leetcode.com/problems/find-median-from-data-stream/",
    difficulty: "Hard",
    topicTags: ["Heaps", "Two Pointers", "C++20"],
    dateSolved: "2026-10-21",
    language: "C++20",
    status: "independent",
    notes: "Max-heap for lower half, min-heap for upper half. Balance sizes dynamically.",
  },
  {
    id: "cp-2",
    platform: "leetcode",
    problemId: "207",
    title: "Course Schedule",
    url: "https://leetcode.com/problems/course-schedule/",
    difficulty: "Medium",
    topicTags: ["Topological Sort", "DAG", "Graph"],
    dateSolved: "2026-10-21",
    language: "C++20",
    status: "independent",
    notes: "Kahn's in-degree BFS or cycle detection DFS with recursion stack tracking.",
  },
  {
    id: "cp-3",
    platform: "codeforces",
    problemId: "1941E",
    title: "Rudolf and the Ball Game",
    url: "https://codeforces.com/problemset/problem/1941/E",
    difficulty: "CF 1600",
    rating: 1600,
    topicTags: ["DP with Bitsets", "Modulo", "Simulation"],
    dateSolved: "2026-10-20",
    language: "C++20",
    status: "independent",
    notes: "Bitset bit shift with wrap-around using bitwise OR.",
  },
];

const DEFAULT_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: "ce-1",
    title: "Push Hypertrophy Protocol",
    description: "Compound Chest & Shoulder progression",
    eventType: "workout",
    startTime: "2026-10-21T07:00:00Z",
    isAllDay: false,
    isCompleted: true,
  },
  {
    id: "ce-2",
    title: "Distributed Systems & Red-Black Tree Implementation",
    description: "Locking mechanisms & amortized analysis",
    eventType: "personal",
    startTime: "2026-10-21T10:00:00Z",
    isAllDay: false,
    isCompleted: false,
  },
  {
    id: "ce-3",
    title: "Codeforces Round #940 Div. 2",
    description: "Rated algorithmic competition (2.0h)",
    eventType: "contest",
    startTime: "2026-10-21T18:00:00Z",
    isAllDay: false,
    isCompleted: false,
  },
  {
    id: "ce-4",
    title: "Designing Data-Intensive Applications",
    description: "Chapter 7: Transactions & Serializability",
    eventType: "personal",
    startTime: "2026-10-21T21:00:00Z",
    isAllDay: false,
    isCompleted: false,
  },
];

const DEFAULT_GOALS: GoalItem[] = [
  {
    id: "g-1",
    title: "Solve 500 LeetCode Problems",
    category: "coding",
    targetValue: 500,
    currentValue: 342,
    unit: "Problems",
    startDate: "2026-09-01",
    targetDate: "2026-12-31",
    isCompleted: false,
  },
  {
    id: "g-2",
    title: "Deadlift 200 kg (~2.6x BW)",
    category: "fitness",
    targetValue: 200,
    currentValue: 185,
    unit: "kg",
    startDate: "2026-08-01",
    targetDate: "2026-12-15",
    isCompleted: false,
  },
  {
    id: "g-3",
    title: "5k Run Under 22 Minutes",
    category: "running",
    targetValue: 22,
    currentValue: 24.26,
    unit: "min",
    startDate: "2026-09-01",
    isCompleted: false,
  },
];

// Helper for local storage key
const STORAGE_PREFIX = "control_center_state_v1_";

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
    // Also update current bodyweight on profile
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
            // Reward XP on completion
            setProfile((p) => {
              const newXp = p.xp + t.xpReward;
              const newLevel = Math.floor(newXp / 350) || p.level;
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
    // Reward XP
    setProfile((p) => ({ ...p, xp: p.xp + 100 }));
  };

  const addWorkout = (workout: Omit<WorkoutSession, "id">) => {
    const newWorkout: WorkoutSession = {
      ...workout,
      id: "w-" + Date.now(),
    };
    setWorkouts((prev) => [newWorkout, ...prev]);
    // Reward XP
    setProfile((p) => ({ ...p, xp: p.xp + 150 }));
  };

  const addCodingProblem = (problem: Omit<CodingProblemEntry, "id">) => {
    const newProb: CodingProblemEntry = {
      ...problem,
      id: "cp-" + Date.now(),
    };
    setCodingProblems((prev) => [newProb, ...prev]);
    // Reward XP
    setProfile((p) => ({ ...p, xp: p.xp + (problem.difficulty === "Hard" ? 150 : 100) }));
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
    runs,
    addRun,
    codingProblems,
    addCodingProblem,
    calendarEvents,
    goals,
  };
}
