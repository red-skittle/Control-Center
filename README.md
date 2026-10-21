# Control Center | Personal Productivity & Fitness Telemetry

A high-performance, dark-mode personal control center designed with native Apple VisionOS / iOS glassmorphic aesthetics (originally prototyped in Google Stitch) and built with Next.js 14 App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL.

---

## Architecture & Technology Stack

* **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript.
* **Styling**: Tailwind CSS with custom Apple frosted glass design tokens (`apple-glass-panel`, `apple-glass-card`, `apple-glass-pill`, `visionos-dock`, `apple-spring-press`).
* **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) on every table.
* **Resilient Data Layer**: Client-side reactive persistence store (`lib/storage/store.ts`) that functions seamlessly out of the box (offline / local storage) and synchronizes with Supabase when credentials are configured.
* **Testing Suite**: Vitest for domain calculation testing (31 passing unit tests).
* **Target Deployment**: Vercel.

---

## Core Implemented Modules

### 1. Homepage Dashboard (`/`)
* **Top Navigation Bar**: Native frosted header with squircle avatar, active discipline score, ⌘K command shortcut, and quick action trigger.
* **Executive Header & XP Telemetry**: Live XP bar (8,450 / 10,000 XP), level indicator (LVL 24), synchrony multiplier (`1.45x`), and discipline title.
* **KPI Metric Matrix**: 2-column grid tracking completion rate, task velocity, deep focus duration, habit streak, workout logs, and LeetCode cadence.
* **Command Launchpad**: Quick-launch pill ribbon for Focus, Task, Workout, Solve LC, and Daily Note.
* **Neural Focus Engine**: SVG radial countdown ring with configurable presets (25m/5m/15m) and timestamp-accurate elapsed tracking.
* **Execution Engine**: Filterable micro-objectives (All / Pending / Done) with inline completion, XP reward gain, and instant `Enter` key addition.
* **84-Day Activity Heatmap**: 7x12 grid with Apple Blue luminance gradient (GitHub/Apple style) and click-to-inspect daily telemetry.
* **Physique RPG Radar**: 8-axis musculoskeletal index SVG polygon with tooltips, calculation confidence ratings, and historical month-over-month comparison.
* **Cardiovascular Endurance Card**: Separate aerobic tracker calculating pace (min/km), speed (km/h), and weekly distance.
* **Algorithmic Log**: LeetCode progress bar (Easy/Med/Hard), Codeforces Candidate Master telemetry, and recent problem dispatch feed.
* **Chronological Protocol**: Vertical schedule tracking fitness, focus blocks, contests, and habits.
* **VisionOS Dock**: Floating pill dock for navigating between Overview, Tasks, Focus, Fitness, and Profile.

### 2. Profile & Bio-Telemetry (`/profile`)
* **Personal Measurements**: Display name, height (cm), current bodyweight (kg), date of record, preferred units (metric/imperial), age, biological sex (for standard selection), body fat percentage, and resting heart rate.
* **Discipline Settings**: Experience level (beginner, intermediate, advanced, custom), weekly workout target, weekly running target, timezone, and custom directives.
* **Weight History Tracker**: Chronological log of dated bodyweight entries with correction and deletion capabilities.
* **Descriptive BMI**: Explicitly labeled as descriptive and non-diagnostic; bodyweight changes automatically update relative strength ratios across all lifts.

### 3. Strength & Fitness Engine (`/fitness`)
* **Active Workout Logging**: Live session recorder supporting exercises, sets, repetitions, and weights, with real-time e1RM and relative strength calculations.
* **Cancel Without Saving**: Safe cancellation discarding incomplete sets.
* **Scientific e1RM & Relative Strength Calculator**: Epley formula ($w \times (1 + r / 30)$) with transparent formula explanation.
* **Exercise History**: Chronological workout logs with total tonnage volume calculation.

### 4. Execution Task Engine (`/tasks`)
* **Comprehensive Task Management**: Real-time search, priority filtering (Low / Medium / High), status tabs (All / Pending / Done).
* **Detailed Task Creation**: Objective title, description, priority, category, scheduled time, and subtasks.

### 5. Neural Focus Chamber (`/focus`)
* **Deep Focus Mode**: Large circular countdown ring with configurable presets (15m, 25m, 45m, 60m).
* **Task Association**: Link focus blocks directly to active micro-objectives.
* **Timestamp-Based Accuracy**: Tracks start and pause timestamps to prevent background-tab time dilation.
* **Focus Session History**: Logs completed focus blocks with XP rewards.

---

## Fitness Engine Formulas & Scientific References

1. **Estimated 1-Repetition Maximum (e1RM)**:
   $$\text{e1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$
   *Primarily valid for 1–10 reps. Capped at 12 reps to prevent overestimation.*

2. **Relative Strength Ratio**:
   $$\text{Relative Strength} = \frac{\text{e1RM}}{\text{Current Bodyweight (kg)}}$$

3. **8-Axis Musculoskeletal Categories**:
   * Chest, Back, Shoulders, Biceps, Triceps, Quadriceps, Hamstrings & Glutes, Core.
   * Benchmarks mapped piecewise to a 0–100 scale using published standards (ExRx.net / Kilgore adult standards). If insufficient data is logged, confidence is marked as "none" and score displays "Insufficient Data".

4. **Running Endurance Metrics**:
   $$\text{Pace (min/km)} = \frac{\text{Duration (seconds)}}{\text{Distance (km)} \times 60}$$
   $$\text{Speed (km/h)} = \frac{\text{Distance (km)}}{\text{Duration (hours)}}$$

5. **Streak Calculations**:
   * Unscheduled days do **not** break streaks.
   * Only scheduled days where completion is missed break streaks.

---

## Supabase Database Setup & RLS

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/001_initial_schema.sql` and run the script.
   * Creates 15 normalized tables with foreign keys and UUIDs.
   * Enables Row Level Security (RLS) on all tables with `auth.uid() = user_id`.
   * Seeds the standard exercise catalog.
4. Copy your **Project URL** and **Anon Public Key** from Project Settings > API.
5. Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## Local Development & Testing

```bash
# Run unit tests (31 domain calculation tests)
npm test

# Run Next.js development server
npm run dev

# Run production build
npm run build
```

---

## Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel will automatically run `npm run build` and deploy the application.
