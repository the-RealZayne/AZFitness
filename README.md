# AZFitness

AZFitness is a black/yellow/gold family workout and health-tracking PWA for Zayne and CAK3D on Android phones.

## What is built now

- Static installable PWA for Android Chrome/Samsung Internet.
- Athlete login with name dropdown, first PIN `0000`, then verified 4-digit PIN. Profiles are not switchable inside the app; use **Log out / switch athlete**.
- Required editable athlete info: birthday, sex, height in feet/inches, weight in pounds, weekly load, limitations/injuries, profile picture, and theme settings.
- Weekly target entry for workouts, miles, minutes, steps, water, protein, sleep, and meditation.
- Goal planner with choices like bulk up, strengthen core, walk, run, hike, yoga, meditate, condition, mobility, recovery, and family challenges.
- Prebuilt and custom workout builder with activity types including walk, run, hike, bike, weights, swimming, kayaking, sports, yoga, mobility, and conditioning.
- Step-by-step workout onboarding: start a routine, move exercise by exercise, finish and save the session.
- MediaPipe Pose Landmarker live coach with skeleton overlay, joint angles, posture checks, rep counting, and pinpoint correction events.
- Samsung-style health monitor board for manual tracking of mindfulness, body composition, steps, water, medications, blood oxygen, blood pressure, blood glucose, health records, age index, antioxidant index, vascular load, heart rate, stress, sleep, breathing, and focus/pupil proxy.
- Weather/environment capture via Open-Meteo: temperature, humidity, heat/feels-like, UV, and wind.
- Food/beverage search using a local fallback database plus public Open Food Facts results, amounts, meal types, calories, protein, carbs, and fat.
- Meal plan generator with recipes, portions, timing, calorie targets, protein, and water targets based on profile stats.
- GPS route tracker with start/stop, miles, mph, route drawing, saved routes, route notes, delete, and manual point entry.
- Clickable muscle map that shows routines for body areas.
- Journey timeline with workouts, route stats, before/during/after stats, correction markers, and progress photos.
- Supabase JSON snapshot cloud-sync client wiring through browser-safe public env vars.

## Safety / privacy

This app is for fitness education and self-tracking, not medical diagnosis. Kids should train with adult supervision. Camera-derived heart rate, breathing, pupil/focus, posture, and joint-angle values are estimates/proxies. Use real medical devices for blood pressure, blood oxygen, glucose, and similar health readings.

A browser PWA cannot directly read Samsung Health data. The app currently supports manual entry and future Health Connect/native Android bridge work.

## Local development

```bash
npm run build
npm run serve:public
```

No install step is required for the current static build.

## Supabase setup

Use only browser-safe public values in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Do **not** put service-role, secret, JWT signing keys, database passwords, or private tokens in this repo.

Suggested cloud-sync table is included at `supabase/migrations/001_azfitness_sync.sql`. Apply it in the Supabase SQL editor for the Workout App project, or deploy it with a valid Supabase DB connection string. The browser app syncs through the public key and a per-profile PIN hash header.
