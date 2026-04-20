import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_EXERCISES } from './seedData';

export type Unit = 'kg' | 'lbs';

export type Settings = {
  unit: Unit;
};

export type LoggedSet = {
  id: string;
  exerciseId: string;
  categoryId: string;
  reps: number;
  weight: number; // always stored in kg
  date: string; // ISO
};

export type CustomExercise = {
  id: string;
  name: string;
  categoryId: string;
};

const K_SETTINGS = 'ft.settings';
const K_SETS = 'ft.sets';
const K_CUSTOM = 'ft.customExercises';

export async function getSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(K_SETTINGS);
  if (!raw) return { unit: 'kg' };
  try {
    return JSON.parse(raw);
  } catch {
    return { unit: 'kg' };
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(K_SETTINGS, JSON.stringify(s));
}

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
  const next = all.filter((s) => s.id !== id);
  await AsyncStorage.setItem(K_SETS, JSON.stringify(next));
}

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

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([K_SETTINGS, K_SETS, K_CUSTOM]);
}

export async function getExercisesForCategory(categoryId: string): Promise<
  { id: string; name: string; custom: boolean }[]
> {
  const defaults = (DEFAULT_EXERCISES[categoryId] || []).map((name) => ({
    id: `${categoryId}:${name}`,
    name,
    custom: false,
  }));
  const custom = (await getCustomExercises())
    .filter((c) => c.categoryId === categoryId)
    .map((c) => ({ id: c.id, name: c.name, custom: true }));
  return [...defaults, ...custom];
}

// Unit conversion helpers (storage is in kg)
export function toDisplay(weightKg: number, unit: Unit): number {
  return unit === 'kg' ? weightKg : weightKg * 2.2046226218;
}
export function fromDisplay(weight: number, unit: Unit): number {
  return unit === 'kg' ? weight : weight / 2.2046226218;
}

// Stats helpers
export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function computeStreak(sets: LoggedSet[]): number {
  if (!sets.length) return 0;
  const uniqueDays = new Set(
    sets.map((s) => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (uniqueDays.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // allow today missing
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const k2 = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
        if (uniqueDays.has(k2)) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return streak;
}

export function totalWorkoutDays(sets: LoggedSet[]): number {
  const days = new Set(
    sets.map((s) => {
      const d = new Date(s.date);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  return days.size;
}

export function todaysVolumeKg(sets: LoggedSet[]): number {
  const now = new Date();
  return sets
    .filter((s) => sameDay(new Date(s.date), now))
    .reduce((acc, s) => acc + s.reps * s.weight, 0);
}
