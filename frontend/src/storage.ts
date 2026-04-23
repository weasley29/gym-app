import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_EXERCISES, ExerciseMeta } from './seedData';
import { MuscleId } from './muscles';

export type Unit = 'kg' | 'lbs';
export type BodyType = 'female' | 'male';

export type Settings = {
  unit: Unit;
  bodyType: BodyType;
  restTimerEnabled: boolean;
  restTimerSeconds: number; // preset: 45, 60, 120, 300, or any custom int
};

export const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  bodyType: 'female',
  restTimerEnabled: true,
  restTimerSeconds: 60,
};

export type LoggedSet = {
  id: string;
  exerciseId: string;
  exerciseName?: string;   // store for history display
  categoryId: string;
  reps: number;
  weight: number;          // always stored in kg
  notes?: string;
  date: string;            // ISO
};

export type CustomExercise = {
  id: string;
  name: string;
  categoryId: string;
  primary?: string[];
  secondary?: string[];
};

const K_SETTINGS = 'ft.settings';
const K_SETS = 'ft.sets';
const K_CUSTOM = 'ft.customExercises';

// Settings
export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(K_SETTINGS);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(K_SETTINGS, JSON.stringify(s));
}

// Sets
export async function getAllSets(): Promise<LoggedSet[]> {
  const raw = await AsyncStorage.getItem(K_SETS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
export async function addSet(s: LoggedSet): Promise<void> {
  const all = await getAllSets();
  all.push(s);
  await AsyncStorage.setItem(K_SETS, JSON.stringify(all));
}
export async function deleteSet(id: string): Promise<void> {
  const all = await getAllSets();
  await AsyncStorage.setItem(K_SETS, JSON.stringify(all.filter((s) => s.id !== id)));
}
export async function updateSet(updated: LoggedSet): Promise<void> {
  const all = await getAllSets();
  const next = all.map((s) => (s.id === updated.id ? updated : s));
  await AsyncStorage.setItem(K_SETS, JSON.stringify(next));
}

// Custom exercises
export async function getCustomExercises(): Promise<CustomExercise[]> {
  const raw = await AsyncStorage.getItem(K_CUSTOM);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
export async function addCustomExercise(e: CustomExercise): Promise<void> {
  const all = await getCustomExercises();
  all.push(e);
  await AsyncStorage.setItem(K_CUSTOM, JSON.stringify(all));
}
export async function deleteCustomExercise(id: string): Promise<void> {
  const all = await getCustomExercises();
  await AsyncStorage.setItem(K_CUSTOM, JSON.stringify(all.filter((e) => e.id !== id)));
  // also purge sets logged under this exerciseId
  const sets = await getAllSets();
  await AsyncStorage.setItem(K_SETS, JSON.stringify(sets.filter((s) => s.exerciseId !== id)));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([K_SETTINGS, K_SETS, K_CUSTOM]);
}

// Lookups
export type ExerciseRow = {
  id: string;
  name: string;
  custom: boolean;
  primary: string[];
  secondary: string[];
  description?: string;
  tips?: string;
};

export async function getExercisesForCategory(categoryId: string): Promise<ExerciseRow[]> {
  const defaults: ExerciseRow[] = (DEFAULT_EXERCISES[categoryId] || []).map((e: ExerciseMeta) => ({
    id: `${categoryId}:${e.name}`,
    name: e.name,
    custom: false,
    primary: e.primary,
    secondary: e.secondary,
    description: e.description,
    tips: e.tips,
  }));
  const custom: ExerciseRow[] = (await getCustomExercises())
    .filter((c) => c.categoryId === categoryId)
    .map((c) => ({
      id: c.id,
      name: c.name,
      custom: true,
      primary: c.primary || [],
      secondary: c.secondary || [],
    }));
  return [...defaults, ...custom];
}

export async function findExerciseById(id: string): Promise<ExerciseRow | null> {
  // defaults
  for (const [cat, list] of Object.entries(DEFAULT_EXERCISES)) {
    for (const e of list) {
      if (`${cat}:${e.name}` === id) {
        return {
          id,
          name: e.name,
          custom: false,
          primary: e.primary,
          secondary: e.secondary,
          description: e.description,
          tips: e.tips,
        };
      }
    }
  }
  // custom
  const customs = await getCustomExercises();
  const found = customs.find((c) => c.id === id);
  if (found) {
    return {
      id: found.id,
      name: found.name,
      custom: true,
      primary: found.primary || [],
      secondary: found.secondary || [],
    };
  }
  return null;
}

// Unit conversion (storage is kg)
export function toDisplay(weightKg: number, unit: Unit): number {
  return unit === 'kg' ? weightKg : weightKg * 2.2046226218;
}
export function fromDisplay(weight: number, unit: Unit): number {
  return unit === 'kg' ? weight : weight / 2.2046226218;
}

// Day helpers
export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

export function computeStreak(sets: LoggedSet[]): number {
  if (!sets.length) return 0;
  const days = new Set(sets.map((s) => dayKey(new Date(s.date))));
  let streak = 0;
  const cursor = new Date();
  // allow today missing
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function totalWorkoutDays(sets: LoggedSet[]): number {
  return new Set(sets.map((s) => dayKey(new Date(s.date)))).size;
}

export function todaysVolumeKg(sets: LoggedSet[]): number {
  const now = new Date();
  return sets
    .filter((s) => sameDay(new Date(s.date), now))
    .reduce((acc, s) => acc + s.reps * s.weight, 0);
}

// Insights: muscle usage
export async function muscleVolumeLastDays(
  sets: LoggedSet[],
  days: number
): Promise<Record<MuscleId, number>> {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const result: Record<string, number> = {};
  for (const s of sets) {
    if (new Date(s.date).getTime() < cutoff) continue;
    const ex = await findExerciseById(s.exerciseId);
    if (!ex) continue;
    const volume = s.reps * s.weight || s.reps; // bodyweight sets still count reps
    for (const m of ex.primary) result[m] = (result[m] || 0) + volume;
    for (const m of ex.secondary) result[m] = (result[m] || 0) + volume * 0.5;
  }
  return result as Record<MuscleId, number>;
}

export async function lastTrainedDayForMuscle(
  sets: LoggedSet[],
  muscle: MuscleId
): Promise<Date | null> {
  // scan newest first
  const sorted = [...sets].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const s of sorted) {
    const ex = await findExerciseById(s.exerciseId);
    if (!ex) continue;
    if (ex.primary.includes(muscle) || ex.secondary.includes(muscle)) {
      return new Date(s.date);
    }
  }
  return null;
}
