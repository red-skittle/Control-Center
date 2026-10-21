-- ==============================================================================
-- CONTROL CENTER DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL (auth.users integration)
-- ==============================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & USER MEASUREMENTS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Operative',
  avatar_initials TEXT NOT NULL DEFAULT 'AL',
  height_cm NUMERIC(5, 2) NOT NULL DEFAULT 180.00,
  current_bodyweight_kg NUMERIC(5, 2) NOT NULL DEFAULT 77.40,
  weight_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  preferred_units TEXT NOT NULL DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  age INTEGER,
  biological_sex TEXT CHECK (biological_sex IN ('male', 'female', 'other', 'unspecified')),
  body_fat_pct NUMERIC(4, 1),
  resting_hr INTEGER,
  training_experience TEXT NOT NULL DEFAULT 'intermediate' CHECK (training_experience IN ('beginner', 'intermediate', 'advanced', 'custom')),
  weekly_workout_target INTEGER NOT NULL DEFAULT 4,
  weekly_running_target_km NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  week_start_day INTEGER NOT NULL DEFAULT 1 CHECK (week_start_day BETWEEN 0 AND 6),
  xp INTEGER NOT NULL DEFAULT 8450,
  level INTEGER NOT NULL DEFAULT 24,
  discipline_title TEXT NOT NULL DEFAULT 'Discipline Architect',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BODYWEIGHT HISTORY
CREATE TABLE IF NOT EXISTS public.bodyweight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5, 2) NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bw_user_date ON public.bodyweight_logs(user_id, recorded_date DESC);

-- 3. TASKS & MICRO-OBJECTIVES
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'GENERAL',
  due_date DATE,
  scheduled_time TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  recurring_rule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, is_completed, due_date);

-- 4. POMODORO FOCUS SESSIONS
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  elapsed_seconds INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'focus' CHECK (mode IN ('focus', 'short', 'long')),
  subject TEXT NOT NULL DEFAULT 'Deep Focus Session',
  subtopic TEXT,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pomo_user_date ON public.pomodoro_sessions(user_id, created_at DESC);

-- 5. HABITS & COMPLETIONS
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'HABIT',
  target_type TEXT NOT NULL DEFAULT 'binary' CHECK (target_type IN ('binary', 'numeric')),
  target_value NUMERIC(6, 2) DEFAULT 1,
  unit TEXT,
  scheduled_days INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  value NUMERIC(6, 2) NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, completion_date)
);
CREATE INDEX IF NOT EXISTS idx_habit_comp_user_date ON public.habit_completions(user_id, completion_date DESC);

-- 6. EXERCISES, ROUTINES, WORKOUTS & SETS
CREATE TABLE IF NOT EXISTS public.exercise_definitions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for built-in catalog
  name TEXT NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('barbell', 'dumbbell', 'bodyweight', 'weighted_bodyweight', 'assisted', 'cable_machine', 'isometric', 'cardio')),
  primary_muscle TEXT NOT NULL CHECK (primary_muscle IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings_glutes', 'core')),
  secondary_muscles TEXT[] NOT NULL DEFAULT '{}',
  is_per_hand_dumbbell BOOLEAN NOT NULL DEFAULT FALSE,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercise_ids TEXT[] NOT NULL DEFAULT '{}',
  target_days_per_week INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  total_volume_kg NUMERIC(8, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES public.exercise_definitions(id) ON DELETE RESTRICT,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0,
  rpe NUMERIC(3, 1),
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sets_workout ON public.workout_sets(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_user_exercise ON public.workout_sets(user_id, exercise_id);

-- 7. RUNNING & ENDURANCE
CREATE TABLE IF NOT EXISTS public.running_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Outdoor Run',
  distance_km NUMERIC(6, 2) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  pace_seconds_per_km INTEGER NOT NULL,
  speed_kmh NUMERIC(4, 1) NOT NULL,
  heart_rate_avg INTEGER,
  run_type TEXT NOT NULL DEFAULT 'easy' CHECK (run_type IN ('easy', 'tempo', 'interval', 'long_run', 'race')),
  notes TEXT,
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_runs_user_date ON public.running_logs(user_id, run_date DESC);

-- 8. CODING ENGINE (LeetCode & Codeforces)
CREATE TABLE IF NOT EXISTS public.coding_problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('leetcode', 'codeforces', 'other')),
  problem_id TEXT NOT NULL, -- e.g. "295" or "1941E"
  title TEXT NOT NULL,
  url TEXT,
  difficulty TEXT NOT NULL, -- e.g. "Easy", "Medium", "Hard", or "1600"
  rating INTEGER,
  topic_tags TEXT[] NOT NULL DEFAULT '{}',
  date_solved DATE NOT NULL DEFAULT CURRENT_DATE,
  language TEXT NOT NULL DEFAULT 'C++20',
  notes TEXT,
  approach TEXT,
  status TEXT NOT NULL DEFAULT 'independent' CHECK (status IN ('independent', 'hints_used', 'solution_assisted')),
  review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_coding_user_date ON public.coding_problems(user_id, date_solved DESC);
CREATE INDEX IF NOT EXISTS idx_coding_user_platform ON public.coding_problems(user_id, platform);

-- 9. CALENDAR & DEADLINES
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'deadline' CHECK (event_type IN ('deadline', 'exam', 'contest', 'workout', 'personal', 'milestone')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_calendar_user_start ON public.calendar_events(user_id, start_time);

-- 10. GOALS & WEEKLY REVIEWS
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('coding', 'fitness', 'running', 'focus', 'habits', 'academic')),
  target_value NUMERIC(8, 2) NOT NULL,
  current_value NUMERIC(8, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  wins TEXT,
  challenges TEXT,
  learnings TEXT,
  next_week_priorities TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bodyweight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Helper macro for standard user isolation
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their bodyweight logs"
  ON public.bodyweight_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their pomodoro sessions"
  ON public.pomodoro_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their habits"
  ON public.habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their habit completions"
  ON public.habit_completions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can read catalog exercises, users can manage custom"
  ON public.exercise_definitions FOR ALL
  USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage workout routines"
  ON public.workout_routines FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage workouts"
  ON public.workouts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage workout sets"
  ON public.workout_sets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage running logs"
  ON public.running_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage coding problems"
  ON public.coding_problems FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage calendar events"
  ON public.calendar_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage goals"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage weekly reviews"
  ON public.weekly_reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- INITIAL CATALOG SEED (Standard Exercises)
-- ==============================================================================
INSERT INTO public.exercise_definitions (id, name, exercise_type, primary_muscle, secondary_muscles, is_per_hand_dumbbell)
VALUES
  ('bench_press', 'Barbell Bench Press', 'barbell', 'chest', ARRAY['triceps', 'shoulders'], FALSE),
  ('incline_db_press', 'Incline Dumbbell Press', 'dumbbell', 'chest', ARRAY['shoulders', 'triceps'], TRUE),
  ('pushups', 'Push-ups', 'bodyweight', 'chest', ARRAY['triceps', 'core'], FALSE),
  ('weighted_pullup', 'Weighted Pull-up', 'weighted_bodyweight', 'back', ARRAY['biceps', 'shoulders'], FALSE),
  ('bodyweight_pullup', 'Bodyweight Pull-up', 'bodyweight', 'back', ARRAY['biceps', 'shoulders'], FALSE),
  ('deadlift', 'Conventional Deadlift', 'barbell', 'back', ARRAY['hamstrings_glutes', 'core'], FALSE),
  ('barbell_row', 'Barbell Bent-Over Row', 'barbell', 'back', ARRAY['biceps', 'shoulders'], FALSE),
  ('overhead_press', 'Standing Overhead Press', 'barbell', 'shoulders', ARRAY['triceps', 'core'], FALSE),
  ('db_lateral_raise', 'Dumbbell Lateral Raise', 'dumbbell', 'shoulders', ARRAY[]::text[], TRUE),
  ('barbell_curl', 'Barbell Biceps Curl', 'barbell', 'biceps', ARRAY[]::text[], FALSE),
  ('db_hammer_curl', 'Dumbbell Hammer Curl', 'dumbbell', 'biceps', ARRAY[]::text[], TRUE),
  ('tricep_pushdown', 'Cable Tricep Pushdown', 'cable_machine', 'triceps', ARRAY[]::text[], FALSE),
  ('skull_crusher', 'Barbell Skull Crusher', 'barbell', 'triceps', ARRAY[]::text[], FALSE),
  ('squat', 'Barbell Back Squat', 'barbell', 'quadriceps', ARRAY['hamstrings_glutes', 'core'], FALSE),
  ('front_squat', 'Barbell Front Squat', 'barbell', 'quadriceps', ARRAY['core'], FALSE),
  ('romanian_deadlift', 'Romanian Deadlift (RDL)', 'barbell', 'hamstrings_glutes', ARRAY['back'], FALSE),
  ('hip_thrust', 'Barbell Hip Thrust', 'barbell', 'hamstrings_glutes', ARRAY['quadriceps'], FALSE),
  ('hanging_leg_raise', 'Hanging Leg Raise', 'bodyweight', 'core', ARRAY[]::text[], FALSE),
  ('cable_woodchopper', 'Cable Woodchopper', 'cable_machine', 'core', ARRAY['shoulders'], FALSE)
ON CONFLICT (id) DO NOTHING;
