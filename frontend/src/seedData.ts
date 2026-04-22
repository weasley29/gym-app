export type Category = {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  iconLib: 'Ionicons' | 'MaterialCommunityIcons';
  icon: string;
};

export const CATEGORIES: Category[] = [
  {
    id: 'chest',
    name: 'Chest',
    color: '#FF3B30',
    bgColor: '#3A1515',
    iconLib: 'MaterialCommunityIcons',
    icon: 'dumbbell',
  },
  {
    id: 'back',
    name: 'Back',
    color: '#007AFF',
    bgColor: '#102740',
    iconLib: 'MaterialCommunityIcons',
    icon: 'human-handsdown',
  },
  {
    id: 'legs',
    name: 'Legs',
    color: '#34C759',
    bgColor: '#12301B',
    iconLib: 'MaterialCommunityIcons',
    icon: 'run-fast',
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    color: '#FF9500',
    bgColor: '#3A2410',
    iconLib: 'MaterialCommunityIcons',
    icon: 'weight-lifter',
  },
  {
    id: 'arms',
    name: 'Arms',
    color: '#AF52DE',
    bgColor: '#2B1838',
    iconLib: 'MaterialCommunityIcons',
    icon: 'arm-flex',
  },
  {
    id: 'abs',
    name: 'Abs',
    color: '#FFCC00',
    bgColor: '#2E2810',
    iconLib: 'MaterialCommunityIcons',
    icon: 'fire',
  },
];

export const DEFAULT_EXERCISES: Record<string, string[]> = {
  chest: [
    'Barbell Bench Press',
    'Incline Dumbbell Press',
    'Decline Bench Press',
    'Dumbbell Flyes',
    'Cable Crossover',
    'Push-Ups',
    'Chest Dips',
    'Machine Chest Press',
    'Pec Deck Machine',
    'Svend Press',
  ],
  back: [
    'Deadlift',
    'Pull-Ups',
    'Barbell Row',
    'Lat Pulldown',
    'Seated Cable Row',
    'T-Bar Row',
    'Single-Arm Dumbbell Row',
    'Face Pull',
    'Shrugs',
    'Hyperextension',
  ],
  legs: [
    'Back Squat',
    'Front Squat',
    'Romanian Deadlift',
    'Leg Press',
    'Walking Lunges',
    'Bulgarian Split Squat',
    'Leg Extension',
    'Leg Curl',
    'Calf Raise',
    'Hip Thrust',
  ],
  shoulders: [
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Lateral Raise',
    'Front Raise',
    'Rear Delt Fly',
    'Arnold Press',
    'Upright Row',
    'Cable Lateral Raise',
    'Face Pull',
    'Push Press',
  ],
  arms: [
    'Barbell Curl',
    'Dumbbell Curl',
    'Hammer Curl',
    'Preacher Curl',
    'Concentration Curl',
    'Tricep Pushdown',
    'Skull Crushers',
    'Overhead Tricep Extension',
    'Close-Grip Bench Press',
    'Dips',
  ],
  abs: [
    'Plank',
    'Crunches',
    'Hanging Leg Raise',
    'Russian Twist',
    'Bicycle Crunch',
    'Cable Crunch',
    'Mountain Climbers',
    'V-Ups',
    'Ab Wheel Rollout',
    'Side Plank',
  ],
};
