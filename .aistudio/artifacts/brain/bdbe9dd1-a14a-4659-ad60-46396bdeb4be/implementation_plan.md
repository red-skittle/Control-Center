# Control Center — Auth Gate, Real Data Telemetry & Comprehensive Exercise Engine

A high-performance personal telemetry platform providing a secure session gate, authentic real user data persistence, a streamlined single-view dashboard (progress bar, activity heatmap, physique matrix, live LeetCode & Codeforces telemetry), and an authentic 120+ exercise strength catalog.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions were confirmed through interactive clarification and will guide implementation:

- **Confirmed Decision 1 (Authentication & Persistence)**: Implement full-stack secure session authentication backed by encrypted client/local persistent storage. Unauthenticated visitors are immediately routed to a streamlined login gate. Default account provisioned for `lakshyajha210606@gmail.com` with password `naruto@21`.
- **Confirmed Decision 2 (Zero Fake Data Policy)**: Completely purge all synthetic mock entries (fake workout logs, fabricated run times, dummy LeetCode entries). Initialize new users with a pristine zero-state that records and reflects only actual user submissions and telemetry.
- **Confirmed Decision 3 (Streamlined Dashboard Composition)**: As requested, the home dashboard will focus strictly on five essential high-signal components:
  1. Top Progress Bar & Identity Telemetry
  2. 84-Day Activity Heatmap (dynamic based on real activity)
  3. Physique Radar Matrix
  4. LeetCode Progress & Problem Solving Widget
  5. Codeforces Contest & Rating Telemetry Widget
- **Confirmed Decision 4 (Real Exercise Dataset)**: Incorporate a curated, authentic dataset of 120+ real-world strength training exercises (covering Chest, Back, Shoulders, Quads, Hamstrings/Glutes, Biceps, Triceps, and Core/Calves) with instant search, muscle group filtering, and immediate rep/weight set logging.
- **Confirmed Decision 5 (Competitive Telemetry)**: Both LeetCode and Codeforces widgets will support live public profile fetching (via API proxy) as well as manual problem solve logging with difficulty and timestamp attribution.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms the application into a secure, private personal command center. It protects all user data behind an authentic credentials gate, strips out placeholder data in favor of genuine user metrics, presents a focused dashboard with engineering and athletic telemetry, and provides a comprehensive strength workout tracker with verified exercises.
- **Target Audience / Persona**: High-discipline software engineers and competitive programmers pursuing serious athletic progression (hypertrophy, strength, endurance) and technical mastery.
- **Key Value**: Replaces scattered apps with a single, private, dark-mode terminal that connects coding problem statistics directly to physical training volume and daily consistency without decorative clutter.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Authentication Gate**:
   - When an unauthenticated user arrives at any route, the interface renders a focused login terminal.
   - User inputs email (`lakshyajha210606@gmail.com`) and password (`naruto@21`), with instant validation, clear error feedback, and session storage.
   - Upon authentication, session state unlocks full navigation and loads the user's personal store.
2. **Streamlined Home Dashboard**:
   - **Executive Header & Top Progress Bar**: Displays authenticated user profile, real level/XP bar calculated dynamically from completed actions, and quick logout control.
   - **84-Day Activity Heatmap**: Renders active training days, problem-solving days, and daily execution streaks calculated strictly from real logs.
   - **Physique Radar Matrix**: Multi-axis relative strength distribution evaluated from verified logged exercise sets against real bodyweight ratios.
   - **LeetCode Progress Widget**: Shows total solved breakdown (Easy, Medium, Hard), live handle synchronization, and a quick-log trigger for freshly solved problems.
   - **Codeforces Telemetry Widget**: Displays current rank title, rating, max rating, contest participation count, and live sync status.
3. **Exercise Library & Workout Logger**:
   - Accessible via navigation or direct action; offers a catalog of 120+ verified barbell, dumbbell, cable, machine, and bodyweight exercises.
   - Real-time search with instant filtering by muscle group (Chest, Back, Legs, Shoulders, Arms, Core).
   - Click to select an exercise, configure target weight (kg/lbs) and reps, check off completed sets, calculate Estimated 1RM, and commit to personal workout history.

#### Visual Identity & Theme
- **Aesthetic Direction**: Apple Pro dark-room telemetry aesthetic. Deep pure black `#000000` canvas, ultra-subtle 1px frosted boundaries (`rgba(255,255,255,0.08)`), high optical legibility.
- **Color Palette & Discipline**:
  - Canvas: 60% pure black (`#000000`) and elevated slate card surfaces (`rgba(20,20,26,0.7)`).
  - Structure: 30% subtle hairline dividers (`rgba(255,255,255,0.12)`) and muted secondary typography.
  - Accent Budget: 10% high-intent Apple Blue (`#0A84FF`) for primary interactions/tabs and Apple Green (`#30D158`) for completed actions and success states.
- **Typography & Tabular Figures**:
  - Display & Headings: Clean sans-serif hierarchy with balanced headline wrapping.
  - Telemetry & Metrics: Monospace tabular numerals (`font-mono tabular-nums`) across all weight figures, timestamps, ratings, and problem counts to guarantee vertical visual alignment.
- **Anti-Slop Restraint**: Zero fake status tickers, no arbitrary AI novelty scores, no pill badge sandwiches on cards, and no static metadata pills.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Secure Session Management & Credential Auth**
  - *Chosen Approach*: Implement a secure auth provider module that validates credentials (`lakshyajha210606@gmail.com` / `naruto@21`) against salted hashes/secure storage with JWT/session tokens stored in persistent client session state.
  - *Why*: Delivers an immediate, reliable login barrier that prevents unauthorized access while ensuring data persists cleanly across page reloads without external network dependencies.
  - *Alternatives Considered*: Cloud database auth (requires third-party provisioning and user OAuth permissions, which user bypassed in favor of direct session storage).
- **Decision 2: Complete Purge of Mock/Fake Data**
  - *Chosen Approach*: Replace initial seed constants with genuine zero-state defaults. User profile begins with authentic baseline attributes, empty workout lists, empty run logs, and empty solved lists, all populated only when the user logs real activities.
  - *Why*: Eliminates confusing placeholder data so every metric reflects authentic accomplishment.
- **Decision 3: Streamlined Front-Page Architecture**
  - *Chosen Approach*: Strip out auxiliary widgets (Pomodoro timer, generic task engine, endurance runs card, schedule calendar) from the front page, dedicating the home view strictly to: Top Progress Bar, Activity Heatmap, Physique Matrix, LeetCode Widget, and Codeforces Widget.
  - *Why*: Meets the user's explicit directive for a clean, focused executive overview.
- **Decision 4: 120+ Real Exercises Database**
  - *Chosen Approach*: Create a structured, typed catalog of 120+ authentic gym exercises with categorized muscle targets (Chest, Back, Quadriceps, Hamstrings, Glutes, Shoulders, Biceps, Triceps, Core), equipment types (Barbell, Dumbbell, Cable, Machine, Bodyweight), and calibrated 1RM formulas.
  - *Why*: Solves the user's workout logging needs with real-world gym movements rather than an arbitrary 10-item demo list.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Root Application Gate                    │
│      (Checks Auth Session; redirects to Login if unauthed)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [ /login View ]                       [ Authenticated App ]
  • Email & Password Input              • Session Token / Cookie
  • Default Account Credential          • User Context Provider
  • Validation & Error State            • Logout Handler
                                                  │
            ┌─────────────────────────────────────┴─────────────────────────────────────┐
            ▼                                     ▼                                     ▼
┌───────────────────────┐             ┌───────────────────────┐             ┌───────────────────────┐
│     Home Dashboard    │             │   Fitness & Workouts  │             │  Competitive Telemetry│
│ • Top Progress & XP   │             │ • 120+ Exercise DB    │             │ • LeetCode Widget     │
│ • Activity Heatmap    │             │ • Muscle Filter/Search│             │   (Live sync + Log)   │
│ • Physique Radar      │             │ • Sets/Reps/Weight Log│             │ • Codeforces Widget   │
│ • LeetCode / CF strip │             │ • E1RM Calculation   │             │   (Live sync + Log)   │
└───────────┬───────────┘             └───────────┬───────────┘             └───────────┬───────────┘
            │                                     │                                     │
            └─────────────────────────────────────┼─────────────────────────────────────┘
                                                  ▼
                                ┌───────────────────────────────────┐
                                │       Persistent User Store       │
                                │ • Keyed by User ID / Email        │
                                │ • Pure Real Data (No Mock Bloat)  │
                                │ • Workouts, Solved Problems, Logs │
                                └───────────────────────────────────┘
```

#### Data Entities & Schema
- **Auth Session**: `{ user: { email, name, role }, token: string, isAuthenticated: boolean }`
- **User Profile**: `{ displayName, email, currentBodyweightKg, heightCm, xp, level, preferredUnits }`
- **Exercise Definition**: `{ id, name, category, muscleGroup, equipment, defaultReps, description }`
- **Workout Log**: `{ id, name, startedAt, completedAt, totalVolumeKg, sets: [{ exerciseId, exerciseName, setNumber, reps, weightKg, completed }] }`
- **Competitive Problem**: `{ id, platform: "leetcode" | "codeforces", problemId, title, difficulty, rating?, dateSolved, url? }`
- **Competitive Profile**: `{ leetcodeUsername?, leetcodeStats?, codeforcesUsername?, codeforcesStats? }`

#### Interactive State & View Transitions
- **Login Transition**: Immediate smooth transition from Login Gate into Dashboard upon entering valid credentials; instant logout capability from header.
- **Search & Filter**: Real-time debounce-free instant text search against the 120+ exercise catalog with multi-category chips (Chest, Back, Legs, Shoulders, Arms, Core).
- **Set Logging**: Dynamic add/remove set rows with live calculated volume and Estimated 1RM display.
- **Telemetry Fetching**: Next.js server proxy API routes (`/api/telemetry/leetcode`, `/api/telemetry/codeforces`) to fetch real public profiles without CORS issues.
