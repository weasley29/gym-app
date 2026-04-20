# Iron Log — Fitness Tracker (PRD)

## Summary
A local-first fitness tracker for Expo React Native. 6 muscle groups × up to 10 exercises, reps + weight logging, progress charts, no login.

## Core Features
- **Home**: Bento stats (total workout days, streak, today's volume), 6 muscle-group cards.
- **Category Detail**: List of pre-seeded + custom exercises with last-logged indicator; FAB to add custom exercise.
- **Exercise Detail**: Log reps + weight, today's sets (with delete), progress charts toggle (Max Weight / Volume), per-day history.
- **Settings**: kg/lbs toggle, clear all data.

## Storage
All data stored locally via AsyncStorage. Weights always stored in kg, converted only for display.

## Tech
- Expo Router (file-based routing)
- react-native-svg (custom line chart)
- @react-native-async-storage/async-storage
- @expo/vector-icons (Ionicons)

## Seeded Exercises
- **Chest**: Barbell Bench Press, Incline Dumbbell Press, Decline Bench Press, Dumbbell Flyes, Cable Crossover, Push-Ups, Chest Dips, Machine Chest Press, Pec Deck Machine, Svend Press
- **Back**: Deadlift, Pull-Ups, Barbell Row, Lat Pulldown, Seated Cable Row, T-Bar Row, Single-Arm Dumbbell Row, Face Pull, Shrugs, Hyperextension
- **Legs**: Back Squat, Front Squat, Romanian Deadlift, Leg Press, Walking Lunges, Bulgarian Split Squat, Leg Extension, Leg Curl, Calf Raise, Hip Thrust
- **Shoulders**: Overhead Press, Dumbbell Shoulder Press, Lateral Raise, Front Raise, Rear Delt Fly, Arnold Press, Upright Row, Cable Lateral Raise, Face Pull, Push Press
- **Arms**: Barbell Curl, Dumbbell Curl, Hammer Curl, Preacher Curl, Concentration Curl, Tricep Pushdown, Skull Crushers, Overhead Tricep Extension, Close-Grip Bench Press, Dips
- **Abs**: Plank, Crunches, Hanging Leg Raise, Russian Twist, Bicycle Crunch, Cable Crunch, Mountain Climbers, V-Ups, Ab Wheel Rollout, Side Plank
