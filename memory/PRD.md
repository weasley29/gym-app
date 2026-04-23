# Gym Log — Fitness Tracker (PRD)

## Summary
Local-first Expo React Native fitness tracker. 6 muscle groups × 10+ exercises, reps/weight/notes logging, muscle diagram visualization, rest timer, calendar history, and insights.

## Navigation
Bottom-tab layout with 4 primary screens:
- **Home** — muscle-group grid + quick stats
- **History** — month calendar with per-day sets + delete
- **Insights** — weekly muscle heatmap + undertrained-muscle alerts
- **Settings** — unit, body type, rest timer, clear data

Stack routes (above tabs): `category/[id]`, `exercise/[id]`.

## Key Features (v1.1)
- Pre-seeded exercises with `primary` + `secondary` muscle tags and description/form tips
- Custom exercises (long-press to delete)
- Optional notes per logged set
- Rest timer: presets 45s / 60s / 2m / 5m + custom, optional auto-start
- Haptic feedback via `expo-haptics` + `Vibration` on timer end
- Female/male body-diagram toggle (female default) with SVG silhouette
- Muscle diagram highlights primary (red) + secondary (orange), front/back view toggle
- Calendar history with tap-to-view sets + delete
- Insights: weekly muscle volume heatmap, 7-day window, alerts for muscles not trained in 5+ days
- Dark premium theme, bottom tabs

## Data model
```ts
LoggedSet { id, exerciseId, exerciseName?, categoryId, reps, weight (kg), notes?, date }
Settings  { unit, bodyType, restTimerEnabled, restTimerSeconds }
ExerciseMeta { name, primary[], secondary[], description, tips }
```

## Tech
Expo SDK 54, expo-router (tabs + stack), react-native-svg (LineChart + MuscleDiagram), @react-native-async-storage/async-storage, expo-haptics.

## Status
Local-first, ready for EAS APK build. Expo-doctor 17/17 ✓.
