// Canonical muscle IDs used across the app.
export const MUSCLE_IDS = [
  'chest',
  'abs',
  'obliques',
  'shoulders',
  'biceps',
  'forearms',
  'traps',
  'upper-back',
  'lats',
  'lower-back',
  'triceps',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
] as const;

export type MuscleId = (typeof MUSCLE_IDS)[number];

export const MUSCLE_LABELS: Record<MuscleId, string> = {
  chest: 'Chest',
  abs: 'Abs',
  obliques: 'Obliques',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  forearms: 'Forearms',
  traps: 'Traps',
  'upper-back': 'Upper Back',
  lats: 'Lats',
  'lower-back': 'Lower Back',
  triceps: 'Triceps',
  glutes: 'Glutes',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  calves: 'Calves',
};

// Which body view(s) each muscle appears on.
export const MUSCLE_SIDES: Record<MuscleId, ('front' | 'back')[]> = {
  chest: ['front'],
  abs: ['front'],
  obliques: ['front'],
  shoulders: ['front', 'back'],
  biceps: ['front'],
  forearms: ['front', 'back'],
  traps: ['back'],
  'upper-back': ['back'],
  lats: ['back'],
  'lower-back': ['back'],
  triceps: ['back'],
  glutes: ['back'],
  quads: ['front'],
  hamstrings: ['back'],
  calves: ['back'],
};
