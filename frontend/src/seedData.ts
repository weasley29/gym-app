export type Category = {
  id: string;
  name: string;
  image: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  {
    id: 'chest',
    name: 'Chest',
    image:
      'https://images.unsplash.com/photo-1692372372344-41aed374b848?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwyfHxiZW5jaCUyMHByZXNzJTIwZHVtYmJlbGwlMjBneW18ZW58MHx8fHwxNzc2Njk0NDg5fDA&ixlib=rb-4.1.0&q=85',
    icon: 'fitness',
  },
  {
    id: 'back',
    name: 'Back',
    image:
      'https://images.pexels.com/photos/7187945/pexels-photo-7187945.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    icon: 'body',
  },
  {
    id: 'legs',
    name: 'Legs',
    image:
      'https://images.pexels.com/photos/11191173/pexels-photo-11191173.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    icon: 'walk',
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    image:
      'https://images.unsplash.com/photo-1734630341082-0fec0e10126c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwyfHxneW0lMjB3b3Jrb3V0JTIwZGFyayUyMGxpZ2h0aW5nfGVufDB8fHx8MTc3NjY5NDQ4OXww&ixlib=rb-4.1.0&q=85',
    icon: 'barbell',
  },
  {
    id: 'arms',
    name: 'Arms',
    image:
      'https://images.unsplash.com/photo-1758875570005-52f6fff50854?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxwdWxsJTIwdXAlMjBjb3JlJTIwd29ya291dCUyMGd5bXxlbnwwfHx8fDE3NzY2OTQ0ODl8MA&ixlib=rb-4.1.0&q=85',
    icon: 'hand-left',
  },
  {
    id: 'abs',
    name: 'Abs',
    image:
      'https://images.unsplash.com/photo-1765302741884-e846c7a178df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwzfHxwdWxsJTIwdXAlMjBjb3JlJTIwd29ya291dCUyMGd5bXxlbnwwfHx8fDE3NzY2OTQ0ODl8MA&ixlib=rb-4.1.0&q=85',
    icon: 'flame',
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
