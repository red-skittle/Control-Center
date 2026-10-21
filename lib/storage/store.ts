"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabase/client";

export interface UserSession {
  userId: string;
  email: string;
  displayName: string;
}

export interface UserProfile {
  displayName: string;
  avatarInitials: string;
  email: string;
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
  runDate: string;
}

export interface CodingProblemEntry {
  id: string;
  platform: "leetcode" | "codeforces" | "other";
  problemId: string;
  title: string;
  url?: string;
  difficulty: string; // "Easy" | "Medium" | "Hard" | "1600" etc.
  rating?: number;
  topicTags: string[];
  dateSolved: string; // YYYY-MM-DD
  language: string;
  notes?: string;
  approach?: string;
  status: "independent" | "hints_used" | "solution_assisted";
  reviewDate?: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: string;
  targetType: "binary" | "numeric";
  targetValue: number;
  unit?: string;
  scheduledDays: number[];
  isArchived: boolean;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completionDate: string;
  value: number;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  description?: string;
  eventType: "deadline" | "exam" | "contest" | "workout" | "personal" | "milestone";
  startTime: string;
  endTime?: string;
  isAllDay: boolean;
  isCompleted: boolean;
}

// Default clean initial profile for Lakshya
const DEFAULT_REAL_PROFILE: UserProfile = {
  displayName: "Lakshya",
  avatarInitials: "LJ",
  email: "lakshyajha210606@gmail.com",
  heightCm: 180,
  currentBodyweightKg: 77.4,
  weightUpdatedAt: new Date().toISOString().slice(0, 10),
  preferredUnits: "metric",
  age: 20,
  biologicalSex: "male",
  bodyFatPct: 13.0,
  restingHr: 52,
  trainingExperience: "intermediate",
  weeklyWorkoutTarget: 5,
  weeklyRunningTargetKm: 15,
  timezone: "UTC+05:30",
  weekStartDay: 1,
  xp: 1500,
  level: 5,
  disciplineTitle: "Discipline Architect",
  synchronyMultiplier: 1.45,
  disciplineRatio: 96.5,
  notes: "Clean real metrics. Focus on compound progressive overload and algorithmic mastery.",
};

const STORAGE_PREFIX = "control_center_real_v2_";

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Failed to read ${key} from storage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to write ${key} to storage:`, err);
  }
}

/**
 * Main application hook for user authentication & real persisted records
 */
export function useControlCenterStore() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() =>
    loadFromStorage<UserSession | null>("auth_user", null)
  );

  const [profile, setProfile] = useState<UserProfile>(() =>
    loadFromStorage("profile", DEFAULT_REAL_PROFILE)
  );

  // REAL DATA ONLY - zero fake entries
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() =>
    loadFromStorage<WorkoutSession[]>("workouts", [])
  );
  const [bodyweightLogs, setBodyweightLogs] = useState<BodyweightEntry[]>(() =>
    loadFromStorage<BodyweightEntry[]>("bodyweight_logs", [
      {
        id: "bw-initial",
        weightKg: 77.4,
        recordedDate: new Date().toISOString().slice(0, 10),
        notes: "Baseline measurement",
      },
    ])
  );
  const [codingProblems, setCodingProblems] = useState<CodingProblemEntry[]>(() =>
    loadFromStorage<CodingProblemEntry[]>("coding_problems", [])
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() =>
    loadFromStorage<TaskItem[]>("tasks", [])
  );
  const [habitCompletions, setHabitCompletions] = useState<HabitCompletion[]>(() =>
    loadFromStorage<HabitCompletion[]>("habit_completions", [])
  );
  const [runs, setRuns] = useState<RunningLogEntry[]>(() =>
    loadFromStorage<RunningLogEntry[]>("runs", [])
  );
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(() =>
    loadFromStorage<CalendarEventItem[]>("calendar_events", [])
  );

  // Sync to local storage
  useEffect(() => saveToStorage("auth_user", currentUser), [currentUser]);
  useEffect(() => saveToStorage("profile", profile), [profile]);
  useEffect(() => saveToStorage("workouts", workouts), [workouts]);
  useEffect(() => saveToStorage("bodyweight_logs", bodyweightLogs), [bodyweightLogs]);
  useEffect(() => saveToStorage("coding_problems", codingProblems), [codingProblems]);
  useEffect(() => saveToStorage("tasks", tasks), [tasks]);
  useEffect(() => saveToStorage("habit_completions", habitCompletions), [habitCompletions]);
  useEffect(() => saveToStorage("runs", runs), [runs]);
  useEffect(() => saveToStorage("calendar_events", calendarEvents), [calendarEvents]);

  // Sync with Supabase on mount / auth change
  useEffect(() => {
    async function initSupabaseUser() {
      if (!isSupabaseConfigured || !supabase) return;

      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        setCurrentUser({
          userId: u.id,
          email: u.email || "lakshyajha210606@gmail.com",
          displayName: u.user_metadata?.displayName || "Lakshya",
        });

        // Load profile from Supabase profiles table
        try {
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", u.id)
            .single();

          if (profileRow) {
            setProfile((prev) => ({
              ...prev,
              displayName: profileRow.display_name || prev.displayName,
              heightCm: profileRow.height_cm || prev.heightCm,
              currentBodyweightKg: profileRow.current_bodyweight_kg || prev.currentBodyweightKg,
              preferredUnits: profileRow.preferred_units || prev.preferredUnits,
              xp: profileRow.xp || prev.xp,
              level: profileRow.level || prev.level,
            }));
          }

          // Load real workouts from Supabase
          const { data: workoutRows } = await supabase
            .from("workouts")
            .select("*, workout_sets(*)")
            .eq("user_id", u.id)
            .order("started_at", { ascending: false });

          if (workoutRows && workoutRows.length > 0) {
            const mappedWorkouts: WorkoutSession[] = workoutRows.map((w: any) => ({
              id: w.id,
              name: w.name,
              startedAt: w.started_at,
              completedAt: w.completed_at,
              notes: w.notes,
              totalVolumeKg: Number(w.total_volume_kg) || 0,
              sets: (w.workout_sets || []).map((s: any) => ({
                id: s.id,
                exerciseId: s.exercise_id,
                exerciseName: s.exercise_id,
                setNumber: s.set_number,
                reps: s.reps,
                weightKg: Number(s.weight_kg),
                completed: s.completed,
              })),
            }));
            setWorkouts(mappedWorkouts);
          }

          // Load real coding problems from Supabase
          const { data: codingRows } = await supabase
            .from("coding_problems")
            .select("*")
            .eq("user_id", u.id)
            .order("date_solved", { ascending: false });

          if (codingRows && codingRows.length > 0) {
            setCodingProblems(
              codingRows.map((cp: any) => ({
                id: cp.id,
                platform: cp.platform,
                problemId: cp.problem_id,
                title: cp.title,
                url: cp.url,
                difficulty: cp.difficulty,
                rating: cp.rating,
                topicTags: cp.topic_tags || [],
                dateSolved: cp.date_solved,
                language: cp.language,
                notes: cp.notes,
                approach: cp.approach,
                status: cp.status,
              }))
            );
          }
        } catch (err) {
          console.warn("Could not sync from Supabase tables:", err);
        }
      }
    }

    initSupabaseUser();
  }, []);

  // --- ACTIONS ---

  const loginUser = (session: UserSession) => {
    setCurrentUser(session);
    setProfile((prev) => ({
      ...prev,
      email: session.email,
      displayName: session.displayName || prev.displayName,
      avatarInitials: (session.displayName || "Lakshya").slice(0, 2).toUpperCase(),
    }));
  };

  const logoutUser = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...partial };
      // Sync to Supabase if authenticated
      if (supabase && currentUser?.userId) {
        supabase
          .from("profiles")
          .upsert({
            user_id: currentUser.userId,
            display_name: updated.displayName,
            height_cm: updated.heightCm,
            current_bodyweight_kg: updated.currentBodyweightKg,
            preferred_units: updated.preferredUnits,
            xp: updated.xp,
            level: updated.level,
            updated_at: new Date().toISOString(),
          })
          .then();
      }
      return updated;
    });
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

    if (supabase && currentUser?.userId) {
      supabase
        .from("bodyweight_logs")
        .insert({
          user_id: currentUser.userId,
          weight_kg: weightKg,
          recorded_date: recordedDate,
          notes,
        })
        .then();
    }
  };

  const deleteBodyweightLog = (id: string) => {
    setBodyweightLogs((prev) => prev.filter((b) => b.id !== id));
  };

  const addWorkout = async (workout: Omit<WorkoutSession, "id">) => {
    const newId = "w-" + Date.now();
    const newWorkout: WorkoutSession = {
      ...workout,
      id: newId,
    };

    setWorkouts((prev) => [newWorkout, ...prev]);

    // Recalculate XP (+150 XP per completed workout)
    setProfile((p) => {
      const newXp = p.xp + 150;
      const newLvl = Math.floor(newXp / 350) + 1;
      return { ...p, xp: newXp, level: newLvl };
    });

    // Save to Supabase
    if (supabase && currentUser?.userId) {
      try {
        const { data: createdW } = await supabase
          .from("workouts")
          .insert({
            user_id: currentUser.userId,
            name: workout.name,
            started_at: workout.startedAt,
            completed_at: workout.completedAt || new Date().toISOString(),
            notes: workout.notes,
            total_volume_kg: workout.totalVolumeKg,
          })
          .select("id")
          .single();

        if (createdW && workout.sets.length > 0) {
          const setsPayload = workout.sets.map((s, idx) => ({
            workout_id: createdW.id,
            user_id: currentUser.userId,
            exercise_id: s.exerciseId,
            set_number: idx + 1,
            reps: s.reps,
            weight_kg: s.weightKg,
            completed: s.completed,
          }));
          await supabase.from("workout_sets").insert(setsPayload);
        }
      } catch (e) {
        console.warn("Failed to write workout to Supabase:", e);
      }
    }
  };

  const addCodingProblem = async (problem: Omit<CodingProblemEntry, "id">) => {
    const newProb: CodingProblemEntry = {
      ...problem,
      id: "cp-" + Date.now(),
    };
    setCodingProblems((prev) => [newProb, ...prev]);

    // Recalculate XP (+100 XP for Med, +150 for Hard)
    const xpBonus = problem.difficulty.toLowerCase().includes("hard") ? 150 : 100;
    setProfile((p) => {
      const newXp = p.xp + xpBonus;
      const newLvl = Math.floor(newXp / 350) + 1;
      return { ...p, xp: newXp, level: newLvl };
    });

    // Save to Supabase
    if (supabase && currentUser?.userId) {
      try {
        await supabase.from("coding_problems").insert({
          user_id: currentUser.userId,
          platform: problem.platform,
          problem_id: problem.problemId,
          title: problem.title,
          url: problem.url,
          difficulty: problem.difficulty,
          rating: problem.rating,
          topic_tags: problem.topicTags,
          date_solved: problem.dateSolved,
          language: problem.language,
          notes: problem.notes,
          approach: problem.approach,
          status: problem.status,
        });
      } catch (e) {
        console.warn("Failed to write coding problem to Supabase:", e);
      }
    }
  };

  const deleteCodingProblem = (id: string) => {
    setCodingProblems((prev) => prev.filter((p) => p.id !== id));
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

    if (supabase && currentUser?.userId) {
      supabase
        .from("tasks")
        .insert({
          user_id: currentUser.userId,
          title,
          priority,
          category,
          is_completed: false,
          xp_reward: 60,
        })
        .then();
    }
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
              const newLvl = Math.floor(newXp / 350) + 1;
              return { ...p, xp: newXp, level: newLvl };
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

  return {
    currentUser,
    loginUser,
    logoutUser,
    profile,
    updateProfile,
    workouts,
    addWorkout,
    bodyweightLogs,
    addBodyweightLog,
    deleteBodyweightLog,
    codingProblems,
    addCodingProblem,
    deleteCodingProblem,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    habitCompletions,
    runs,
    calendarEvents,
  };
}
