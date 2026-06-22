# AZFitness

AZFitness is a family-first workout tracker PWA for Android phones. It includes adaptive daily/weekly workout plans, profile stats, camera-based form coaching, step/GPS/heart-rate helpers, theme choices, and optional Supabase authentication/cloud sync.

## What is built now

- Static HTML/CSS/JavaScript PWA installable on Android Chrome/Samsung Internet — no build dependencies required.
- Original black/yellow/gold A-Z Fitness command-center layout.
- Local athlete login with name dropdown, first PIN `0000`, then verified 4-digit PIN stored as a browser hash.
- Multi-profile setup for Zayne and CAK3D with height, weight, age, goals, level, and limitations.
- Daily and weekly choreographed workout programming by category, muscle group, cues, and target joint angles.
- Workout logging with effort, heart rate, steps, miles/GPS notes, calories, and form recap markers.
- MediaPipe Pose Landmarker integration with fallback camera overlay for joint angles, posture score, and pinpoint correction markers.
- Experimental camera wellness proxies for heart-rate/breath rhythm and pupil/focus changes. These are educational only, not medical measurements.
- Progress dashboards with charts for minutes, steps, miles, body metrics, hydration, food, calories, and long-term growth.
- Food/water logging and cloud-sync-ready Supabase notes using environment variables only; local-first mode works now.

## Safety / privacy

This app is for fitness education and self-tracking, not medical diagnosis. Kids should train with adult supervision. Camera clips stay local unless a future sync feature is explicitly added. Camera-derived heart rate, breathing, pupil/focus, posture, and joint-angle values are estimates/proxies and should not be used for health decisions.

## Local development

```bash
npm run build
npm run serve
```

No install step is required for the current static build.

## Supabase setup

Copy `.env.example` to `.env.local` and fill in the project URL plus publishable browser key. Do **not** put service-role, secret, JWT signing keys, passwords, or private tokens in this repo.

```bash
cp .env.example .env.local
```

Suggested tables for the next cloud-sync phase:

- `profiles`: id, owner_id, display_name, birth_year, height_cm, weight_kg, level, goals, limitations, theme
- `workout_sessions`: id, owner_id, profile_id, plan_id, started_at, duration_min, effort, steps, avg_hr, notes
- `form_events`: id, session_id, timestamp_sec, joint, severity, cue, local_clip_ref

Enable Row Level Security so users can only read/write their own data.
